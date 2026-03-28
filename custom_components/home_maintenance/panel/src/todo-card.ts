import { LitElement, html, css, nothing, PropertyValues, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";

interface CompletionRecord {
    timestamp: string;
    completed_by?: string | null;
    note?: string | null;
}

interface Task {
    id: string;
    title: string;
    interval_value: number;
    interval_type: string;
    last_performed: string;
    icon?: string;
    notes?: string;
    assigned_to?: string;
    schedule_type?: string;
    next_due_date?: string;
    annual_recurrence?: boolean;
    completion_history?: CompletionRecord[];
    tag_id?: string;
    calendar_entity?: string;
    calendar_keyword?: string;
    dst_trigger?: boolean;
}

interface ComputedTask {
    raw: Task;
    nextDue: Date;
    daysUntilDue: number;
    status: "overdue" | "due_soon" | "upcoming";
    completedToday: boolean;
}

interface CardConfig {
    title?: string;
    due_soon_days?: number;
    max_items?: number;
    show_search?: boolean;
}

const DEFAULT_CONFIG: CardConfig = {
    title: "Home Maintenance",
    due_soon_days: 14,
    max_items: 0,
    show_search: true,
};

const DUE_SOON_DAYS = 14;

class HomeMaintenanceTodoCard extends LitElement {
    @property({ attribute: false }) hass: any;
    @state() private _config: CardConfig = DEFAULT_CONFIG;
    @state() private _tasks: Task[] = [];
    @state() private _completing: Set<string> = new Set();
    @state() private _expandedTasks: Set<string> = new Set();
    @state() private _searchQuery = "";
    @state() private _assigneeFilter = "";
    private _connected = false;
    private _refreshInterval: number | undefined;

    setConfig(config: CardConfig) {
        this._config = { ...DEFAULT_CONFIG, ...config };
    }

    static getConfigElement() {
        return document.createElement("home-maintenance-todo-card-editor");
    }

    static getStubConfig() {
        return { title: "Home Maintenance", due_soon_days: 14 };
    }

    getCardSize() {
        return 3 + this._tasks.length;
    }

    connectedCallback() {
        super.connectedCallback();
        this._connected = true;
        this._loadTasks();
        this._refreshInterval = window.setInterval(() => this._loadTasks(), 60000);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._connected = false;
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
            this._refreshInterval = undefined;
        }
    }

    updated(changedProps: PropertyValues) {
        if (changedProps.has("hass") && this._tasks.length === 0) {
            this._loadTasks();
        }
    }

    private async _loadTasks() {
        if (!this.hass || !this._connected) return;
        try {
            this._tasks = await this.hass.callWS({ type: "home_maintenance/get_tasks" });
        } catch {
            // Integration may not be loaded yet
        }
    }

    // --- Compute ---

    private _computeTask(task: Task): ComputedTask {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        let nextDue: Date;

        if (task.schedule_type === "fixed_date" && task.next_due_date) {
            const [datePart] = task.next_due_date.split("T");
            const [year, month, day] = datePart.split("-").map(Number);
            nextDue = new Date(year, month - 1, day);
        } else {
            const [datePart] = task.last_performed.split("T");
            const [year, month, day] = datePart.split("-").map(Number);
            nextDue = new Date(year, month - 1, day);

            switch (task.interval_type) {
                case "days":
                    nextDue.setDate(nextDue.getDate() + task.interval_value);
                    break;
                case "weeks":
                    nextDue.setDate(nextDue.getDate() + task.interval_value * 7);
                    break;
                case "months":
                    nextDue.setMonth(nextDue.getMonth() + task.interval_value);
                    break;
                case "years":
                    nextDue.setFullYear(nextDue.getFullYear() + task.interval_value);
                    break;
            }
        }
        nextDue.setHours(0, 0, 0, 0);

        const diffMs = nextDue.getTime() - now.getTime();
        const daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const dueSoonDays = this._config.due_soon_days ?? DUE_SOON_DAYS;

        let status: "overdue" | "due_soon" | "upcoming";
        if (daysUntilDue <= 0) status = "overdue";
        else if (daysUntilDue <= dueSoonDays) status = "due_soon";
        else status = "upcoming";

        // Check if completed today
        let completedToday = false;
        if (task.last_performed) {
            const [lpPart] = task.last_performed.split("T");
            const [lpY, lpM, lpD] = lpPart.split("-").map(Number);
            const lastDone = new Date(lpY, lpM - 1, lpD);
            lastDone.setHours(0, 0, 0, 0);
            completedToday = lastDone.getTime() === now.getTime();
        }

        return { raw: task, nextDue, daysUntilDue, status, completedToday };
    }

    private get _filteredTasks(): ComputedTask[] {
        let tasks = this._tasks.map(t => this._computeTask(t));

        if (this._searchQuery.trim()) {
            const q = this._searchQuery.toLowerCase();
            tasks = tasks.filter(t =>
                t.raw.title.toLowerCase().includes(q) ||
                (t.raw.notes && t.raw.notes.toLowerCase().includes(q)) ||
                (t.raw.assigned_to && this._getPersonName(t.raw.assigned_to).toLowerCase().includes(q))
            );
        }

        if (this._assigneeFilter) {
            tasks = tasks.filter(t => t.raw.assigned_to === this._assigneeFilter);
        }

        return tasks;
    }

    private _groupTasks(tasks: ComputedTask[]) {
        const overdue: ComputedTask[] = [];
        const due_soon: ComputedTask[] = [];
        const upcoming: ComputedTask[] = [];

        for (const task of tasks) {
            if (task.status === "overdue") overdue.push(task);
            else if (task.status === "due_soon") due_soon.push(task);
            else upcoming.push(task);
        }

        const byDate = (a: ComputedTask, b: ComputedTask) => a.nextDue.getTime() - b.nextDue.getTime();
        overdue.sort(byDate);
        due_soon.sort(byDate);
        upcoming.sort(byDate);

        return { overdue, due_soon, upcoming };
    }

    private get _uniqueAssignees(): string[] {
        const assignees = new Set<string>();
        for (const task of this._tasks) {
            if (task.assigned_to?.trim()) assignees.add(task.assigned_to.trim());
        }
        return Array.from(assignees).sort();
    }

    // --- Helpers ---

    private _formatDaysLabel(days: number): string {
        if (days === 0) return "Due today";
        if (days < 0) {
            const abs = Math.abs(days);
            return abs === 1 ? "1 day overdue" : `${abs} days overdue`;
        }
        return days === 1 ? "Due in 1 day" : `${days} days left`;
    }

    private _formatDate(date: Date): string {
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const y = date.getFullYear();
        return `${m}/${d}/${y}`;
    }

    private _formatHistoryDate(dateStr: string): string {
        const [datePart] = dateStr.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        return `${month}/${day}/${year}`;
    }

    private _getPersonName(entityId: string): string {
        if (!this.hass || !entityId) return entityId || "";
        const s = this.hass.states[entityId];
        return s?.attributes?.friendly_name || entityId.replace("person.", "");
    }

    private _getIntervalLabel(task: Task): string {
        if (task.schedule_type === "fixed_date") {
            return "Fixed date" + (task.annual_recurrence ? " (Annual)" : "");
        }
        const val = task.interval_value;
        const type = task.interval_type;
        const isSingular = val === 1;
        const label = isSingular ? type.slice(0, -1) : type;
        return `${val} ${label.charAt(0).toUpperCase() + label.slice(1)}`;
    }

    // --- Actions ---

    private async _completeTask(taskId: string) {
        if (this._completing.has(taskId)) return;
        const next = new Set(this._completing);
        next.add(taskId);
        this._completing = next;

        try {
            await this.hass.callWS({ type: "home_maintenance/complete_task", task_id: taskId });
            await this._loadTasks();
        } catch (e) {
            console.error("Failed to complete task:", e);
        }

        const after = new Set(this._completing);
        after.delete(taskId);
        this._completing = after;
    }

    private async _removeTask(taskId: string) {
        if (!confirm("Remove this task?")) return;
        try {
            await this.hass.callWS({ type: "home_maintenance/remove_task", task_id: taskId });
            await this._loadTasks();
        } catch (e) {
            console.error("Failed to remove task:", e);
        }
    }

    private _toggleExpand(taskId: string) {
        const next = new Set(this._expandedTasks);
        if (next.has(taskId)) next.delete(taskId);
        else next.add(taskId);
        this._expandedTasks = next;
    }

    private _openPanel() {
        window.location.href = "/home-maintenance";
    }

    // --- Render ---

    render() {
        if (!this.hass) return html``;

        const filtered = this._filteredTasks;
        const groups = this._groupTasks(filtered);
        const maxItems = this._config.max_items ?? 0;
        const showSearch = this._config.show_search ?? true;

        // Apply max_items across all groups
        let allTasks = [...groups.overdue, ...groups.due_soon, ...groups.upcoming];
        if (maxItems > 0) allTasks = allTasks.slice(0, maxItems);

        // Re-split after limiting
        const overdue = allTasks.filter(t => t.status === "overdue");
        const dueSoon = allTasks.filter(t => t.status === "due_soon");
        const upcoming = allTasks.filter(t => t.status === "upcoming");

        return html`
            <ha-card>
                ${this._config.title ? html`
                    <div class="card-header">
                        <span class="title">${this._config.title}</span>
                        <ha-icon-button
                            class="panel-link"
                            @click=${this._openPanel}
                            title="Open full panel"
                        >
                            <ha-icon icon="mdi:open-in-new"></ha-icon>
                        </ha-icon-button>
                    </div>
                ` : nothing}

                ${showSearch ? html`
                    <div class="filter-bar">
                        <div class="search-box">
                            <ha-icon icon="mdi:magnify" class="search-icon"></ha-icon>
                            <input
                                type="text"
                                .value=${this._searchQuery}
                                @input=${(e: Event) => this._searchQuery = (e.target as HTMLInputElement).value}
                                placeholder="Search tasks..."
                            />
                            ${this._searchQuery ? html`
                                <ha-icon-button @click=${() => this._searchQuery = ""}>
                                    <ha-icon icon="mdi:close"></ha-icon>
                                </ha-icon-button>
                            ` : nothing}
                        </div>
                        ${this._uniqueAssignees.length > 0 ? html`
                            <select
                                class="assignee-filter"
                                .value=${this._assigneeFilter}
                                @change=${(e: Event) => this._assigneeFilter = (e.target as HTMLSelectElement).value}
                            >
                                <option value="">All assignees</option>
                                ${this._uniqueAssignees.map(a => html`
                                    <option value=${a} ?selected=${this._assigneeFilter === a}>${this._getPersonName(a)}</option>
                                `)}
                            </select>
                        ` : nothing}
                    </div>
                ` : nothing}

                <div class="task-list">
                    ${overdue.length > 0 ? html`
                        <div class="group-header group-overdue">
                            <span class="group-dot dot-overdue"></span>
                            OVERDUE
                            <span class="group-count">(${overdue.length})</span>
                        </div>
                        ${overdue.map(t => this._renderTaskCard(t))}
                    ` : nothing}

                    ${dueSoon.length > 0 ? html`
                        <div class="group-header group-due-soon">
                            <span class="group-dot dot-due-soon"></span>
                            DUE SOON
                            <span class="group-count">(${dueSoon.length})</span>
                        </div>
                        ${dueSoon.map(t => this._renderTaskCard(t))}
                    ` : nothing}

                    ${upcoming.length > 0 ? html`
                        <div class="group-header group-upcoming">
                            <span class="group-dot dot-upcoming"></span>
                            UPCOMING
                            <span class="group-count">(${upcoming.length})</span>
                        </div>
                        ${upcoming.map(t => this._renderTaskCard(t))}
                    ` : nothing}

                    ${allTasks.length === 0 ? html`
                        <div class="empty">No tasks found</div>
                    ` : nothing}
                </div>
            </ha-card>
        `;
    }

    private _renderTaskCard(ct: ComputedTask): TemplateResult {
        const task = ct.raw;
        const isExpanded = this._expandedTasks.has(task.id);
        const isCompleting = this._completing.has(task.id);

        return html`
            <div class="task-card ${ct.status} ${isCompleting ? "completing" : ""} ${ct.completedToday ? "done-today" : ""}">
                <div class="task-card-main" @click=${() => this._toggleExpand(task.id)}>
                    <div class="task-left">
                        ${ct.completedToday ? html`
                            <ha-icon class="task-icon done-check" icon="mdi:check-circle"></ha-icon>
                        ` : task.icon ? html`<ha-icon class="task-icon" .icon=${task.icon}></ha-icon>` : nothing}
                        <div class="task-info">
                            <div class="task-title">${task.title}${ct.completedToday ? html`<span class="done-badge">Done</span>` : nothing}</div>
                            <div class="task-meta">
                                <span class="task-interval">${this._getIntervalLabel(task)}</span>
                                ${task.assigned_to ? html`
                                    <span class="task-assignee">${this._getPersonName(task.assigned_to)}</span>
                                ` : nothing}
                            </div>
                        </div>
                    </div>
                    <div class="task-right">
                        <div class="task-due-info">
                            <span class="due-date">${this._formatDate(ct.nextDue)}</span>
                            <span class="due-days ${ct.status}">${this._formatDaysLabel(ct.daysUntilDue)}</span>
                        </div>
                        <div class="task-actions">
                            <ha-icon-button
                                @click=${(e: Event) => { e.stopPropagation(); this._completeTask(task.id); }}
                                title="Complete"
                                ?disabled=${isCompleting}
                            >
                                <ha-icon icon="mdi:check-circle-outline"></ha-icon>
                            </ha-icon-button>
                            <ha-icon-button
                                @click=${(e: Event) => { e.stopPropagation(); this._openPanel(); }}
                                title="Edit"
                            >
                                <ha-icon icon="mdi:pencil"></ha-icon>
                            </ha-icon-button>
                            <ha-icon-button
                                @click=${(e: Event) => { e.stopPropagation(); this._removeTask(task.id); }}
                                title="Remove"
                            >
                                <ha-icon icon="mdi:delete"></ha-icon>
                            </ha-icon-button>
                            <ha-icon-button
                                @click=${(e: Event) => { e.stopPropagation(); this._toggleExpand(task.id); }}
                            >
                                <ha-icon icon=${isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
                            </ha-icon-button>
                        </div>
                    </div>
                </div>

                ${isExpanded ? html`
                    <div class="task-expanded">
                        ${task.notes ? html`
                            <div class="task-section">
                                <div class="section-label">Notes</div>
                                <div class="section-content notes-content">${task.notes}</div>
                            </div>
                        ` : nothing}

                        <div class="task-section">
                            <div class="section-label">Last Performed</div>
                            <div class="section-content">
                                ${task.last_performed ? this._formatHistoryDate(task.last_performed) : "-"}
                            </div>
                        </div>

                        ${task.completion_history && task.completion_history.length > 0 ? html`
                            <div class="task-section">
                                <div class="section-label">Completion History</div>
                                <div class="history-list">
                                    ${task.completion_history.slice().reverse().map(record => html`
                                        <div class="history-item">
                                            <span class="history-date">${this._formatHistoryDate(record.timestamp)}</span>
                                            ${record.completed_by ? html`
                                                <span class="history-who">${record.completed_by}</span>
                                            ` : nothing}
                                            ${record.note ? html`
                                                <span class="history-note">${record.note}</span>
                                            ` : nothing}
                                        </div>
                                    `)}
                                </div>
                            </div>
                        ` : nothing}
                    </div>
                ` : nothing}
            </div>
        `;
    }

    static styles = css`
        :host {
            --todo-overdue: var(--error-color, #db4437);
            --todo-due-soon: var(--warning-color, #ffa726);
            --todo-upcoming: var(--success-color, #43a047);
        }

        ha-card {
            overflow: hidden;
        }

        /* Header */
        .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 8px 0 16px;
        }

        .card-header .title {
            font-size: 18px;
            font-weight: 500;
            color: var(--primary-text-color);
        }

        .panel-link {
            --mdc-icon-button-size: 36px;
            color: var(--secondary-text-color);
        }

        /* Filter bar */
        .filter-bar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px 0;
            flex-wrap: wrap;
        }

        .search-box {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 150px;
            background: var(--secondary-background-color);
            border: 1px solid var(--divider-color);
            border-radius: 8px;
            padding: 4px 10px;
        }

        .search-icon {
            color: var(--secondary-text-color);
            margin-right: 6px;
            --mdc-icon-size: 20px;
            flex-shrink: 0;
        }

        .search-box input {
            border: none;
            outline: none;
            background: transparent;
            color: var(--primary-text-color);
            font-size: 14px;
            flex: 1;
            padding: 6px 0;
        }

        .search-box input::placeholder {
            color: var(--secondary-text-color);
        }

        .search-box ha-icon-button {
            --mdc-icon-button-size: 28px;
            color: var(--secondary-text-color);
        }

        .assignee-filter {
            background: var(--secondary-background-color);
            border: 1px solid var(--divider-color);
            border-radius: 8px;
            padding: 8px 10px;
            color: var(--primary-text-color);
            font-size: 13px;
        }

        /* Task list */
        .task-list {
            padding: 8px 0 12px;
        }

        /* Group headers */
        .group-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.5px;
            padding: 12px 16px 6px;
        }

        .group-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .dot-overdue { background: var(--todo-overdue); }
        .dot-due-soon { background: var(--todo-due-soon); }
        .dot-upcoming { background: var(--todo-upcoming); }

        .group-overdue { color: var(--todo-overdue); }
        .group-due-soon { color: var(--todo-due-soon); }
        .group-upcoming { color: var(--todo-upcoming); }

        .group-count {
            font-weight: 400;
            opacity: 0.7;
        }

        /* Task cards */
        .task-card {
            background: var(--card-background-color, var(--ha-card-background, white));
            border-radius: 12px;
            margin: 6px 12px;
            border-left: 4px solid transparent;
            box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0,0,0,0.14));
            overflow: hidden;
            transition: box-shadow 0.2s ease, opacity 0.3s ease;
        }

        .task-card:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .task-card.overdue { border-left-color: var(--todo-overdue); }
        .task-card.due_soon { border-left-color: var(--todo-due-soon); }
        .task-card.upcoming { border-left-color: var(--todo-upcoming); }

        .task-card.completing { opacity: 0.4; }

        .task-card.done-today {
            opacity: 0.55;
            border-left-color: var(--secondary-text-color) !important;
        }

        .task-card.done-today .task-title {
            text-decoration: line-through;
            color: var(--secondary-text-color);
        }

        .done-check {
            color: var(--todo-upcoming) !important;
        }

        .done-badge {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            background: var(--todo-upcoming);
            color: var(--text-primary-color, white);
            border-radius: 4px;
            padding: 1px 6px;
            margin-left: 8px;
            text-decoration: none;
            display: inline-block;
            vertical-align: middle;
            letter-spacing: 0.3px;
        }

        .task-card-main {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 6px 10px 14px;
            cursor: pointer;
            gap: 8px;
        }

        .task-left {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            min-width: 0;
        }

        .task-icon {
            flex-shrink: 0;
            color: var(--secondary-text-color);
            --mdc-icon-size: 24px;
        }

        .task-info {
            min-width: 0;
            flex: 1;
        }

        .task-title {
            font-size: 15px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .task-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--secondary-text-color);
            margin-top: 2px;
        }

        .task-assignee {
            background: var(--primary-color);
            color: var(--text-primary-color, white);
            border-radius: 10px;
            padding: 1px 8px;
            font-size: 11px;
            font-weight: 500;
        }

        .task-right {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
        }

        .task-due-info {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            white-space: nowrap;
        }

        .due-date {
            font-size: 13px;
            color: var(--secondary-text-color);
        }

        .due-days {
            font-size: 12px;
            font-weight: 600;
        }

        .due-days.overdue { color: var(--todo-overdue); }
        .due-days.due_soon { color: var(--todo-due-soon); }
        .due-days.upcoming { color: var(--todo-upcoming); }

        .task-actions {
            display: flex;
            align-items: center;
        }

        .task-actions ha-icon-button {
            --mdc-icon-button-size: 34px;
            color: var(--secondary-text-color);
        }

        /* Expanded section */
        .task-expanded {
            padding: 0 14px 14px;
            border-top: 1px solid var(--divider-color);
        }

        .task-section {
            margin-top: 10px;
        }

        .section-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--secondary-text-color);
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .section-content {
            font-size: 14px;
        }

        .notes-content {
            white-space: pre-wrap;
            background: var(--secondary-background-color);
            border-radius: 8px;
            padding: 8px 12px;
        }

        .history-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .history-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            padding: 3px 0;
            border-bottom: 1px solid var(--divider-color);
        }

        .history-item:last-child { border-bottom: none; }
        .history-date { color: var(--secondary-text-color); flex-shrink: 0; }
        .history-who { font-weight: 500; }
        .history-note { color: var(--secondary-text-color); font-style: italic; }

        /* Empty state */
        .empty {
            text-align: center;
            padding: 32px 16px;
            color: var(--secondary-text-color);
            font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 600px) {
            .task-card-main {
                flex-wrap: wrap;
            }

            .task-right {
                width: 100%;
                justify-content: space-between;
            }

            .task-actions ha-icon-button {
                --mdc-icon-button-size: 30px;
            }

            .filter-bar {
                flex-direction: column;
                align-items: stretch;
            }

            .search-box {
                min-width: unset;
            }
        }
    `;
}

// --- Config editor ---
class HomeMaintenanceTodoCardEditor extends LitElement {
    @property({ attribute: false }) hass: any;
    @state() private _config: CardConfig = DEFAULT_CONFIG;

    setConfig(config: CardConfig) {
        this._config = { ...DEFAULT_CONFIG, ...config };
    }

    private _valueChanged(key: string, value: any) {
        this._config = { ...this._config, [key]: value };
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config: this._config },
            bubbles: true,
            composed: true,
        }));
    }

    render() {
        return html`
            <div style="padding: 16px;">
                <ha-textfield
                    label="Title"
                    .value=${this._config.title ?? ""}
                    @input=${(e: any) => this._valueChanged("title", e.target.value)}
                    style="width: 100%; margin-bottom: 12px;"
                ></ha-textfield>

                <ha-textfield
                    label="Due Soon Days (threshold)"
                    type="number"
                    .value=${String(this._config.due_soon_days ?? 14)}
                    @input=${(e: any) => this._valueChanged("due_soon_days", parseInt(e.target.value) || 14)}
                    style="width: 100%; margin-bottom: 12px;"
                ></ha-textfield>

                <ha-textfield
                    label="Max Items (0 = no limit)"
                    type="number"
                    .value=${String(this._config.max_items ?? 0)}
                    @input=${(e: any) => this._valueChanged("max_items", parseInt(e.target.value) || 0)}
                    style="width: 100%; margin-bottom: 12px;"
                ></ha-textfield>

                <ha-formfield label="Show Search Bar">
                    <ha-switch
                        .checked=${this._config.show_search ?? true}
                        @change=${(e: any) => this._valueChanged("show_search", e.target.checked)}
                    ></ha-switch>
                </ha-formfield>
            </div>
        `;
    }
}

customElements.define("home-maintenance-todo-card", HomeMaintenanceTodoCard);
customElements.define("home-maintenance-todo-card-editor", HomeMaintenanceTodoCardEditor);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: "home-maintenance-todo-card",
    name: "Home Maintenance Todo",
    description: "A dashboard card mirroring the Home Maintenance panel with grouped tasks, actions, and expandable details",
    preview: true,
});
