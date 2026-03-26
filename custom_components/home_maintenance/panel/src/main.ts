import {
    mdiCheckCircleOutline,
    mdiDelete,
    mdiPencil,
    mdiChevronDown,
    mdiChevronUp,
    mdiMagnify,
    mdiPlus,
    mdiClose,
} from "@mdi/js";
import { LitElement, html, nothing, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import type { HomeAssistant } from "custom-card-helpers";
import { formatDateNumeric } from "custom-card-helpers";

import { localize } from '../localize/localize';
import { VERSION } from "./const";
import { loadConfigDashboard } from "./helpers";
import { panelStyles } from './styles'
import { EntityRegistryEntry, IntegrationConfig, IntervalType, INTERVAL_TYPES, getIntervalTypeLabels, Label, Task, Tag, CompletionRecord } from './types';
import { completeTask, getConfig, loadLabelRegistry, loadRegistryEntries, loadTags, loadTask, loadTasks, removeTask, saveTask, updateTask } from './data/websockets';

interface TaskFormData {
    title: string;
    schedule_type: string;
    interval_value: number | "";
    interval_type: string;
    last_performed: string;
    next_due_date: string;
    annual_recurrence: boolean;
    icon: string;
    label: string[];
    tag: string;
    notes: string;
    assigned_to: string;
    calendar_entity: string;
    calendar_keyword: string;
    dst_trigger: boolean;
}

interface ComputedTask {
    raw: Task;
    nextDue: Date;
    daysUntilDue: number;
    status: "overdue" | "due_soon" | "upcoming";
}

const DUE_SOON_DAYS = 14;

function emptyFormData(): TaskFormData {
    return {
        title: "",
        schedule_type: "interval",
        interval_value: "",
        interval_type: "days",
        last_performed: "",
        next_due_date: "",
        annual_recurrence: false,
        icon: "",
        label: [],
        tag: "",
        notes: "",
        assigned_to: "",
        calendar_entity: "",
        calendar_keyword: "",
        dst_trigger: false,
    };
}

export class HomeMaintenancePanel extends LitElement {
    @property() hass?: HomeAssistant;
    @property() narrow!: boolean;

    @state() private tags: Tag[] | null = null;
    @state() private tasks: Task[] = [];
    @state() private config: IntegrationConfig | null = null;
    @state() private registry: EntityRegistryEntry[] = [];
    @state() private labelRegistry: Label[] = [];

    // Search and filter state
    @state() private _searchQuery: string = "";
    @state() private _assigneeFilter: string = "";

    // Expanded task cards (set of task IDs)
    @state() private _expandedTasks: Set<string> = new Set();

    // Create form state
    @state() private _showCreateForm: boolean = false;
    @state() private _formData: TaskFormData = emptyFormData();
    private _advancedOpen: boolean = false;

    // Edit dialog state
    @state() private _editingTaskId: string | null = null;
    @state() private _editFormData: TaskFormData = emptyFormData();

    // --- Computed task data ---

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

        let status: "overdue" | "due_soon" | "upcoming";
        if (daysUntilDue <= 0) {
            status = "overdue";
        } else if (daysUntilDue <= DUE_SOON_DAYS) {
            status = "due_soon";
        } else {
            status = "upcoming";
        }

        return { raw: task, nextDue, daysUntilDue, status };
    }

    private get _computedTasks(): ComputedTask[] {
        return this.tasks.map(t => this._computeTask(t));
    }

    private get _filteredTasks(): ComputedTask[] {
        let tasks = this._computedTasks;

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

    private get _uniqueAssignees(): string[] {
        const assignees = new Set<string>();
        for (const task of this.tasks) {
            if (task.assigned_to?.trim()) {
                assignees.add(task.assigned_to.trim());
            }
        }
        return Array.from(assignees).sort();
    }

    private _groupTasks(tasks: ComputedTask[]): { overdue: ComputedTask[], due_soon: ComputedTask[], upcoming: ComputedTask[] } {
        const overdue: ComputedTask[] = [];
        const due_soon: ComputedTask[] = [];
        const upcoming: ComputedTask[] = [];

        for (const task of tasks) {
            if (task.status === "overdue") overdue.push(task);
            else if (task.status === "due_soon") due_soon.push(task);
            else upcoming.push(task);
        }

        // Sort each group by next due date
        const byDate = (a: ComputedTask, b: ComputedTask) => a.nextDue.getTime() - b.nextDue.getTime();
        overdue.sort(byDate);
        due_soon.sort(byDate);
        upcoming.sort(byDate);

        return { overdue, due_soon, upcoming };
    }

    // --- Form schemas ---

    private get _basicSchema() {
        const isFixedDate = this._formData.schedule_type === "fixed_date";
        const schema: any[] = [
            { name: "title", required: true, selector: { text: {} } },
            {
                name: "schedule_type",
                required: true,
                selector: {
                    select: {
                        options: [
                            { value: "interval", label: localize("schedule_types.interval", this.hass!.language) },
                            { value: "fixed_date", label: localize("schedule_types.fixed_date", this.hass!.language) },
                        ],
                        mode: "dropdown",
                    },
                },
            },
        ];

        if (isFixedDate) {
            schema.push(
                { name: "next_due_date", required: true, selector: { date: {} } },
                { name: "annual_recurrence", selector: { boolean: {} } },
            );
        } else {
            schema.push(
                { name: "interval_value", required: true, selector: { number: { min: 1, mode: "box" } } },
                {
                    name: "interval_type",
                    required: true,
                    selector: {
                        select: {
                            options: INTERVAL_TYPES.map((type) => ({
                                value: type,
                                label: getIntervalTypeLabels(this.hass!.language)[type],
                            })),
                            mode: "dropdown"
                        },
                    },
                },
            );
        }

        return schema;
    }

    private get _advancedSchema() {
        return [
            { name: "last_performed", selector: { date: {} } },
            { name: "icon", selector: { icon: {} } },
            { name: "notes", selector: { text: { multiline: true } } },
            { name: "assigned_to", selector: { select: { options: this._personOptions, mode: "dropdown" } } },
            { name: "calendar_entity", selector: { entity: { filter: { domain: "calendar" } } } },
            { name: "calendar_keyword", selector: { text: {} } },
            { name: "dst_trigger", selector: { boolean: {} } },
            { name: "label", selector: { label: { multiple: true } } },
            { name: "tag", selector: { entity: { filter: { domain: "tag" } } } },
        ];
    }

    private get _editSchema() {
        const isFixedDate = this._editFormData.schedule_type === "fixed_date";
        const schema: any[] = [
            {
                name: "schedule_type",
                required: true,
                selector: {
                    select: {
                        options: [
                            { value: "interval", label: localize("schedule_types.interval", this.hass!.language) },
                            { value: "fixed_date", label: localize("schedule_types.fixed_date", this.hass!.language) },
                        ],
                        mode: "dropdown",
                    },
                },
            },
        ];

        if (isFixedDate) {
            schema.push(
                { name: "next_due_date", required: true, selector: { date: {} } },
                { name: "annual_recurrence", selector: { boolean: {} } },
            );
        } else {
            schema.push(
                { name: "interval_value", required: true, selector: { number: { min: 1, mode: "box" } } },
                {
                    name: "interval_type",
                    required: true,
                    selector: {
                        select: {
                            options: INTERVAL_TYPES.map((type) => ({
                                value: type,
                                label: getIntervalTypeLabels(this.hass!.language)[type],
                            })),
                            mode: "dropdown"
                        },
                    },
                },
            );
        }

        schema.push(
            { type: "constant", name: localize('panel.dialog.edit_task.sections.optional', this.hass!.language), disabled: true },
            { name: "last_performed", selector: { date: {} } },
            { name: "icon", selector: { icon: {} } },
            { name: "notes", selector: { text: { multiline: true } } },
            { name: "assigned_to", selector: { select: { options: this._personOptions, mode: "dropdown" } } },
            { name: "calendar_entity", selector: { entity: { filter: { domain: "calendar" } } } },
            { name: "calendar_keyword", selector: { text: {} } },
            { name: "dst_trigger", selector: { boolean: {} } },
            { name: "label", selector: { label: { multiple: true } } },
            { name: "tag", selector: { entity: { filter: { domain: "tag" } } } },
        );

        return schema;
    }

    private _computeLabel = (schema: { name: string }): string => {
        try {
            return localize(`panel.cards.new.fields.${schema.name}.heading`, this.hass!.language) ?? schema.name;
        } catch {
            return schema.name;
        }
    }

    private _computeHelper = (schema: { name: string }): string => {
        try {
            return localize(`panel.cards.new.fields.${schema.name}.helper`, this.hass!.language) ?? "";
        } catch {
            return "";
        }
    }

    private _computeEditLabel = (schema: { name: string }): string => {
        try {
            return localize(`panel.dialog.edit_task.fields.${schema.name}.heading`, this.hass!.language) ?? schema.name;
        } catch {
            return schema.name;
        }
    }

    private _computeEditHelper = (schema: { name: string }): string => {
        try {
            return localize(`panel.dialog.edit_task.fields.${schema.name}.helper`, this.hass!.language) ?? "";
        } catch {
            return "";
        }
    }

    // --- Helpers ---

    private computeISODate(dateStr: string): string {
        if (dateStr) {
            const [yearStr, monthStr, dayStr] = dateStr.split("T")[0].split("-");
            const year = Number(yearStr);
            const month = Number(monthStr);
            const day = Number(dayStr);

            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                const parsedDate = new Date(year, month - 1, day);
                parsedDate.setHours(0, 0, 0, 0);
                return parsedDate.toISOString();
            }
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString();
    }

    private _formatDaysLabel(days: number): string {
        if (days === 0) return localize("panel.status.due_today", this.hass!.language);
        if (days < 0) {
            const abs = Math.abs(days);
            return abs === 1
                ? localize("panel.status.overdue_singular", this.hass!.language)
                : `${abs} ${localize("panel.status.overdue_plural", this.hass!.language)}`;
        }
        return days === 1
            ? localize("panel.status.due_singular", this.hass!.language)
            : `${days} ${localize("panel.status.due_plural", this.hass!.language)}`;
    }

    private get _personOptions(): { value: string; label: string }[] {
        if (!this.hass) return [];
        return Object.keys(this.hass.states)
            .filter(id => id.startsWith("person."))
            .map(id => ({
                value: id,
                label: this.hass!.states[id].attributes?.friendly_name || id.replace("person.", ""),
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }

    private _getPersonName(entityId: string): string {
        if (!this.hass || !entityId) return entityId;
        const state = this.hass.states[entityId];
        return state?.attributes?.friendly_name || entityId.replace("person.", "");
    }

    private _getIntervalLabel(task: Task): string {
        if (task.schedule_type === "fixed_date") {
            return localize("schedule_types.fixed_date", this.hass!.language)
                + (task.annual_recurrence ? ` (${localize("panel.cards.new.fields.annual_recurrence.heading", this.hass!.language)})` : "");
        }
        const type = task.interval_type;
        const isSingular = task.interval_value === 1;
        const labelKey = isSingular ? type.slice(0, -1) : type;
        return `${task.interval_value} ${localize(`intervals.${labelKey}`, this.hass!.language)}`;
    }

    // --- Data loading ---

    private async loadData() {
        await loadConfigDashboard();
        this.tags = await loadTags(this.hass!);
        this.tasks = await loadTasks(this.hass!);
        this.config = await getConfig(this.hass!);
        this.registry = await loadRegistryEntries(this.hass!);
        this.labelRegistry = await loadLabelRegistry(this.hass!);
    }

    private async resetForm() {
        this._formData = emptyFormData();
        this.tasks = await loadTasks(this.hass!);
    }

    connectedCallback() {
        super.connectedCallback();
        this.loadData();
    }

    // --- Render ---

    render() {
        if (!this.hass) return html``;

        if (!this.tasks || !this.tags) {
            return html`<p class="loading">${localize('common.loading', this.hass.language)}</p>`;
        }

        const filtered = this._filteredTasks;
        const groups = this._groupTasks(filtered);

        return html`
            <div class="header">
                <div class="toolbar">
                    <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
                    <div class="main-title">
                        ${this.config?.options.sidebar_title}
                    </div>
                    <div class="version">v${VERSION}</div>
                </div>
            </div>

            <div class="view">
                <!-- Search and filter bar -->
                <div class="filter-bar">
                    <div class="search-box">
                        <ha-svg-icon .path=${mdiMagnify}></ha-svg-icon>
                        <input
                            type="text"
                            .value=${this._searchQuery}
                            @input=${(e: Event) => this._searchQuery = (e.target as HTMLInputElement).value}
                            placeholder="${localize('panel.filter.search', this.hass.language)}"
                        />
                        ${this._searchQuery ? html`
                            <ha-icon-button
                                .path=${mdiClose}
                                @click=${() => this._searchQuery = ""}
                            ></ha-icon-button>
                        ` : nothing}
                    </div>
                    ${this._uniqueAssignees.length > 0 ? html`
                        <select
                            class="assignee-filter"
                            .value=${this._assigneeFilter}
                            @change=${(e: Event) => this._assigneeFilter = (e.target as HTMLSelectElement).value}
                        >
                            <option value="">${localize('panel.filter.all_assignees', this.hass.language)}</option>
                            ${this._uniqueAssignees.map(a => html`
                                <option value=${a} ?selected=${this._assigneeFilter === a}>${this._getPersonName(a)}</option>
                            `)}
                        </select>
                    ` : nothing}
                    <ha-icon-button
                        class="add-button"
                        .path=${mdiPlus}
                        @click=${() => this._showCreateForm = !this._showCreateForm}
                        title="${localize('panel.cards.new.actions.add_task', this.hass.language)}"
                    ></ha-icon-button>
                </div>

                <!-- Create task form (collapsible) -->
                ${this._showCreateForm ? html`
                    <ha-card class="card-new">
                        <div class="card-header">${localize('panel.cards.new.title', this.hass.language)}</div>
                        <div class="card-content">${this.renderForm()}</div>
                    </ha-card>
                ` : nothing}

                <!-- Task groups -->
                ${groups.overdue.length > 0 ? html`
                    <div class="task-group">
                        <div class="group-header group-overdue">
                            <span class="group-dot dot-overdue"></span>
                            ${localize('panel.groups.overdue', this.hass.language)}
                            <span class="group-count">(${groups.overdue.length})</span>
                        </div>
                        ${groups.overdue.map(t => this.renderTaskCard(t))}
                    </div>
                ` : nothing}

                ${groups.due_soon.length > 0 ? html`
                    <div class="task-group">
                        <div class="group-header group-due-soon">
                            <span class="group-dot dot-due-soon"></span>
                            ${localize('panel.groups.due_soon', this.hass.language)}
                            <span class="group-count">(${groups.due_soon.length})</span>
                        </div>
                        ${groups.due_soon.map(t => this.renderTaskCard(t))}
                    </div>
                ` : nothing}

                ${groups.upcoming.length > 0 ? html`
                    <div class="task-group">
                        <div class="group-header group-upcoming">
                            <span class="group-dot dot-upcoming"></span>
                            ${localize('panel.groups.upcoming', this.hass.language)}
                            <span class="group-count">(${groups.upcoming.length})</span>
                        </div>
                        ${groups.upcoming.map(t => this.renderTaskCard(t))}
                    </div>
                ` : nothing}

                ${filtered.length === 0 ? html`
                    <div class="empty-state">${localize('common.no_tasks', this.hass.language)}</div>
                ` : nothing}
            </div>

            ${this.renderEditDialog()}
        `;
    }

    renderForm(): TemplateResult {
        if (!this.hass) return html``;

        return html`
            <ha-form
                .hass=${this.hass}
                .schema=${this._basicSchema}
                .computeLabel=${this._computeLabel.bind(this)}
                .computeHelper=${this._computeHelper.bind(this)}
                .data=${this._formData}
                @value-changed=${(e: CustomEvent) => this._formData = { ...this._formData, ...e.detail.value }}
            ></ha-form>

            <ha-expansion-panel
                header="${localize('panel.cards.new.sections.optional', this.hass.language)}"
                .opened=${this._advancedOpen}
                @opened-changed=${(e: CustomEvent) => (this._advancedOpen = e.detail.value)}
            >
                <ha-form
                    .hass=${this.hass}
                    .data=${this._formData}
                    .schema=${this._advancedSchema}
                    .computeLabel=${this._computeLabel.bind(this)}
                    .computeHelper=${this._computeHelper.bind(this)}
                    @value-changed=${(e: CustomEvent) => this._formData = { ...this._formData, ...e.detail.value }}
                ></ha-form>
            </ha-expansion-panel>

            <div class="form-actions">
                <mwc-button @click=${() => { this._showCreateForm = false; this._formData = emptyFormData(); }}>
                    ${localize('panel.dialog.edit_task.actions.cancel', this.hass.language)}
                </mwc-button>
                <mwc-button @click=${this._handleAddTaskClick}>
                    ${localize('panel.cards.new.actions.add_task', this.hass.language)}
                </mwc-button>
            </div>
        `;
    }

    renderTaskCard(ct: ComputedTask): TemplateResult {
        const task = ct.raw;
        const isExpanded = this._expandedTasks.has(task.id);
        const statusClass = ct.status;

        return html`
            <div class="task-card ${statusClass}">
                <div class="task-card-main" @click=${() => this._toggleExpand(task.id)}>
                    <div class="task-left">
                        ${task.icon ? html`<ha-icon class="task-icon" .icon=${task.icon}></ha-icon>` : nothing}
                        <div class="task-info">
                            <div class="task-title">${task.title}</div>
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
                            <span class="due-date">${formatDateNumeric(ct.nextDue, this.hass!.locale)}</span>
                            <span class="due-days ${statusClass}">${this._formatDaysLabel(ct.daysUntilDue)}</span>
                        </div>
                        <div class="task-actions">
                            <ha-icon-button
                                .path=${mdiCheckCircleOutline}
                                @click=${(e: Event) => { e.stopPropagation(); this._handleCompleteTaskClick(task.id); }}
                                title="${localize('panel.cards.current.actions.complete', this.hass!.language)}"
                            ></ha-icon-button>
                            <ha-icon-button
                                .path=${mdiPencil}
                                @click=${(e: Event) => { e.stopPropagation(); this._handleOpenEditDialogClick(task.id); }}
                                title="${localize('panel.cards.current.actions.edit', this.hass!.language)}"
                            ></ha-icon-button>
                            <ha-icon-button
                                .path=${mdiDelete}
                                @click=${(e: Event) => { e.stopPropagation(); this._handleRemoveTaskClick(task.id); }}
                                title="${localize('panel.cards.current.actions.remove', this.hass!.language)}"
                            ></ha-icon-button>
                            <ha-icon-button
                                .path=${isExpanded ? mdiChevronUp : mdiChevronDown}
                                @click=${(e: Event) => { e.stopPropagation(); this._toggleExpand(task.id); }}
                            ></ha-icon-button>
                        </div>
                    </div>
                </div>

                ${isExpanded ? html`
                    <div class="task-expanded">
                        ${task.notes ? html`
                            <div class="task-section">
                                <div class="section-label">${localize('panel.cards.new.fields.notes.heading', this.hass!.language)}</div>
                                <div class="section-content notes-content">${task.notes}</div>
                            </div>
                        ` : nothing}

                        <div class="task-section">
                            <div class="section-label">${localize('panel.detail.last_performed', this.hass!.language)}</div>
                            <div class="section-content">
                                ${task.last_performed
                                    ? formatDateNumeric(new Date(this.computeISODate(task.last_performed)), this.hass!.locale)
                                    : "-"}
                            </div>
                        </div>

                        ${task.completion_history && task.completion_history.length > 0 ? html`
                            <div class="task-section">
                                <div class="section-label">${localize('panel.detail.history', this.hass!.language)}</div>
                                <div class="history-list">
                                    ${task.completion_history.slice().reverse().map((record: CompletionRecord) => html`
                                        <div class="history-item">
                                            <span class="history-date">
                                                ${formatDateNumeric(new Date(record.timestamp), this.hass!.locale)}
                                            </span>
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

    renderEditDialog(): TemplateResult {
        if (!this.hass || !this._editingTaskId) return html``;

        return html`
            <ha-dialog
                open
                heading="${localize('panel.dialog.edit_task.title', this.hass.language)}: ${this._editFormData.title}"
                @closed=${this._handleDialogClosed}
            >
                <ha-form
                    .hass=${this.hass}
                    .schema=${this._editSchema}
                    .computeLabel=${this._computeEditLabel.bind(this)}
                    .computeHelper=${this._computeEditHelper.bind(this)}
                    .data=${this._editFormData}
                    @value-changed=${(e: CustomEvent) => this._editFormData = { ...this._editFormData, ...e.detail.value }}
                ></ha-form>

                <mwc-button slot="secondaryAction" @click=${() => (this._editingTaskId = null)}>
                    ${localize('panel.dialog.edit_task.actions.cancel', this.hass.language)}
                </mwc-button>
                <mwc-button slot="primaryAction" @click=${this._handleSaveEditClick}>
                    ${localize('panel.dialog.edit_task.actions.save', this.hass.language)}
                </mwc-button>
            </ha-dialog>
        `;
    }

    // --- Event handlers ---

    private _toggleExpand(taskId: string) {
        const next = new Set(this._expandedTasks);
        if (next.has(taskId)) {
            next.delete(taskId);
        } else {
            next.add(taskId);
        }
        this._expandedTasks = next;
    }

    private async _handleAddTaskClick() {
        const { title, schedule_type, interval_value, interval_type, last_performed, next_due_date, annual_recurrence, tag, icon, label, notes, assigned_to, calendar_entity, calendar_keyword, dst_trigger } = this._formData;

        if (!title?.trim()) {
            alert(localize("panel.cards.new.alerts.required", this.hass!.language));
            return;
        }

        if (schedule_type === "fixed_date" && !next_due_date) {
            alert(localize("panel.cards.new.alerts.required", this.hass!.language));
            return;
        }

        if (schedule_type !== "fixed_date" && (!interval_value || !interval_type)) {
            alert(localize("panel.cards.new.alerts.required", this.hass!.language));
            return;
        }

        const payload: Record<string, any> = {
            title: title.trim(),
            schedule_type: schedule_type || "interval",
            tag_id: tag?.trim() || undefined,
            icon: icon?.trim() || "mdi:calendar-check",
            notes: notes?.trim() || undefined,
            assigned_to: assigned_to?.trim() || undefined,
            calendar_entity: calendar_entity?.trim() || undefined,
            calendar_keyword: calendar_keyword?.trim() || undefined,
            dst_trigger: dst_trigger || false,
            labels: label ?? [],
        };

        if (schedule_type === "fixed_date") {
            payload.next_due_date = this.computeISODate(next_due_date);
            payload.annual_recurrence = annual_recurrence || false;
            payload.last_performed = last_performed ? this.computeISODate(last_performed) : undefined;
        } else {
            payload.interval_value = interval_value;
            payload.interval_type = interval_type;
            payload.last_performed = this.computeISODate(last_performed);
        }

        try {
            await saveTask(this.hass!, payload);
            await this.resetForm();
            this._showCreateForm = false;
        } catch (error) {
            console.error("Failed to add task:", error);
            alert(localize('panel.cards.new.alerts.error', this.hass!.language));
        }
    }

    private async _handleCompleteTaskClick(id: string) {
        try {
            await completeTask(this.hass!, id);
            await this.loadData();
        } catch (e) {
            console.error("Failed to complete task:", e);
        }
    }

    private async _handleOpenEditDialogClick(id: string) {
        try {
            const task: Task = await loadTask(this.hass!, id);
            this._editingTaskId = task.id;
            let labels: Label[] = [];
            const entity = this.registry.find((entry) => entry.unique_id === task.id);
            if (entity)
                labels = this.labelRegistry.filter((lr) => entity.labels.includes(lr.label_id));

            this._editFormData = {
                title: task.title,
                schedule_type: task.schedule_type || "interval",
                interval_value: task.interval_value,
                interval_type: task.interval_type,
                last_performed: task.last_performed ?? "",
                next_due_date: task.next_due_date ?? "",
                annual_recurrence: task.annual_recurrence ?? false,
                icon: task.icon ?? "",
                label: labels.map((l) => l.label_id),
                tag: task.tag_id ?? "",
                notes: task.notes ?? "",
                assigned_to: task.assigned_to ?? "",
                calendar_entity: task.calendar_entity ?? "",
                calendar_keyword: task.calendar_keyword ?? "",
                dst_trigger: task.dst_trigger ?? false,
            };

            await this.updateComplete;
        } catch (e) {
            console.error("Failed to fetch task for edit:", e);
        }
    }

    private async _handleSaveEditClick() {
        if (!this._editingTaskId) return;

        const scheduleType = this._editFormData.schedule_type || "interval";

        const updates: Record<string, any> = {
            title: this._editFormData.title.trim(),
            schedule_type: scheduleType,
            icon: this._editFormData.icon?.trim() || "mdi:calendar-check",
            notes: this._editFormData.notes?.trim() || null,
            assigned_to: this._editFormData.assigned_to?.trim() || null,
            calendar_entity: this._editFormData.calendar_entity?.trim() || null,
            calendar_keyword: this._editFormData.calendar_keyword?.trim() || null,
            dst_trigger: this._editFormData.dst_trigger || false,
            labels: this._editFormData.label,
        };

        if (scheduleType === "fixed_date") {
            updates.next_due_date = this.computeISODate(this._editFormData.next_due_date);
            updates.annual_recurrence = this._editFormData.annual_recurrence || false;
            updates.last_performed = this._editFormData.last_performed
                ? this.computeISODate(this._editFormData.last_performed)
                : this.computeISODate("");
            updates.interval_value = 0;
            updates.interval_type = "days";
        } else {
            const lastPerformedISO = this.computeISODate(this._editFormData.last_performed);
            if (!lastPerformedISO) return;
            updates.interval_value = Number(this._editFormData.interval_value);
            updates.interval_type = this._editFormData.interval_type;
            updates.last_performed = lastPerformedISO;
        }

        if (this._editFormData.tag && this._editFormData.tag.trim() !== "") {
            updates.tag_id = this._editFormData.tag.trim();
        } else {
            updates.tag_id = null;
        }

        try {
            await updateTask(this.hass!, { task_id: this._editingTaskId, updates });
            this._editingTaskId = null;
            this._editFormData = emptyFormData();
            await this.loadData();
        } catch (e) {
            console.error("Failed to update task:", e);
        }
    }

    private async _handleRemoveTaskClick(id: string) {
        if (!confirm(localize('panel.cards.current.confirm_remove', this.hass!.language))) return;
        try {
            await removeTask(this.hass!, id);
            await this.loadData();
        } catch (e) {
            console.error("Failed to remove task:", e);
        }
    }

    private _handleDialogClosed(e: CustomEvent) {
        const action = e.detail?.action;
        if (action === "close" || action === "cancel") {
            this._editingTaskId = null;
        }
    }

    static styles = panelStyles;
}

customElements.define("home-maintenance-panel", HomeMaintenancePanel);
