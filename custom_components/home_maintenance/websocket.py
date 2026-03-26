"""Websocket commands for the Home Maintenance integration."""

import uuid
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api import connection, messages
from homeassistant.core import HomeAssistant, callback
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .store import HomeMaintenanceTask


@callback
def websocket_get_tasks(
    hass: HomeAssistant, connection: connection.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Get all tasks."""
    store = hass.data[DOMAIN].get("store")
    result = store.get_all()
    connection.send_result(msg["id"], result)


@callback
def websocket_get_task(
    hass: HomeAssistant, connection: connection.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Get single tasks."""
    store = hass.data[DOMAIN].get("store")
    task_id = msg["task_id"]
    result = store.get(task_id)
    connection.send_result(msg["id"], result)


@callback
def websocket_add_task(
    hass: HomeAssistant, connection: connection.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Add a new task."""
    store = hass.data[DOMAIN].get("store")

    last_str = msg.get("last_performed")
    if last_str:
        parsed = dt_util.parse_datetime(last_str)
        if parsed is None:
            connection.send_error(
                msg["id"], "invalid_date", f"Could not parse date: {last_str}"
            )
            return
        parsed_local = dt_util.as_local(parsed)
        last_performed = parsed_local.replace(
            hour=0, minute=0, second=0, microsecond=0
        ).isoformat()
    else:
        last_performed = (
            dt_util.now().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        )

    schedule_type = msg.get("schedule_type", "interval")

    new_task = HomeMaintenanceTask(
        id=f"home_maintenance_{uuid.uuid4().hex}",
        title=msg["title"],
        interval_value=msg.get("interval_value", 0),
        interval_type=msg.get("interval_type", "days"),
        last_performed=last_performed,
        tag_id=msg.get("tag_id"),
        icon=msg.get("icon"),
        notes=msg.get("notes"),
        assigned_to=msg.get("assigned_to"),
        schedule_type=schedule_type,
        next_due_date=msg.get("next_due_date"),
        annual_recurrence=msg.get("annual_recurrence", False),
        calendar_entity=msg.get("calendar_entity"),
        calendar_keyword=msg.get("calendar_keyword"),
        dst_trigger=msg.get("dst_trigger", False),
    )

    labels = msg.get("labels", [])
    new_id = store.add(new_task, labels)
    connection.send_result(msg["id"], {"success": True, "id": new_id})


@callback
def websocket_update_task(
    hass: HomeAssistant, connection: connection.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Update a tasks values."""
    store = hass.data[DOMAIN].get("store")
    task_id = msg["task_id"]
    updates = msg.get("updates", {})

    last_str = updates["last_performed"]
    if last_str:
        parsed = dt_util.parse_datetime(last_str)
        if parsed is None:
            connection.send_error(
                msg["id"], "invalid_date", f"Could not parse date: {last_str}"
            )
            return
        parsed_local = dt_util.as_local(parsed)
        last_performed = parsed_local.replace(
            hour=0, minute=0, second=0, microsecond=0
        ).isoformat()
    else:
        last_performed = (
            dt_util.now().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        )
    updates["last_performed"] = last_performed

    store.update_task(task_id, updates)
    connection.send_result(msg["id"], {"success": True})


@callback
def websocket_complete_task(
    hass: HomeAssistant, connection: connection.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Mark a task as completed."""
    store = hass.data[DOMAIN].get("store")
    task_id = msg["task_id"]
    completed_by = msg.get("completed_by")
    completion_note = msg.get("completion_note")
    store.update_last_performed(
        task_id, completed_by=completed_by, completion_note=completion_note
    )
    connection.send_result(msg["id"], {"success": True})


@callback
def websocket_remove_task(
    hass: HomeAssistant, connection: connection.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Remove a task."""
    store = hass.data[DOMAIN].get("store")
    task_id = msg["task_id"]
    store.delete(task_id)
    connection.send_result(msg["id"], {"success": True})


@callback
def websocket_get_config(
    hass: HomeAssistant, connection: connection.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Retrieve integration configuration."""
    entries = hass.config_entries.async_entries(DOMAIN)

    if not entries:
        connection.send_error(
            msg["id"], "not_found", "No config entry found for your_domain"
        )
        return

    entry = entries[0]

    connection.send_result(
        msg["id"],
        {
            "data": dict(entry.data),
            "options": dict(entry.options),
        },
    )


async def async_register_websockets(hass: HomeAssistant) -> None:
    """Register websocket commands."""
    websocket_api.async_register_command(
        hass,
        "home_maintenance/get_tasks",
        websocket_get_tasks,
        messages.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): "home_maintenance/get_tasks"}
        ),
    )

    websocket_api.async_register_command(
        hass,
        "home_maintenance/get_task",
        websocket_get_task,
        messages.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "home_maintenance/get_task",
                vol.Required("task_id"): str,
            }
        ),
    )

    websocket_api.async_register_command(
        hass,
        "home_maintenance/add_task",
        websocket_add_task,
        messages.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "home_maintenance/add_task",
                vol.Required("title"): str,
                vol.Optional("interval_value"): int,
                vol.Optional("interval_type"): str,
                vol.Optional("last_performed"): str,
                vol.Optional("tag_id"): str,
                vol.Optional("icon"): str,
                vol.Optional("notes"): str,
                vol.Optional("assigned_to"): str,
                vol.Optional("schedule_type"): str,
                vol.Optional("next_due_date"): str,
                vol.Optional("annual_recurrence"): bool,
                vol.Optional("calendar_entity"): str,
                vol.Optional("calendar_keyword"): str,
                vol.Optional("dst_trigger"): bool,
                vol.Optional("labels"): [str],
            }
        ),
    )

    websocket_api.async_register_command(
        hass,
        "home_maintenance/update_task",
        websocket_update_task,
        messages.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "home_maintenance/update_task",
                vol.Required("task_id"): str,
                vol.Required("updates"): dict,
            }
        ),
    )

    websocket_api.async_register_command(
        hass,
        "home_maintenance/complete_task",
        websocket_complete_task,
        messages.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "home_maintenance/complete_task",
                vol.Required("task_id"): str,
                vol.Optional("completed_by"): str,
                vol.Optional("completion_note"): str,
            }
        ),
    )

    websocket_api.async_register_command(
        hass,
        "home_maintenance/remove_task",
        websocket_remove_task,
        messages.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "home_maintenance/remove_task",
                vol.Required("task_id"): str,
            }
        ),
    )

    websocket_api.async_register_command(
        hass,
        "home_maintenance/get_config",
        websocket_get_config,
        messages.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): "home_maintenance/get_config",
            }
        ),
    )
