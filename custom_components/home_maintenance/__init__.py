"""Support for Home Maintenance platform."""

import logging
from datetime import datetime, timedelta
from typing import cast

from homeassistant.components.binary_sensor import DOMAIN as PLATFORM
from homeassistant.components.tag.const import EVENT_TAG_SCANNED
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, ServiceCall, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_registry import RegistryEntry  # noqa: TC002
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.typing import ConfigType
from homeassistant.util import dt as dt_util

from . import const
from .panel import (
    async_register_panel,
    async_unregister_panel,
)
from .store import TaskStore
from .websocket import async_register_websockets

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = const.CONFIG_SCHEMA

# Check calendar events every 30 minutes
CALENDAR_CHECK_INTERVAL = timedelta(minutes=30)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:  # noqa: ARG001
    """Track states and offer events for sensors."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the Home Maintenance config entry."""

    @callback
    def handle_tag_scanned_event(event: Event) -> None:
        """Handle when a tag is scanned."""
        tag_id = event.data.get("tag_id")  # Actually tag UUID

        store = hass.data[const.DOMAIN].get("store")
        tasks = store.get_by_tag_uuid(tag_id)
        if not tasks:
            return

        _LOGGER.debug("Tag scanned: %s", tag_id)

        for task in tasks:
            task_id = task["id"]
            store.update_last_performed(task_id)

    @callback
    def handle_dst_event(event: Event) -> None:
        """Handle daylight saving time change event to mark DST-triggered tasks as due."""
        store = hass.data[const.DOMAIN].get("store")
        if not store:
            return

        _LOGGER.debug("DST change detected, checking for DST-triggered tasks")

        for task_data in store.get_all():
            if task_data.get("dst_trigger"):
                task_id = task_data["id"]
                entity = hass.data[const.DOMAIN]["entities"].get(task_id)
                if entity:
                    # Mark the task as due by setting its binary sensor state
                    entity.task["_dst_triggered"] = True
                    hass.async_create_task(
                        entity.async_update_ha_state(force_refresh=True)
                    )
                    _LOGGER.info(
                        "DST trigger activated for task: %s", task_data.get("title")
                    )

    async def async_check_calendar_events(now: datetime) -> None:  # noqa: ARG001
        """Periodically check calendar entities for matching events."""
        store = hass.data[const.DOMAIN].get("store")
        if not store:
            return

        for task_data in store.get_all():
            calendar_entity = task_data.get("calendar_entity")
            calendar_keyword = task_data.get("calendar_keyword")

            if not calendar_entity or not calendar_keyword:
                continue

            # Check if the calendar entity exists
            state = hass.states.get(calendar_entity)
            if state is None:
                continue

            try:
                # Use the calendar API to get events for the next 7 days
                start = dt_util.now()
                end = start + timedelta(days=7)
                result = await hass.services.async_call(
                    "calendar",
                    "get_events",
                    {"entity_id": calendar_entity, "start_date_time": start.isoformat(), "end_date_time": end.isoformat()},
                    blocking=True,
                    return_response=True,
                )

                if not result:
                    continue

                events = result.get(calendar_entity, {}).get("events", [])
                keyword_lower = calendar_keyword.lower()

                for event in events:
                    summary = event.get("summary", "").lower()
                    if keyword_lower in summary:
                        task_id = task_data["id"]
                        entity = hass.data[const.DOMAIN]["entities"].get(task_id)
                        if entity:
                            entity.task["_calendar_triggered"] = True
                            hass.async_create_task(
                                entity.async_update_ha_state(force_refresh=True)
                            )
                            _LOGGER.info(
                                "Calendar trigger activated for task: %s (matched '%s' in '%s')",
                                task_data.get("title"),
                                calendar_keyword,
                                event.get("summary"),
                            )
                        break
            except Exception:
                _LOGGER.debug(
                    "Failed to check calendar events for %s", calendar_entity,
                    exc_info=True,
                )

    # Initialize and load stored tasks
    task_store = TaskStore(hass)
    await task_store.async_load()

    # Register Device
    device_registry = dr.async_get(hass)
    device = device_registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(const.DOMAIN, const.DEVICE_KEY)},
        name=const.NAME,
        model=const.NAME,
        sw_version=const.VERSION,
        manufacturer=const.MANUFACTURER,
    )

    hass.data.setdefault(const.DOMAIN, {})
    hass.data[const.DOMAIN] = {
        "add_entities": None,
        "entry_id": entry.entry_id,
        "device_id": device.id,
        "store": task_store,
        "entities": {},
    }

    await hass.config_entries.async_forward_entry_setups(entry, [PLATFORM])

    # Register the panel (frontend)
    await async_register_panel(hass, entry)

    # Websocket support
    await async_register_websockets(hass)

    # Register custom services
    register_services(hass)

    # Register event listener for tag scanned
    unsub_tag = hass.bus.async_listen(EVENT_TAG_SCANNED, handle_tag_scanned_event)
    hass.data[const.DOMAIN]["unsub_tag_scanned"] = unsub_tag

    # Register DST change event listener
    unsub_dst = hass.bus.async_listen("clock_changed", handle_dst_event)
    hass.data[const.DOMAIN]["unsub_dst"] = unsub_dst

    # Register periodic calendar event check
    unsub_calendar = async_track_time_interval(
        hass, async_check_calendar_events, CALENDAR_CHECK_INTERVAL
    )
    hass.data[const.DOMAIN]["unsub_calendar"] = unsub_calendar

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload Home Maintenance config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, [PLATFORM])
    if not unload_ok:
        return False

    if "unsub_tag_scanned" in hass.data[const.DOMAIN]:
        hass.data[const.DOMAIN]["unsub_tag_scanned"]()
    if "unsub_dst" in hass.data[const.DOMAIN]:
        hass.data[const.DOMAIN]["unsub_dst"]()
    if "unsub_calendar" in hass.data[const.DOMAIN]:
        hass.data[const.DOMAIN]["unsub_calendar"]()

    async_unregister_panel(hass)
    hass.data.pop(const.DOMAIN, None)
    return True


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle reload of a config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:  # noqa: ARG001
    """Remove Home Maintenance config entry."""
    async_unregister_panel(hass)
    del hass.data[const.DOMAIN]


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:  # noqa: ARG001
    """Handle migration of config entry."""
    return True


@callback
def register_services(hass: HomeAssistant) -> None:
    """Register services used by home maintenance component."""

    async def async_srv_reset(call: ServiceCall) -> None:
        entity_id = call.data["entity_id"]
        performed_date_str = call.data.get("performed_date")

        performed_date = None
        if performed_date_str is not None:
            parsed_date = dt_util.parse_date(performed_date_str)
            if parsed_date is None:
                msg = f"Could not parse performed_date: {performed_date_str}"
                raise ValueError(msg)
            combined_date = datetime.combine(parsed_date, datetime.min.time())
            performed_date = dt_util.as_local(combined_date)

        entity_registry = er.async_get(hass)
        entry = cast("RegistryEntry", entity_registry.async_get(entity_id))
        task_id = entry.unique_id
        entity = hass.data[const.DOMAIN]["entities"].get(task_id)
        if entity is None:
            return

        store = hass.data[const.DOMAIN].get("store")
        store.update_last_performed(task_id, performed_date)

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_RESET,
        async_srv_reset,
        schema=const.SERVICE_RESET_SCHEMA,
    )
