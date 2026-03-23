# Super Admin Dashboard -- Module Documentation

The Super Admin Dashboard is the central administration panel for the BuilderLync platform. It provides full visibility and control over every tenant (enterprise account), user, billing plan, integration, and system resource across the entire SaaS platform.

---

## Table of Contents

1. [Authentication and Layout](#1-authentication-and-layout)
2. [Overview (Dashboard)](#2-overview-dashboard)
3. [Accounts](#3-accounts)
4. [Users and Roles](#4-users-and-roles)
5. [Billing and Plans](#5-billing-and-plans)
6. [Usage and Limits](#6-usage-and-limits)
7. [Features and Flags](#7-features-and-flags)
8. [Integrations and API](#8-integrations-and-api)
9. [Security and Audit](#9-security-and-audit)
10. [Support and Feedback](#10-support-and-feedback)
11. [System Health](#11-system-health)
12. [Maintenance](#12-maintenance)
13. [Settings](#13-settings)

---

## 1. Authentication and Layout

**Routes:** `/super-admin/login`, `/super-admin/logout`

The super admin dashboard is protected behind its own authentication layer, separate from regular user authentication. Administrators log in with an email and password at the dedicated login page. Sessions are stored in the browser and last for 8 hours before requiring re-authentication.

If an unauthenticated user tries to visit any super admin page, they are automatically redirected to the login screen. After logging in, they are returned to the page they originally requested.

The dashboard layout consists of three parts:

- **Sidebar** -- A fixed dark navigation panel on the left with links to all 11 main modules, plus Settings and Logout at the bottom. The active page is highlighted in red.
- **Top Bar** -- A fixed header showing the "BuilderLync Super Admin" branding, the logged-in administrator's name, and quick links to Settings and Logout.
- **Content Area** -- The main area where each module's content is displayed.

---

## 2. Overview (Dashboard)

**Route:** `/super-admin`

The Overview page is the command center of the super admin dashboard. It provides a high-level snapshot of the entire platform at a glance.

### Key Performance Indicators

Six stat cards are displayed at the top:

- **Active Accounts** -- The total number of enterprise accounts currently in an active state.
- **Trial Accounts** -- The number of accounts currently on a trial plan.
- **MRR (Monthly Recurring Revenue)** -- The sum of all active subscription amounts, formatted as currency.
- **ARR (Annual Recurring Revenue)** -- MRR multiplied by 12, giving the projected yearly revenue.
- **Active Users (24h)** -- The count of platform users who have been active in the last 24 hours.
- **Accounts at Risk** -- Accounts that have past-due billing or a health score below 50.

### Accounts at Risk

A table listing accounts that need attention. Each row shows the account name, current plan, billing status, MRR contribution, and a color-coded health score progress bar. This helps administrators quickly identify and respond to accounts that may churn.

### System Status

A grid of cards showing the health of each integrated third-party service (Twilio, Stripe, Jira, Google, etc.). Each card displays the provider name, current status (healthy, degraded, or down), and a colored indicator dot.

### Recent Admin Actions

A feed of the last 10 audit log entries showing what administrators have been doing -- timestamps, actor names, actions performed, and the target entities affected.

### Quick Actions

Shortcut buttons for common tasks: creating a new account, managing users, viewing billing, and checking system health.

---

## 3. Accounts

**Routes:** `/super-admin/accounts`, `/super-admin/accounts/:accountId`

The Accounts module is the core of multi-tenant management. It provides full control over every enterprise account on the platform.

### Accounts List

The main page shows a filterable, sortable table of all enterprise accounts. Administrators can:

- **Search** by account name or slug.
- **Filter** by status (active, trialing, suspended, past due, cancelled) and by subscription plan.
- **Sort** by any column: name, plan, status, MRR, user count, health score, or creation date.

Each account row displays: name, slug, plan tier, status badge, MRR, number of users, health score, and creation date.

### Account Actions

- **Edit** -- Opens a modal to change the account name, slug, plan, status, health score, and internal notes.
- **Suspend** -- Immediately suspends an account with a confirmation prompt.
- **Reactivate** -- Re-enables a previously suspended account.
- **Impersonate** -- Allows an administrator to switch context and view the platform as an account's admin user.
- **Delete** -- Permanently removes an account. Requires typing "DELETE" as double confirmation.

### Sync Accounts

A button that synchronizes organizations from the main database into the enterprise accounts table. Any organization that does not yet have a corresponding enterprise account entry will have one created automatically.

### Account Detail

Clicking an account name navigates to a detailed view with multiple sections:

- **Summary** -- Account name, slug, plan, status, creation date, and internal notes.
- **Modules** -- A grid of platform modules (CRM, Pipeline, Automation, Dashboard, Analytics, Reporting, AI, Settings) with toggles to enable or disable each one for that account.
- **Usage** -- Current month metrics for SMS, calls, AI minutes, and storage, each shown against its allocated limit with a progress bar.
- **Billing** -- Current plan, MRR, subscription status, and next billing date.
- **Integrations** -- List of connected integrations with their status.
- **Audit Log** -- Recent audit events specific to this account.

---

## 4. Users and Roles

**Routes:** `/super-admin/users`, `/super-admin/users/:userId`, `/super-admin/roles`

This module manages all platform users across every enterprise account, along with role definitions and permission structures.

### Users List

A searchable, filterable table of every user on the platform. Filters include:

- **Search** by name or email.
- **Status** filter: active, invited, or disabled.
- **Role** filter: by assigned role name.
- **Account** filter: by specific enterprise account.

Each row shows: name, email, role badge, account name (linked to the account detail page), status badge, last active timestamp, and creation date.

### User Actions

- **Change Role** -- Opens a dialog to assign a different role from available role definitions.
- **Change Status** -- Toggle a user between active and disabled states.
- **Resend Invite** -- Re-sends the invitation email for users still in "invited" status.
- **View Detail** -- Navigates to the full user profile.

### Sync Users

Similar to Sync Accounts, this button pulls organization members from the main database and ensures each one has a corresponding platform user record. It reports how many users were created, updated, skipped, or encountered errors.

### User Detail

A detailed view of a single user showing:

- **Profile** -- Name, email, avatar, phone, creation and last-active dates.
- **Account** -- Which account they belong to, their role within it, and the account's status.
- **Permissions** -- Their current role with a breakdown of module-level permissions (view, edit, manage, admin per module).
- **Security** -- Last login, MFA status, failed login attempts, and when their password was last changed.

### Roles Management

The Roles page lists all defined roles with filtering by scope (global roles vs. account-specific roles). Each role shows its name, scope, description, permission summary, and how many users are assigned to it.

- **Create Role** -- Opens an editor drawer with fields for name, description, scope, and a module-level permissions grid. Each module (CRM, Pipeline, Automation, etc.) can be set to none, read, write, or admin access.
- **Edit Role** -- Updates an existing role definition.
- **Duplicate Role** -- Creates a copy of a role with "(Copy)" appended to its name.
- **Delete Role** -- Removes a role, blocked if users are currently assigned to it or if it is marked as a default.

Nine predefined role templates are available as starting points: Company Admin, Support Admin, Support User, Sales Admin, Sales User, Developer Admin, Developer User, Accounting Admin, and Accounting User.

---

## 5. Billing and Plans

**Route:** `/super-admin/billing`

The Billing module manages subscription plans, tracks revenue, and integrates with Stripe for payment processing.

### Plans Tab

Displays each subscription plan as a card showing its name, monthly price, billing interval, feature list, and whether it is currently active. Administrators can:

- **Create Plan** -- Opens an editor drawer with fields for plan name, description, Stripe product and price IDs, monthly and annual pricing, a feature list editor, module access toggles, usage limits (SMS, calls, AI minutes, storage), and an active/inactive toggle.
- **Edit Plan** -- Updates any field on an existing plan.
- **Toggle Active** -- Quickly enable or disable a plan without opening the editor.

### Accounts Tab

A table showing the billing status of each enterprise account: account name, current plan, subscription status, MRR contribution, billing period, and next invoice date.

### Invoices Tab

A searchable table of all invoices across all accounts. Each row shows: invoice number, account name, amount, payment status, date, and a link to the invoice in Stripe.

### Metrics Tab

A revenue analytics dashboard displaying:

- **MRR** -- Current monthly recurring revenue.
- **ARR** -- Annualized recurring revenue.
- **Churn Rate** -- Percentage of accounts that cancelled in the current period.
- **ARPA** -- Average revenue per account.
- **CLV** -- Estimated customer lifetime value.
- **Revenue by Plan** -- Breakdown of revenue contribution by each plan tier.

### Stripe Sync

A "Sync Stripe Data" button that synchronizes customers, products, subscriptions, invoices, and payment records from Stripe into the local database. Progress and results are shown during and after the sync.

---

## 6. Usage and Limits

**Route:** `/super-admin/usage`

The Usage module tracks resource consumption across all accounts on a monthly basis and identifies accounts approaching or exceeding their allocated limits.

### KPI Cards

Four summary cards at the top:

- **Total SMS Sent** -- Platform-wide SMS count for the selected month.
- **Total Call Minutes** -- Platform-wide call minutes for the selected month.
- **Total AI Minutes** -- Platform-wide AI usage minutes for the selected month.
- **Accounts Over Limit** -- Number of accounts that have exceeded at least one usage limit, highlighted in red.

### Usage Table

A table listing every account with columns for each tracked metric: SMS, MMS, call minutes, AI minutes, emails sent, storage, contacts, and jobs created. Each metric cell shows the current usage against the allocated limit with a color-coded progress bar:

- **Green** -- Under 70% of the limit.
- **Yellow** -- Between 70% and 90% of the limit.
- **Red** -- Over 90% or exceeding the limit.

### Filters

- **Month Picker** -- Select a specific month (YYYY-MM format) to view usage data.
- **Search** -- Filter by account name.
- **Status** -- Filter to show all accounts, only active, trialing, past due, or over-limit accounts.

---

## 7. Features and Flags

**Route:** `/super-admin/features`

The Features module controls feature flags and default configuration templates across the platform.

### Feature Flags Tab

A table of all feature flags with columns for: flag name, unique key, status (on, off, or beta), rollout strategy, description, and actions.

Rollout strategies control who sees a feature:

- **All** -- Every account gets the feature.
- **Beta** -- Only accounts flagged as beta participants.
- **Percentage** -- A configurable percentage of accounts (e.g., 25% rollout).
- **Accounts** -- A specific list of account IDs.

Administrators can toggle flags on/off directly from the table, or open the editor to configure the full set of options including rollout strategy, percentage slider, account ID list, and metadata JSON.

### Default Templates Tab

A grid of configuration templates that serve as starting points for new accounts. Templates are categorized by type: pipeline, automation, or dashboard.

Each template card shows its name, type badge, description, and an active toggle. The editor allows modifying the template name, type, description, active state, and the full JSON configuration.

---

## 8. Integrations and API

**Route:** `/super-admin/integrations`

The Integrations module manages all third-party service connections, API key issuance, and webhook endpoints.

### Overview Tab

Displays summary stats (total providers, healthy, warning, error, unknown) and a grid of provider cards. Each card shows the provider name, type, connection status (colored badge), number of connected accounts, and last health check timestamp. Providers can be enabled or disabled with a toggle.

Supported providers include Twilio, Stripe, Jira, Google Workspace, and others.

### Accounts Tab

A table showing per-account integration connections: account name, provider, connection status, connected date, last sync timestamp, and error count.

### API Keys Tab

Manages API keys for programmatic access to the platform. Each key entry shows: key name, masked key value (with a "Reveal" toggle), assigned scopes (displayed as badges), status, creation date, and last used timestamp.

- **Create Key** -- Opens an editor with fields for name, scope selection (multi-select checkboxes), expiration date, and active toggle. The generated key is displayed once with a copy button.
- **Revoke/Activate** -- Toggle key status.

### Webhooks Tab

Manages outbound webhook endpoints. Each entry shows: webhook name, URL, subscribed events (as badges), status, creation date, and last triggered timestamp.

- **Create Webhook** -- Editor with fields for name, URL (must be HTTPS), event subscriptions (multi-select), auto-generated secret, and active toggle.
- **Test** -- Sends a test payload to the webhook URL and reports the result.
- **Delete** -- Removes a webhook endpoint.

---

## 9. Security and Audit

**Route:** `/super-admin/security`

The Security module provides comprehensive security monitoring, audit logging, incident tracking, and policy configuration.

### Audit Log Tab

A searchable event log of all administrative actions across the platform. Filters include text search and actor type (super admin, system, or user). Each entry shows: timestamp, actor name with type badge, account, action performed, IP address, and status.

Clicking an entry opens a detail drawer with the full event metadata, request information, and target entity details.

### Access and MFA Tab

Displays security stats at the top: total users, percentage with MFA enabled, high-risk user count, and users with stale passwords (older than 90 days).

Below is a table of user security profiles showing: name, email, MFA status (enabled/disabled), last login, failed login attempts, and risk level (low, medium, high, or critical). Filters allow narrowing by MFA status and risk level.

### Security Events Tab

An incident tracking system for security-related events. Stats show total events, unacknowledged count, and critical event count. A severity filter narrows results (info, warning, error, critical).

Each event row shows: timestamp, event type, severity badge, source, description, and acknowledgment status. Events can be individually acknowledged or bulk-acknowledged with "Acknowledge All."

A detail drawer provides full event information including source IP, user agent, and space for resolution notes.

### Policies Tab

A configuration form for platform-wide security policies:

- **MFA Enforcement** -- Toggle to require multi-factor authentication for all super admin users.
- **Session Timeout** -- Configurable timeout duration in minutes.
- **IP Restrictions** -- Toggle to enable IP allowlisting, plus an interface to add and remove individual allowed IP addresses.
- **Data Export Controls** -- Toggle to allow/disallow data exports, with an option to require a reason for each export.

---

## 10. Support and Feedback

**Route:** `/super-admin/support`

The Support module manages customer support tickets, tracks NPS (Net Promoter Score) feedback, and monitors account health.

### Tickets Tab

Displays summary stats (total, open, in progress, resolved) and a filterable table of support tickets. Filters include search, status (open, in progress, waiting, resolved, closed), and priority (low, medium, high, critical).

Each ticket row shows: ticket ID, subject, account name, priority badge, status badge, assignee, and timestamps.

**Jira Integration:** Tickets can be pushed to Jira or synced back from Jira, enabling a two-way workflow between the internal support system and an external project tracker.

Clicking a ticket opens a detail drawer with:

- A conversation thread showing both public messages and internal notes (visually distinguished).
- A form to add new comments, toggling between public reply and internal note.
- Quick status-change buttons.
- Links to the associated account, reporter, and assignee.

### NPS and Feedback Tab

**NPS Dashboard:** A large NPS score display with a breakdown of promoters, passives, and detractors, each shown as a colored progress bar segment.

**NPS Responses Table:** Individual survey responses showing respondent name, account, score (color-coded), category (promoter/passive/detractor), comment text, and submission date.

**Product Feedback Table:** User-submitted feedback entries showing submitter, account, type badge (bug, idea, praise, or question), title, status, vote count, and date.

### Account Health Tab

Summary stats show: average health score, number of high-risk accounts (score below 40), medium-risk (40-70), and healthy accounts (above 70).

A filterable table lists each account with: name, health score (color-coded progress bar), risk level badge, open ticket count, NPS score, MRR, and last review date.

Clicking an account opens a health detail drawer showing:

- A large health score visualization.
- Component scores: Usage Score, NPS Score, Support Score, and Billing Score.
- List of open support tickets for that account.
- An internal notes editor for recording observations and action items.

---

## 11. System Health

**Route:** `/super-admin/system`

The System Health module monitors infrastructure performance, service availability, background jobs, and deployment history.

### Overview Tab

Four KPI cards with dynamic color coding based on thresholds:

- **CPU Usage** -- Green under 70%, yellow at 70-90%, red above 90%.
- **Memory Usage** -- Same thresholds as CPU.
- **Services Online** -- Count of services in a healthy state.
- **Active Jobs** -- Number of currently running background jobs.

Below is a service status grid with cards for each monitored service, showing the service name, type, status (colored dot and badge), response time, and uptime percentage.

### API and Services Tab

A full table of all platform services: service name, type, status, endpoint URL, response time, uptime percentage, error rate, and last health check timestamp.

Clicking a row opens a modal with endpoint URL, full configuration metadata, and recent health check history.

### Background Jobs Tab

**Queue Summary:** Cards for each job queue (default, email, sync, reports, cleanup) showing counts for pending, running, completed, and failed jobs.

**Jobs Table:** Each job shows: name, queue, status (with progress bar for running jobs), priority badge (low, normal, high, critical), start time, duration, and attempt count.

A detail modal provides full job data including input parameters, output or error details, and attempt history.

### Releases Tab

**Deployment History:** A chronological timeline of platform releases. Each entry shows:

- Version number and release type badge (major, minor, patch, or hotfix, each with a distinct color).
- Who deployed it and when.
- List of new features included.
- List of bug fixes included.
- Deployment status (success, failed, or rolled back).

**Runtime Settings:** A table of key-value configuration settings with the setting name, current value (sensitive values are masked with a reveal toggle), an edit button, and an environment indicator.

---

## 12. Maintenance

**Route:** `/super-admin/maintenance`

The Maintenance module provides tools for detecting and cleaning up orphaned data and resources that can accumulate over time.

### Orphan Detection

Four status cards track different categories of orphaned resources:

- **Orphaned Auth Users** -- Users in the authentication system (`auth.users`) that do not have a matching entry in `organization_members`.
- **Orphaned Platform Users** -- Records in `platform_users` that do not correspond to an existing authentication user.
- **Failed Accounts** -- Enterprise accounts stuck in a failed or error state.
- **Incomplete Organizations** -- Organizations that have no members at all.

### Workflow

1. **Scan** -- Click "Scan for Orphans" to run detection queries across all four categories. The status cards update with the count of orphaned items found.
2. **Clean Up** -- Click "Clean Up" to remove detected orphaned resources. A confirmation dialog requires acknowledgment before proceeding.
3. **Results** -- After cleanup, a summary is displayed showing counts per category, a detailed log of every action taken, and a list of any errors encountered.

---

## 13. Settings

**Route:** `/super-admin/settings/*`

The Settings module is a multi-page area for configuring the super admin's own profile, managing the internal admin team, and setting up platform-wide service credentials.

### Profile Settings

Seven tabs for personal configuration:

- **Personal Data** -- Name, email, phone number, and avatar upload.
- **Password** -- Change password with current password verification and a strength meter for the new password.
- **Signature** -- Rich text editor for configuring an email signature.
- **Email and Sync** -- Connect email accounts and configure synchronization preferences.
- **Two-Factor Authentication** -- Enable or disable 2FA with QR code setup and backup code generation.
- **Calendar** -- Calendar integration settings and availability sync configuration.
- **Availability** -- Weekly working hours schedule with timezone settings.

### Staff Management

Two tabs for managing the super admin team:

- **My Staff** -- A list of admin team members with actions to invite new staff, edit their role assignments, and deactivate accounts.
- **Roles** -- Super admin-specific role definitions (separate from account-level roles) with create, edit, and delete capabilities.

### Roles and Permissions

Same interface as the Roles tab in Staff Management, opened directly to the roles view. Provides access to the nine predefined role templates and custom role creation.

### Integrations Settings

Configuration cards for platform-wide service credentials:

- **Twilio** -- Phone and SMS service credentials.
- **Stripe** -- Payment processing credentials.
- **Jira** -- Project management and support ticket sync credentials.
- **Google Workspace** -- Calendar and email integration credentials.

Each card shows the provider name, description, and connection status. Connecting opens a credentials modal with fields specific to that provider (API keys, secrets, account IDs). A connection test runs on save to verify the credentials work.

### Email Service Settings

Five tabs for email infrastructure configuration:

- **SMTP Service** -- Default email provider selection (SendGrid, Mailgun, Amazon SES, or custom SMTP) with credential fields and the ability to add custom SMTP configurations.
- **Reply and Forward Settings** -- Reply-to address, forwarding rules, and auto-reply configuration.
- **Email Analytics** -- Dashboard showing sent, delivered, opened, and clicked metrics with a time-range selector.
- **Bounce Classification** -- Definitions for hard and soft bounces, automated actions per bounce type, and bounce rate monitoring.
- **Postmaster Tools** -- Google Postmaster and Microsoft SNDS integration, domain reputation monitoring, and SPF/DKIM/DMARC status checks.
