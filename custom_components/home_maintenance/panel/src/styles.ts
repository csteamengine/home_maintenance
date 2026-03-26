import { css } from 'lit';

export const panelStyles = css`
    :host {
        color: var(--primary-text-color);
        background: var(--lovelace-background, var(--primary-background-color));
    }

    .loading {
        padding: 24px;
        text-align: center;
    }

    /* Header */
    .header {
        background-color: var(--app-header-background-color);
        color: var(--app-header-text-color, white);
        border-bottom: var(--app-header-border-bottom, none);
    }

    .toolbar {
        height: var(--header-height);
        display: flex;
        align-items: center;
        font-size: 20px;
        padding: 0 16px;
        font-weight: 400;
        box-sizing: border-box;
    }

    .main-title {
        margin: 0 0 0 24px;
        line-height: 20px;
        flex-grow: 1;
    }

    .version {
        font-size: 14px;
        font-weight: 500;
        color: rgba(var(--rgb-text-primary-color), 0.9);
    }

    /* View container */
    .view {
        max-width: 900px;
        margin: 0 auto;
        padding: 16px;
    }

    /* Filter bar */
    .filter-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
    }

    .search-box {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 200px;
        background: var(--card-background-color, var(--ha-card-background, white));
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 4px 12px;
    }

    .search-box ha-svg-icon {
        color: var(--secondary-text-color);
        margin-right: 8px;
        flex-shrink: 0;
    }

    .search-box input {
        border: none;
        outline: none;
        background: transparent;
        color: var(--primary-text-color);
        font-size: 14px;
        flex: 1;
        padding: 8px 0;
    }

    .search-box input::placeholder {
        color: var(--secondary-text-color);
    }

    .assignee-filter {
        background: var(--card-background-color, var(--ha-card-background, white));
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 8px 12px;
        color: var(--primary-text-color);
        font-size: 14px;
    }

    .add-button {
        --mdc-icon-button-size: 40px;
    }

    /* Create form card */
    .card-new {
        margin-bottom: 16px;
    }

    .card-new .card-header {
        padding: 16px 16px 0;
        font-size: 18px;
        font-weight: 500;
    }

    .card-new .card-content {
        padding: 16px;
    }

    ha-expansion-panel {
        --input-fill-color: none;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 8px;
    }

    /* Task groups */
    .task-group {
        margin-bottom: 24px;
    }

    .group-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 8px 4px;
        margin-bottom: 8px;
    }

    .group-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .dot-overdue { background: var(--error-color, #db4437); }
    .dot-due-soon { background: var(--warning-color, #ffa726); }
    .dot-upcoming { background: var(--success-color, #43a047); }

    .group-overdue { color: var(--error-color, #db4437); }
    .group-due-soon { color: var(--warning-color, #ffa726); }
    .group-upcoming { color: var(--success-color, #43a047); }

    .group-count {
        font-weight: 400;
        opacity: 0.7;
    }

    /* Task cards */
    .task-card {
        background: var(--card-background-color, var(--ha-card-background, white));
        border-radius: 12px;
        margin-bottom: 8px;
        border-left: 4px solid transparent;
        box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0,0,0,0.14));
        overflow: hidden;
        transition: box-shadow 0.2s ease;
    }

    .task-card:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .task-card.overdue {
        border-left-color: var(--error-color, #db4437);
    }

    .task-card.due_soon {
        border-left-color: var(--warning-color, #ffa726);
    }

    .task-card.upcoming {
        border-left-color: var(--success-color, #43a047);
    }

    .task-card-main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 8px 12px 16px;
        cursor: pointer;
        gap: 8px;
    }

    .task-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
    }

    .task-icon {
        flex-shrink: 0;
        color: var(--secondary-text-color);
    }

    .task-info {
        min-width: 0;
        flex: 1;
    }

    .task-title {
        font-size: 16px;
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
        gap: 8px;
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

    .due-days.overdue {
        color: var(--error-color, #db4437);
    }

    .due-days.due_soon {
        color: var(--warning-color, #ffa726);
    }

    .due-days.upcoming {
        color: var(--success-color, #43a047);
    }

    .task-actions {
        display: flex;
        align-items: center;
    }

    .task-actions ha-icon-button {
        --mdc-icon-button-size: 36px;
        color: var(--secondary-text-color);
    }

    /* Expanded section */
    .task-expanded {
        padding: 0 16px 16px;
        border-top: 1px solid var(--divider-color);
    }

    .task-section {
        margin-top: 12px;
    }

    .section-label {
        font-size: 12px;
        font-weight: 600;
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

    /* History list */
    .history-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .history-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        padding: 4px 0;
        border-bottom: 1px solid var(--divider-color);
    }

    .history-item:last-child {
        border-bottom: none;
    }

    .history-date {
        color: var(--secondary-text-color);
        flex-shrink: 0;
    }

    .history-who {
        font-weight: 500;
    }

    .history-note {
        color: var(--secondary-text-color);
        font-style: italic;
    }

    /* Empty state */
    .empty-state {
        text-align: center;
        padding: 48px 16px;
        color: var(--secondary-text-color);
        font-size: 16px;
    }

    /* Dialog */
    ha-dialog {
        --mdc-dialog-min-width: 600px;
    }

    @media (max-width: 600px) {
        ha-dialog {
            --mdc-dialog-min-width: auto;
        }

        .task-card-main {
            flex-wrap: wrap;
        }

        .task-right {
            width: 100%;
            justify-content: space-between;
        }

        .task-actions ha-icon-button {
            --mdc-icon-button-size: 32px;
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

// Keep backward compat export for any code that might reference the old name
export const commonStyle = panelStyles;
