# 🏠 Home Maintenance Tracker for Home Assistant

Keep your home in top shape by tracking recurring maintenance tasks right inside Home Assistant!

This custom integration helps you remember important chores like changing air filters, cleaning gutters, or testing smoke alarms — and shows you when they're due.

---

## ✨ What It Does

- 📋 Create recurring **interval-based** tasks (e.g., "Change HVAC filter every 90 days") or **fixed-date** tasks (e.g., "Aerate lawn — September 1, annually")
- 🔔 Creates binary sensor entities in Home Assistant for automations and dashboards
- ✅ Mark tasks as completed with full **completion history** tracking
- 📝 Add **notes** and **assign tasks** to household members
- 📅 Trigger tasks from **calendar events** or **daylight saving time** changes
- 📊 Modern card-based UI grouped by status: **Overdue**, **Due Soon**, **Upcoming**
- 🔍 Search and filter tasks by name, notes, or assignee

---

## 🖼️ Screenshots

- ![Task Panel](screenshots/task-panel.PNG)
- ![Integration Page](screenshots/integration-page.PNG)
- ![Entity Attributes](screenshots/entity-attributes.PNG)

---

## 🛠️ Installation

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=TJPoorman&repository=home_maintenance&category=Integration)

<details>
<summary>Click to show installation instructions</summary>
<ol>
<li>Install files:</li>
<ul>
<li><u>Using HACS:</u><br>
In the HACS panel, search for 'Home Maintenance', open the repository and click 'Download'.</li>
<li><u>Manually:</u><br>
Download the <a href="https://github.com/TJPoorman/home_maintenance/releases">latest release</a> as a zip file and extract it into the `custom_components` folder in your HA installation.</li>
</ul>
<li>Restart HA to load the integration into HA.</li>
<li>Go to Settings -> Devices & services and click 'ADD INTEGRATION' button. Look for Home Maintenance and click to add it.</li>
<li>The Home Maintenance integration is ready for use. You can find the configuration panel in the menu on the left.</li>
</ol>
</details>

---

## 🛠️ How to Use

Open **Home Maintenance** from the Home Assistant sidebar.

### Creating Tasks

Click the **+** button at the top to open the create form. Tasks can be one of two types:

#### Interval-Based Tasks (default)
- Set a title, interval value, and interval type (Days / Weeks / Months / Years)
- The task becomes due when `last_performed + interval` has passed

#### Fixed-Date Tasks
- Switch the schedule type to "Fixed Date"
- Set a specific **next due date**
- Optionally enable **Repeat Annually** to auto-advance to next year on completion

### Optional Fields (expand "Optional settings")

| Field | Description |
|-------|-------------|
| **Last Performed** | When the task was last done (defaults to today) |
| **Icon** | Custom MDI icon for the task |
| **Notes** | Free-text notes visible in the task detail and exposed as entity attribute |
| **Assigned To** | Who is responsible (e.g., "Charlie", "Sarah", "Shared") |
| **Calendar Entity** | A HA calendar entity to watch for matching events |
| **Calendar Keyword** | Keyword to match in calendar event summaries |
| **DST Trigger** | Mark task due when daylight saving time changes |
| **Label(s)** | HA labels for organization |
| **Tag** | NFC tag — task completes when scanned |

### Task List

Tasks are displayed as cards grouped into three sections:
- 🔴 **Overdue** — past due date
- 🟡 **Due Soon** — within 14 days of due date
- 🟢 **Upcoming** — more than 14 days out

Each card shows:
- Task title and icon
- Interval or "Fixed Date" label
- Assignee badge (if set)
- Due date and days remaining/overdue
- Action buttons: Complete, Edit, Delete, Expand

Click a card or the expand arrow to see:
- Notes
- Last performed date
- Completion history (who completed it, when, and any note)

### Search & Filter
- Use the **search bar** to filter by title, notes, or assignee name
- Use the **assignee dropdown** (appears when tasks have assignees) to filter by person

---

## 📋 Task Fields & Entity Attributes

Each task creates a `binary_sensor` entity that is ON when due. The following attributes are exposed:

| Attribute | Description |
|-----------|-------------|
| `last_performed` | ISO date of last completion |
| `interval_value` | Interval number (for interval tasks) |
| `interval_type` | days/weeks/months/years (for interval tasks) |
| `next_due` | ISO date of next due date |
| `schedule_type` | "interval" or "fixed_date" |
| `annual_recurrence` | Boolean (for fixed-date tasks) |
| `notes` | Free-text notes |
| `assigned_to` | Assignee name |
| `tag_id` | NFC tag entity ID |
| `completion_history` | List of last 20 completions (timestamp, completed_by, note) |
| `calendar_entity` | Calendar entity ID being watched |
| `calendar_keyword` | Keyword being matched |
| `dst_trigger` | Whether DST changes trigger this task |

---

## 📅 Calendar & Event Triggers

### Calendar Event Matching
1. Set a **Calendar Entity** (e.g., `calendar.home`) on a task
2. Set a **Calendar Keyword** (e.g., "smoke detector")
3. Every 30 minutes, the integration checks the next 7 days of events
4. If an event summary contains the keyword, the task's sensor turns ON

### DST Trigger
1. Enable **DST Trigger** on a task
2. When Home Assistant fires a `clock_changed` event (daylight saving time), the task's sensor turns ON
3. Great for tasks like "Change smoke detector batteries" or "Adjust clocks"

Both triggers are additive — they work alongside interval and fixed-date scheduling. Completing the task clears the trigger until the next event.

---

## 🔄 Example Tasks

| Task | Type | Schedule | Assignee |
|------|------|----------|----------|
| Change HVAC Filter | Interval | 90 days | Shared |
| Test Smoke Alarms | Interval | 6 months | Charlie |
| Clean Gutters | Interval | 8 weeks | Charlie |
| Aerate Lawn | Fixed Date | Sep 1, annually | Sarah |
| HVAC Tune-up | Fixed Date | Oct 15, annually | Shared |
| Change Smoke Detector Batteries | DST Trigger | On DST change | Charlie |

---

## 🔁 Available Services

### `home_maintenance.reset_last_performed`

Marks a specific task as completed and updates its `last_performed` and `next_due`.

Optionally specify a date for `last_performed`.

#### Example service call:

```yaml
service: home_maintenance.reset_last_performed
data:
  entity_id: binary_sensor.clean_gutters
  performed_date: "2025-06-19"
```

---

## 🔄 Upgrading from v1.x

Version 2.0 is fully backward compatible with existing task data. All new fields (`notes`, `assigned_to`, `schedule_type`, `completion_history`, etc.) default to empty/null, so existing tasks continue to work as interval-based tasks without any migration needed.

The UI has been completely redesigned — the data table has been replaced with grouped task cards. The create form is now hidden behind a + button to keep the view clean.

---

## 💬 Need Help?

Open an issue here on GitHub or ask in the Home Assistant community.

[Home Assistant Community Thread](https://community.home-assistant.io/t/new-integration-home-maintenance-track-recurring-tasks-in-home-assistant/897324)

---

## 📄 License

MIT License – free to use, share, and improve.
