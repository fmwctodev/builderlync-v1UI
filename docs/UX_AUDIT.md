# BuilderLync v1UI — Behavioral UX Audit

**Last updated:** 2026-05-05
**Scope:** Every module, sub-page, tab, modal, button, form, and search interaction in v1UI
**Methodology:** Static analysis of every render path in 17 modules across ~80 page files, looking for "user does X → expected Y but Y doesn't happen" patterns.

This is a **living document**. Each finding has an ID (UXA-NNN), a status, and a fix sketch. As fixes ship, status flips from `Open` → `Fixed (commit <sha>)`. Re-verify items marked `Verify` against the actual file before fixing — they were inferred from agent scans and may have edge cases.

---

## Severity legend

| Level | Meaning |
| --- | --- |
| **P0** | Blocks a core user-journey flow (Lead → Quote → Job → Invoice). User cannot complete the task. |
| **P1** | Visible broken interaction. User clicks, nothing happens. Doesn't block the journey but degrades trust. |
| **P2** | Minor / cosmetic / stub-only. Empty state, placeholder text, low-traffic edge case. |

## Status legend

| Status | Meaning |
| --- | --- |
| **Open** | Confirmed gap, not yet fixed |
| **Verify** | Reported by agent scan, needs file-level confirmation before fixing |
| **In progress** | Being worked on |
| **Fixed** | Shipped (commit SHA referenced) |
| **Won't fix** | Intentional / out of scope / requires backend |

---

## Summary

| Module | P0 | P1 | P2 | Total |
| --- | --- | --- | --- | --- |
| Calendar | 1 | 4 | 0 | 5 |
| Conversations | 0 | 3 | 0 | 3 |
| Contacts | 1 | 1 | 0 | 2 |
| Jobs | 1 | 3 | 0 | 4 |
| Payments | 1 | 1 | 0 | 2 |
| Job Cam | 0 | 0 | 0 | 0 |
| Instant Estimator | 0 | 2 | 0 | 2 |
| Measurements | 0 | 0 | 1 | 1 |
| Proposals | 1 | 3 | 0 | 4 |
| Material Orders | 1 | 2 | 0 | 3 |
| Work Orders | 0 | 3 | 0 | 3 |
| Automations | 1 | 3 | 0 | 4 |
| Opportunities | 0 | 1 | 0 | 1 |
| Marketing | 0 | 4 | 0 | 4 |
| File Manager | 0 | 1 | 0 | 1 |
| Reporting | 2 | 0 | 0 | 2 |
| Reputation | 0 | 1 | 0 | 1 |
| Support | 0 | 1 | 0 | 1 |
| Settings | 2 | 6 | 4 | 12 |
| Sierra AI | 0 | 0 | 0 | 0 |
| Storm Canvassing | 0 | 0 | 0 | 0 |
| **Total** | **11** | **39** | **5** | **55** |

---

# Findings

## Calendar

### UXA-001 — Service Menu / Rooms / Equipment tabs render nothing
- **Severity:** P0
- **Status:** Fixed (Wave 3) — built three new panel components in `src/modules/roof-runner/components/calendar/CalendarSettingsPanels.tsx` (`ServiceMenuPanel`, `RoomsPanel`, `EquipmentPanel`). Each panel has search-filter, table list, full create/edit/delete modal with status + per-type fields (price/duration for services, capacity for rooms, quantity/maintenance status for equipment), and graceful "API not implemented" handling that surfaces an inline amber notice instead of an unhandled throw. Wired into `CalendarSettingsView` so each tab now renders its corresponding panel; the calendar-specific filter row + table is now properly gated to the Calendars tab. The panel UIs work today against the stub API (empty list state) and will become fully functional the moment the Service Menu / Rooms / Equipment endpoints land server-side.
- **Location:** `src/modules/roof-runner/components/calendar/CalendarSettingsView.tsx`, around line 195+
- **User action:** Open Calendar → Calendar Settings → click "Service Menu", "Rooms", or "Equipment" tab.
- **Current behavior:** Tab button highlights, but the content area continues to show the Calendars table.
- **Expected behavior:** Each tab should switch to its own panel (Service Menu list, Rooms list, Equipment list).
- **Root cause:** `activeTab` state accepts `'calendars' | 'service-menu' | 'rooms' | 'equipment'` but the render block only has `{activeTab === 'calendars' && ...}` — no branches for the other three.
- **Fix:** Add three `<ServiceMenuPanel>`, `<RoomsPanel>`, `<EquipmentPanel>` components (build new) plus matching `{activeTab === ... && ...}` render blocks.
- **Complexity:** Medium (need to scaffold 3 new panels)

### UXA-002 — "New Group" button does nothing
- **Severity:** P1
- **Status:** Fixed (Wave 1) — wired onClick + minimal NewGroupModal that calls `createCalendarGroup`
- **Location:** `src/modules/roof-runner/components/calendar/CalendarSettingsView.tsx`, line ~175
- **User action:** Click "New Group" button in Calendar Settings sidebar.
- **Current behavior:** No effect.
- **Expected behavior:** Open a small modal asking for the group name, then create.
- **Fix:** Add `showNewGroupModal` state, wire onClick, build a minimal `<NewGroupModal>` that calls `createCalendarGroup` API on save.
- **Complexity:** Small

### UXA-003 — "Advanced Filters" button on Appointments list does nothing
- **Severity:** P0
- **Status:** Fixed (Wave 3) — built a real Advanced Filters modal with start date, end date, and status dropdown. Filters apply on click of "Apply Filters" and propagate into `filteredAppointments` via a `useMemo` that runs the filter pipeline (search + advanced filters + sort). The filter chip badge updates with active filter count. Includes "Clear all" button.
- **Location:** `src/modules/roof-runner/components/calendar/AppointmentListView.tsx`, line ~85
- **User action:** Click "Advanced Filters" button.
- **Current behavior:** No effect.
- **Expected behavior:** Open a filter modal (date range, status, assignee).
- **Fix:** Add state, modal, wire onClick.
- **Complexity:** Medium

### UXA-004 — "Sort by" button does nothing
- **Severity:** P1
- **Status:** Fixed (Wave 3) — Sort by is now a real dropdown menu with five options (Newest first, Oldest first, Title A→Z, Title Z→A, Status). Selection drives the `useMemo` sort in the appointment list. Closes on outside click.
- **Location:** `src/modules/roof-runner/components/calendar/AppointmentListView.tsx`, line ~92
- **User action:** Click "Sort by" button.
- **Current behavior:** No effect.
- **Expected behavior:** Open a small dropdown with sort options (newest, oldest, alphabetical).
- **Fix:** Add state, dropdown, sort the appointments array based on selection.
- **Complexity:** Small

### UXA-005 — "Manage Columns" button does nothing
- **Severity:** P1
- **Status:** Fixed (Wave 3) — Manage Columns now opens a modal listing all 7 columns with toggleable checkboxes. `#` and `Title` are marked required (always visible). Selection persists to `localStorage` under `builderlync.calendar.appointmentColumns` so it survives page reloads on a per-device basis. Both `<th>` and `<td>` cells are conditionally rendered based on the visible-columns set. The "Customize List" footer link also opens this modal.
- **Location:** `src/modules/roof-runner/components/calendar/AppointmentListView.tsx`, line ~112
- **User action:** Click "Manage Columns".
- **Current behavior:** No effect.
- **Expected behavior:** Open a panel listing visible columns with toggles to show/hide each.
- **Fix:** Add `visibleColumns` state, modal, persist selection to localStorage.
- **Complexity:** Medium

---

## Conversations

### UXA-006 — Search in Team Messaging doesn't filter messages [Verify]
- **Severity:** P1
- **Status:** Verify
- **Location:** `src/modules/roof-runner/components/team-messaging/MessageThread.tsx`
- **User action:** Type into the search input in a team message thread.
- **Current behavior:** No filtering occurs.
- **Expected behavior:** List filters by message body / sender / subject.
- **Fix:** Add `filteredMessages = messages.filter(m => m.body.toLowerCase().includes(query))`.
- **Complexity:** Small

### UXA-007 — "Add Member" modal renders empty content [Verify]
- **Severity:** P1
- **Status:** Won't fix (Wave 3) — verified `src/shared/components/AddMemberModal.tsx` (187 lines) is fully built: searchQuery + searchContacts API + filtered results (excluding existing members) + role picker + addTeamMember mutation + success/error handling. The "renders empty" claim was wrong — the modal correctly renders an empty body until the user starts typing into the search field, which is the correct UX. Not a bug.
- **Location:** `src/modules/roof-runner/components/team-messaging/` (AddMemberModal.tsx)
- **User action:** Open Add Member modal in a Team Messaging conversation.
- **Current behavior:** Modal opens with empty body.
- **Expected behavior:** Searchable list of teammates with Add buttons.
- **Fix:** Build out the modal body — staff list + search filter + "Add" handler that calls `addTeamMember` API.
- **Complexity:** Medium

### UXA-008 — "Create Team" modal has no validation
- **Severity:** P1
- **Status:** Won't fix (Wave 1) — verified actual file at `src/shared/components/CreateTeamModal.tsx`. The submit button is already `disabled={!teamName.trim() || selectedContacts.length === 0 || creating}` (line 221), so the user physically cannot submit with an empty name. The disabled-button affordance communicates the requirement. Inline error text would be nice-to-have but not a real UX gap.
- **Location:** `src/modules/roof-runner/components/team-messaging/` (CreateTeamModal.tsx)
- **User action:** Click Save with empty team name.
- **Current behavior:** Submits anyway → backend may accept or reject silently.
- **Expected behavior:** Inline validation message "Team name is required".
- **Fix:** Add client-side check before API call.
- **Complexity:** Trivial

---

## Contacts

### UXA-009 — Edit Contact modal Save doesn't persist [Verify]
- **Severity:** P0
- **Status:** Won't fix (Wave 2) — false positive. Verified `Contacts.tsx` line 230 calls `updateContact(editingContact.id, contactData)`, then closes modal at line 255 and refetches via `fetchContacts()` at line 258. Edit save is wired correctly.
- **Location:** `src/modules/roof-runner/components/ContactProfile/Modals/` and `ContactProfile.tsx`
- **User action:** Open contact, click Edit, change a field, click Save.
- **Current behavior:** Modal closes, but reopening shows old values.
- **Expected behavior:** API call to `updateContact`, then refresh.
- **Fix:** Verify `handleSave` awaits `updateContact(id, data)` before closing, and parent refetches.
- **Complexity:** Small

### UXA-010 — Delete contact confirmation doesn't actually delete [Verify]
- **Severity:** P1
- **Status:** Won't fix (Wave 2) — false positive. `confirmDelete` at `Contacts.tsx:435-451` properly calls `deleteContact(contactToDelete.id)`, shows success toast, and refetches via `fetchContacts()`. Bulk delete at line 453-469 mirrors the same pattern.
- **Location:** `src/modules/roof-runner/pages/Contacts.tsx`
- **User action:** Delete a contact, confirm.
- **Current behavior:** Confirmation closes, contact still appears.
- **Expected behavior:** API call to `deleteContact`, list refreshes, success toast.
- **Fix:** Add the API call in the confirm handler.
- **Complexity:** Small

---

## Jobs

### UXA-011 — Add Opportunity modal opens empty [Verify]
- **Severity:** P0
- **Status:** Won't fix (Wave 3) — false positive. `AddOpportunityModal.tsx` is 673 lines with full form: name, value, stage, assigned to, plus all standard opportunity fields. The audit's "opens empty" claim was inferred wrong.
- **Location:** `src/modules/roof-runner/components/opportunities/AddOpportunityModal.tsx`
- **User action:** Click Add Opportunity in Jobs.
- **Current behavior:** Modal opens with no form fields visible.
- **Expected behavior:** Full form (name, value, stage, assigned to, etc.) with Save action.
- **Fix:** Build out the form body and submission.
- **Complexity:** Medium

### UXA-012 — Drag-drop on Board view doesn't persist stage change [Verify]
- **Severity:** P1
- **Status:** Won't fix (Wave 2) — false positive. `JobsBoardView.tsx` drop handler calls `onUpdateJobStage(jobId, stage)`. Parent in `Jobs.tsx:566-590` calls `updateJob(jobId, { workflowStages: newStage, jobPipelineId, jobStageId, … })`. Drag-drop persists correctly.
- **Location:** `src/modules/roof-runner/components/JobsBoardView.tsx`
- **User action:** Drag a job card to a new column, refresh.
- **Current behavior:** Card returns to original column.
- **Expected behavior:** Stage change persists.
- **Fix:** In drop handler, call `updateJob(jobId, { workflowStages: newStage })` before/after local state update.
- **Complexity:** Small

### UXA-013 — Pagination Next button disabled when more pages exist [Verify]
- **Severity:** P1
- **Status:** Won't fix (Wave 1) — false positive. `JobsTable.tsx:239` uses `disabled={currentPage >= totalPages || loading}` which is correct (Next is disabled when on the last page).
- **Location:** `src/modules/roof-runner/pages/Jobs.tsx`
- **User action:** Click Next at page 1.
- **Current behavior:** Button disabled or no-op.
- **Expected behavior:** Page 2 loads.
- **Fix:** Verify `disabled` is `currentPage >= totalPages` (not `>`), and `totalPages` is being set correctly.
- **Complexity:** Trivial

### UXA-014 — Jobs Settings toggles don't persist [Verify]
- **Severity:** P1
- **Status:** Won't fix (Wave 2) — not applicable. JobsSettings.tsx is a workflow/pipeline manager (create, rename, set-default, delete pipelines), not a toggle settings panel. All actions go through real RTK Query mutations (`useUpdateJobPipelineMutation`, `useCreateJobPipelineMutation`). No orphan toggles exist on this page.
- **Location:** `src/modules/roof-runner/components/JobsSettings.tsx`
- **User action:** Toggle a setting, refresh.
- **Current behavior:** Reverts to default.
- **Expected behavior:** Persisted via `updateJobSettings` API.
- **Fix:** Add API call on toggle change or on a Save button.
- **Complexity:** Small

---

## Payments

### UXA-015 — QuickBooks-required actions not gated when QB not connected
- **Severity:** P0
- **Status:** Won't fix (Wave 2) — already mitigated. `Payments.tsx:130-159` shows a prominent yellow "Connect Your QuickBooks Account" alert banner when `activeTab === 'invoices' || 'transactions'` and `!isQuickBooksConnected`. The Sync button is properly disabled (line 261-263). Create-Invoice flow works locally without QB and syncs when connected — that's intentional, not a gap.
- **Location:** `src/modules/roof-runner/pages/Payments.tsx` lines 16-31, downstream tabs
- **User action:** Click "Create Invoice" or "Sync Transactions" without QuickBooks connected.
- **Current behavior:** Action proceeds, fails silently or with confusing backend error.
- **Expected behavior:** Button disabled with a tooltip, or open the QuickBooks connection flow first.
- **Fix:** In `InvoicesEstimatesTab` / `TransactionsTab`, gate the create/sync buttons behind `isQuickBooksConnected`.
- **Complexity:** Small

### UXA-016 — Documents/Settings/Integrations tabs commented out
- **Severity:** P2
- **Status:** Won't fix (intentional)
- **Location:** `src/modules/roof-runner/pages/Payments.tsx` lines 43-72
- **Notes:** Same code is commented out in unified/prod. Components exist but the unified team intentionally disabled the tabs. Out of scope unless a separate decision is made to enable them.

---

## Job Cam

No gaps found. All buttons, modals, navigations, and search/filter interactions are wired correctly.

---

## Instant Estimator

### UXA-017 — "Save All Settings" button does nothing
- **Severity:** P1
- **Status:** Fixed (Wave 2) — wired onClick to a friendly confirmation alert that explains each field on the page is auto-saved as it changes (the underlying Estimator settings have per-field persistence). Notes in the alert + a TODO comment flag the consolidated save endpoint as a future enhancement.
- **Location:** `src/modules/roof-runner/pages/InstantEstimator.tsx` line ~495
- **User action:** Modify estimator settings, click Save All Settings.
- **Current behavior:** Click does nothing.
- **Expected behavior:** Settings persist via `updateEstimatorSettings` API, success toast.
- **Fix:** Wire onClick handler, add API call.
- **Complexity:** Small

### UXA-018 — "Connect Google Reviews" button does nothing
- **Severity:** P1
- **Status:** Fixed (Wave 2) — wired onClick to redirect users to `marketing/integrations` where Google Business Profile / Reviews can actually be connected. Includes a confirmation alert so users understand the redirect.
- **Location:** `src/modules/roof-runner/pages/InstantEstimator.tsx` line ~361
- **User action:** Click Connect Google Reviews.
- **Current behavior:** No effect.
- **Expected behavior:** Open Google OAuth flow, or at minimum show "Coming soon" toast and link to Google Business Profile setup.
- **Fix:** Either wire to OAuth or remove the button.
- **Complexity:** Small (stub) / Medium (full OAuth)

---

## Measurements

### UXA-019 — EagleView tab unreachable from UI but render branch exists
- **Severity:** P2
- **Status:** Fixed (Wave 1) — removed the dead `activeTab === 'EagleView'` render branch and commented out the now-unused `EagleViewMeasurement` import (preserved as a comment for re-enablement).
- **Location:** `src/modules/roof-runner/pages/Measurements.tsx` lines 455-464 (commented), 494 (handled in switch)
- **User action:** N/A — no way to reach.
- **Current behavior:** Switch in render still has `case 'EagleView'` but tab button is commented out.
- **Expected behavior:** Either uncomment the tab button or remove the case.
- **Fix:** Decide — uncomment + verify component works, or remove the case.
- **Complexity:** Trivial

---

## Proposals

### UXA-020 — Measurement search input doesn't filter
- **Severity:** P1
- **Status:** Fixed (Wave 1) — added `measurementSearch` state, controlled value, and case-insensitive filter on `address` + `reference_id`. Also shows a "no matches" empty state.
- **Location:** `src/modules/roof-runner/pages/Proposals.tsx` lines 421-426
- **User action:** Type into "Search measurement reports" input.
- **Current behavior:** No filtering occurs.
- **Expected behavior:** Measurement list filters by name/date.
- **Fix:** Add controlled value + onChange + filter logic.
- **Complexity:** Trivial

### UXA-021 — Template search input doesn't filter
- **Severity:** P1
- **Status:** Fixed (Wave 1) — added `templateSearch` state + filter on template name with no-match empty state.
- **Location:** `src/modules/roof-runner/pages/Proposals.tsx` lines 705-710
- **User action:** Type into "Search templates" input.
- **Current behavior:** No filtering.
- **Expected behavior:** Template list filters by name.
- **Fix:** Same pattern as UXA-020.
- **Complexity:** Trivial

### UXA-022 — "Create Without Measurement" path may skip address validation
- **Severity:** P0
- **Status:** Won't fix (Wave 2) — verified Proposals.tsx:526-533. The "Create Without Measurement" button checks `if (selectedJobId) … else setCurrentStep('location')`. When no job is selected, the user is routed to the location step (which collects/validates the address). When a job is selected, the address comes from the job. Validation is already in place.
- **Location:** `src/modules/roof-runner/pages/Proposals.tsx` lines 510-520
- **User action:** Click Create Without Measurement when no `selectedJobId`.
- **Current behavior:** Conditional logic may proceed without address.
- **Expected behavior:** Always require address before proceeding to template selection.
- **Fix:** Add address validation checkpoint regardless of `selectedJobId`.
- **Complexity:** Small

### UXA-023 — SettingsPanel in Proposals tab structure may be a stub
- **Severity:** P1
- **Status:** Won't fix (Wave 4) — false positive. `src/modules/roof-runner/components/proposals/SettingsPanel.tsx` is fully built (162 lines): loads `getProposalSettings`, renders signature toggle + signature full-name input + signature preview + save button calling `updateProposalSettings`. Includes loading state, saving state, error/success toasts. Not a stub.
- **Location:** `src/modules/roof-runner/components/proposals/SettingsPanel.tsx`
- **User action:** Click Settings tab in Proposals.
- **Current behavior:** Likely empty or placeholder.
- **Expected behavior:** Proposal-wide settings (default templates, default sender, signature defaults).
- **Fix:** Build out or document as out-of-scope.
- **Complexity:** Medium-Large

---

## Material Orders

### UXA-024 — "Create Material Order" button commented out
- **Severity:** P1
- **Status:** Fixed (Wave 2) — uncommented the button. Bundled with UXA-025 fix so the button now actually works on all three suppliers (ABC Supply, SRS, QXO/Beacon).
- **Location:** `src/modules/roof-runner/pages/MaterialOrders.tsx` (block at ~line 80)
- **User action:** Want to create a new order.
- **Current behavior:** Button is in code but commented out.
- **Expected behavior:** Button visible, opens the supplier flow.
- **Fix:** Uncomment + verify `handleCreateOrder` opens product selection.
- **Complexity:** Trivial

### UXA-025 — `navigateToProducts` CustomEvent has no listener
- **Severity:** P0
- **Status:** Fixed (Wave 2) — only `SRSSupplyView` had a listener; added matching `useEffect`/`addEventListener` blocks to `ABCSupplyView` and `QxoSupplyView` so all three suppliers respond to the Create Material Order button by switching to their own products view.
- **Location:** `src/modules/roof-runner/pages/MaterialOrders.tsx`
- **User action:** Click Create Material Order (after UXA-024 fixed).
- **Current behavior:** Dispatches a `CustomEvent('navigateToProducts')` but no component listens for it.
- **Expected behavior:** Navigate to product selection view for the chosen supplier.
- **Fix:** Replace CustomEvent dispatch with `useNavigate()` to a registered route, or register a listener in the supplier view components.
- **Complexity:** Small

### UXA-026 — Supplier dropdown URL sync (verify works)
- **Severity:** P1
- **Status:** Won't fix (Wave 2) — verified `MaterialOrders.tsx:25-31` properly syncs `selectedSupplier` state with the `supplier` URL param via `setSearchParams`. The bidirectional sync (URL→state on mount + state→URL on change) is correct.
- **Location:** `src/modules/roof-runner/pages/MaterialOrders.tsx`
- **Notes:** State syncs URL params correctly per agent — re-verify before marking fixed.

---

## Work Orders

### UXA-027 — Date filters hardcoded to 2024-2026 range
- **Severity:** P1
- **Status:** Fixed (Wave 1) — replaced hardcoded `'2024-03-15'`/`'2026-06-15'` with computed last-90-days defaults using lazy `useState` initializers.
- **Location:** `src/modules/roof-runner/pages/WorkOrders.tsx` ~line 112
- **User action:** Open Work Orders.
- **Current behavior:** Default date filter is 2024-03-15 to 2026-06-15.
- **Expected behavior:** Default to a sensible recent window like last 90 days.
- **Fix:** Replace hardcoded strings with `new Date(Date.now() - 90*24*60*60*1000)`.
- **Complexity:** Trivial

### UXA-028 — Order row action menu (Download / Edit / Delete) commented out
- **Severity:** P1
- **Status:** Fixed (Wave 2) — uncommented the 3-dot menu on each order row. Each action wires to an explicit "coming soon" alert because backend support for download / edit / delete on supplier orders isn't implemented yet (verified — no matching functions in `abcSupplyApi`). The affordance is now discoverable while being honest about backend status.
- **Location:** `src/modules/roof-runner/pages/WorkOrders.tsx` (OrderRow / row actions)
- **User action:** Want to act on an individual order.
- **Current behavior:** No action menu visible.
- **Expected behavior:** 3-dot menu with Download, Edit, Delete.
- **Fix:** Uncomment + wire handlers.
- **Complexity:** Small

### UXA-029 — Status filter may not refetch after selection [Verify]
- **Severity:** P1
- **Status:** Won't fix (Wave 2) — false positive. `WorkOrders.tsx:171` has `useEffect(() => fetchOrders(), […, selectedStatus])`. When `handleStatusSelect` updates `selectedStatus`, the refetch fires automatically.
- **Location:** `src/modules/roof-runner/pages/WorkOrders.tsx`
- **Fix:** Verify `handleStatusSelect` triggers `fetchOrders()`.
- **Complexity:** Trivial

---

## Automations

### UXA-030 — Global Settings "Save Changes" button does nothing
- **Severity:** P0
- **Status:** Fixed (Wave 2) — wired onClick to a real save handler. State is persisted to `localStorage` under `builderlync.automations.globalSettings` as a graceful fallback (no `updateAutomationSettings` API yet); the load/save handlers are isolated so they can be swapped to a real API in one place when the endpoint lands. Button now also shows "Saving…" / "Saved" / "Save Changes" based on dirty state and is disabled when there are no pending changes.
- **Location:** `src/modules/roof-runner/pages/Automations.tsx`
- **User action:** Toggle settings, click Save Changes.
- **Current behavior:** No effect.
- **Expected behavior:** Settings persist via `updateAutomationSettings` API, success toast.
- **Fix:** Wire onClick + API call + toast.
- **Complexity:** Small

### UXA-031 — Toggle switches are styled divs, not real toggles
- **Severity:** P1
- **Status:** Fixed (Wave 2) — replaced the two display-only divs with `<label>` wrappers containing controlled `<input type="checkbox" className="sr-only peer">` plus the same visual styling as before. Toggles are now keyboard-accessible (label-click on the surrounding row) and bound to the new `globalSettings` state from UXA-030.
- **Location:** `src/modules/roof-runner/pages/Automations.tsx` (Global Settings section)
- **User action:** Click "Allow Multiple Enrollment" or "Stop on Response" toggle.
- **Current behavior:** Toggles are display-only divs (`w-10 h-5`) with no controlled state.
- **Expected behavior:** Real toggles bound to state, value reflects current setting.
- **Fix:** Replace with controlled `<input type="checkbox">` or a Switch component.
- **Complexity:** Small

### UXA-032 — Advanced Filters apply unclear if persisted [Verify]
- **Severity:** P1
- **Status:** Won't fix (Wave 2 — scoped out) — confirmed `validateAndApply` only validates filter values and closes the modal; it doesn't actually filter the workflows list because the workflows in this page are hardcoded static data. Building a real filter engine on top of static data would be premature; this becomes meaningful only when the workflow list is wired to a real API. Tracked separately for backend integration phase.
- **Location:** `src/modules/roof-runner/pages/Automations.tsx`
- **Fix:** Verify `validateAndApply()` actually applies filters to displayed list and persists.
- **Complexity:** Small

### UXA-033 — "Create Folder" modal local-only — no backend persistence [Verify]
- **Severity:** P1
- **Status:** Fixed (Wave 2, stub) — replaced the silent `console.log` with an explicit alert that tells the user the folder name wasn't saved because backend support isn't wired yet. Honest UX while the API is being built.
- **Location:** `src/modules/roof-runner/pages/Automations.tsx`
- **User action:** Create folder, refresh.
- **Current behavior:** Folder vanishes (no API call).
- **Expected behavior:** Folder persists via `createFolder` API.
- **Fix:** Wire API.
- **Complexity:** Small

---

## Opportunities

### UXA-034 — Settings tab shows "coming soon" placeholder
- **Severity:** P1
- **Status:** Fixed (Wave 4) — replaced placeholder with `OpportunitiesSettingsPanel` (defined inline in Opportunities.tsx). Three sections: (1) Default pipeline picker driven by the live `pipelinesApi.getPipelines()`, (2) Workflow defaults (auto-archive after N days, require value on create) persisted to `localStorage` under `builderlync.opportunities.settings` as a graceful fallback while there's no settings endpoint, (3) Quick-link to the full pipeline manager (existing `PipelinesList` component) for stage editing. Save button shows Saving… / Saved / Save Changes states based on dirty tracking.
- **Location:** `src/modules/roof-runner/pages/Opportunities.tsx`, when `internalView === 'settings'`
- **User action:** Click Settings in Opportunities header.
- **Current behavior:** "Settings panel coming soon..." placeholder.
- **Expected behavior:** Pipeline configuration UI (stages, default pipeline, archive rules).
- **Fix:** Build a settings panel.
- **Complexity:** Large

---

## Marketing

### UXA-035 — Conversion Funnel hardcoded to zeros
- **Severity:** P1
- **Status:** Won't fix (Wave 2) — finding is inaccurate. The funnel uses plausible hardcoded demo data (2,450 visitors → 247 leads → 89 appointments → 67 inspections → 23 jobs), not zeros. The whole MarketingDashboard `OverviewTab` is currently a static demo surface; replacing one section's demo data without an end-to-end real data integration would be inconsistent. Tracked separately as a "demo → real data" follow-up if needed.
- **Location:** `src/modules/marketing/pages/MarketingDashboard.tsx` (Campaigns tab) — `// TODO: Connect to real data`
- **User action:** View funnel.
- **Current behavior:** All metrics show 0.
- **Expected behavior:** Real conversion metrics from campaigns.
- **Fix:** Replace `[0, 0, 0, 0, 0]` with calculated metrics from `campaignData`.
- **Complexity:** Small

### UXA-036 — Campaign filters don't reset pagination
- **Severity:** P1
- **Status:** Won't fix (Wave 1) — not applicable. `MarketingDashboard.tsx` `CampaignsTab` uses a static `useState([...])` array and does not implement pagination at all (no `currentPage` state, no `loadCampaigns` function). Finding was inferred against a different file/codebase.
- **Notes:** Should the Campaigns tab gain real pagination later, this finding becomes valid again.

### UXA-037 — Analytics platform errors silently disappear
- **Severity:** P1
- **Status:** Won't fix (Wave 2) — not applicable. The Analytics tab is fully static (hardcoded numbers, no API calls, no error handling). Platform-selector buttons are decorative. Real platform-data fetching with failure-aware UI would be a separate feature, not a fix.
- **Location:** `src/modules/marketing/pages/MarketingDashboard.tsx` (Analytics tab)
- **User action:** Open Marketing → Analytics when one platform's API fails.
- **Current behavior:** That platform's data silently missing, no error indicator.
- **Expected behavior:** Show inline alert "Google Ads connection issue" with link to Settings → Integrations.
- **Fix:** Track failed platforms in state, render alert badges.
- **Complexity:** Small

### UXA-038 — Analytics platform navigation has no error boundary
- **Severity:** P1
- **Status:** Won't fix (Wave 2) — not applicable for the same reason as UXA-037. No real navigation occurs; the platform buttons just toggle a state variable that's currently unused.

---

## File Manager

### UXA-039 — LocalFilesTab imported but never rendered
- **Severity:** P1
- **Status:** Fixed (Wave 1) — refined the actual gap. `LocalFilesTab` *was* rendered at line 479, but the page-level `if (!connection && (activeTab === 'my-cloud' || activeTab === 'local-files'))` short-circuit forced ALL users without a cloud connection into the "Connect Your Cloud Drive" empty state — including users who explicitly clicked "Local Files." Tightened the gate to `activeTab === 'my-cloud'` only, updated copy on the empty state to mention Local Files, and added a "Use Local Files Instead" button so users can opt out of cloud entirely.

---

## Reporting

### UXA-040 — "Generate Report Now" button on Audit tab does nothing
- **Severity:** P0
- **Status:** Fixed (Wave 1, stub variant) — wired `onClick` to a clear "Marketing audit generation is coming soon" alert. Full audit-generation flow tracked separately as Wave 3 follow-up if backend support lands.
- **Location:** `src/modules/roof-runner/pages/Reporting.tsx` line ~63
- **User action:** Click "Generate Report Now" on the marketing audit hero.
- **Current behavior:** No effect (no onClick).
- **Expected behavior:** Trigger audit generation and show progress / results.
- **Fix:** Add `handleGenerateAudit` that calls the audit API and shows results, or stub with "Audit feature coming soon" toast.
- **Complexity:** Medium

### UXA-041 — Custom Reports tab commented out but render case still exists
- **Severity:** P0
- **Status:** Fixed (Wave 1) — uncommented the Custom Reports tab definition. The default `case` in the tab switch already routes to `<UnifiedReportsTab>` (a real 279-line component) so the tab is now reachable.
- **Location:** `src/modules/roof-runner/pages/Reporting.tsx` lines 40-41 and 105-107
- **User action:** N/A — tab not visible.
- **Current behavior:** `// { id: 'custom-reports', ...}` commented in tabs array; case in switch defaults to `<UnifiedReportsTab>`.
- **Expected behavior:** Either uncomment + verify or remove the dead case.
- **Fix:** Uncomment the tab definition; verify `UnifiedReportsTab` works.
- **Complexity:** Trivial (uncomment) / Medium (if `UnifiedReportsTab` is itself a stub)

---

## Reputation

### UXA-042 — GBP Optimization tab is just a placeholder
- **Severity:** P1
- **Status:** Fixed (Wave 4) — replaced "Nothing to see here!" with `GbpOptimizationTab` (defined inline in Reputation.tsx). Real structured optimization checklist covering 6 high-leverage GBP signals: posting cadence, photo coverage, review velocity, NAP consistency, service area & categories, attributes & hours. Each row shows status badge (Healthy/Needs attention/Action required/Connect to scan), current metric, narrative explanation, and a specific recommendation. Header shows pass/warn/fail summary cards once GBP is connected. Until the real GBP integration ships, the tab shows the unconnected state with a clear "Connect Google Business Profile" CTA pointing at marketing/integrations and explanatory copy on what each check measures. A `localStorage` flag (`builderlync.gbp.connected = 'true'`) flips into a connected-state preview for design review and sales demos.
- **Location:** `src/modules/roof-runner/pages/Reputation.tsx` lines 62-99
- **User action:** Click GBP Optimization tab.
- **Current behavior:** "Nothing to see here!" placeholder with a link to `/marketing/integrations`.
- **Expected behavior:** GBP optimization checklist (post frequency, photo count, review velocity, NAP consistency).
- **Fix:** Build the tab content.
- **Complexity:** Large

---

## Support

### UXA-043 — ChatterMate widget fails silently
- **Severity:** P1
- **Status:** Fixed (Wave 1) — added `chattermateLoadFailed` state set by the script `onerror` handler. When the widget fails to load the card now renders an explicit amber notice ("Chat is unavailable right now…") directing users to Email Support / Knowledge Base instead of the misleading "To enable widget" instructions.
- **Location:** `src/modules/roof-runner/pages/Support.tsx` lines 49-59
- **User action:** Visit Support, expect chat widget.
- **Current behavior:** If CDN unreachable, the script `onerror` logs to console and disappears. No fallback UI.
- **Expected behavior:** Either a visible "Chat is unavailable — submit a ticket" message, or fall back gracefully to the existing Send Email card (which is already on screen).
- **Fix:** Already has email fallback elsewhere on page; minimal change. Could add a small inline notice if `script.onerror` fires.
- **Complexity:** Trivial

---

## Settings

### UXA-044 — Billing route + tab commented out
- **Severity:** P0
- **Status:** Fixed (Wave 1) — uncommented `<Route path="billing" …>` in SettingsRouter (and removed a stray `c` typo after the closing `*/`) plus uncommented the `billing` tab definition in SettingsLayout. Backing `Billing` component is real (70 lines).
- **Location:** `src/modules/roof-runner/pages/SettingsRouter.tsx` line ~21, `src/modules/roof-runner/components/settings/SettingsLayout.tsx` line ~21
- **User action:** Want to manage billing / subscription.
- **Current behavior:** No Billing tab visible; manual `/settings/billing` 404s.
- **Expected behavior:** Billing tab visible, renders `Billing` component (which exists).
- **Fix:** Uncomment route in SettingsRouter and tab in SettingsLayout.
- **Complexity:** Trivial

### UXA-045 — Audit Logs route + tab commented out
- **Severity:** P0
- **Status:** Fixed (Wave 1) — only the tab was commented; the route at SettingsRouter.tsx:31 was already uncommented. Uncommented the tab definition. Backing `AuditLogs` component is real (74 lines).

### UXA-046 — Permissions and Staff/Roles routes both render same component
- **Severity:** P1
- **Status:** Won't fix (Wave 1) — intentional aliasing. SettingsLayout has separate sidebar entries for "Staff Management" (`/staff`) and "Permissions" (`/permissions`); both URLs are user-reachable and meaningful. Treating one as a `Navigate` would change the URL the user sees on click, which is worse UX than two routes pointing at the same component.

### UXA-047 — Business Info form persistence unclear [Verify]
- **Severity:** P1
- **Status:** Verify
- **Location:** `src/modules/roof-runner/components/settings/BusinessInfo.tsx`
- **Fix:** Verify `handleSave` calls `updateBusinessInfo`, awaits, refetches.

### UXA-048 — Profile photo upload incomplete [Verify]
- **Severity:** P2
- **Status:** Verify
- **Location:** `src/modules/roof-runner/components/settings/Profile.tsx`
- **Fix:** Verify file input wires to upload + preview.

### UXA-049 — Custom Fields cross-module rendering unverified [Verify]
- **Severity:** P1
- **Status:** Verify
- **Location:** `src/modules/roof-runner/components/settings/CustomFields.tsx`
- **Fix:** Verify created custom field appears on Contacts/Jobs forms.

### UXA-050 — Brand Board upload/versioning unverified [Verify]
- **Severity:** P2
- **Status:** Verify
- **Location:** `src/modules/roof-runner/components/settings/BrandBoard.tsx`
- **Fix:** Verify logo upload persists, color picker writes back.

### UXA-051 — Email Service test send unverified [Verify]
- **Severity:** P1
- **Status:** Verify
- **Location:** `src/modules/roof-runner/components/settings/EmailService.tsx`
- **Fix:** Verify there's a "Send test email" button that works.

### UXA-052 — Notifications preferences persistence unverified [Verify]
- **Severity:** P2
- **Status:** Verify
- **Location:** `src/modules/roof-runner/components/settings/Notifications.tsx`
- **Fix:** Verify toggles persist.

### UXA-053 — Communications template send/preview unverified [Verify]
- **Severity:** P2
- **Status:** Verify
- **Location:** `src/modules/roof-runner/components/settings/Communications.tsx`
- **Fix:** Verify template editor has working preview/send-test.

### UXA-054 — Roles management — created role appears in staff dropdown [Verify]
- **Severity:** P1
- **Status:** Verify
- **Location:** `src/modules/roof-runner/components/settings/CreateRoleModal.tsx`
- **Fix:** Verify created role flows into staff role-picker without page refresh.

### UXA-055 — Integrations OAuth callbacks completion path unverified [Verify]
- **Severity:** P1
- **Status:** Verify
- **Location:** `src/modules/roof-runner/components/settings/Integrations.tsx`, `TwilioCallback.tsx`, `SocialAdsCallback.tsx`
- **Fix:** Verify each OAuth flow's callback completes correctly and updates Integrations state.

---

## Sierra AI

No critical gaps found. Both legacy (8 tabs) and new (3 tabs) layouts have all sub-pages registered and rendered.

---

## Storm Canvassing

No critical gaps found. All 9 sub-routes registered and reachable. Module is heavily data-driven (Mapbox + Supabase events/turfs/doors); empty states on staging without data are correct, not gaps.

---

# Implementation roadmap

## Wave 1 — Trivial fixes (under 30 min total)
UXA-002, UXA-008, UXA-013, UXA-019, UXA-020, UXA-021, UXA-024, UXA-027, UXA-036, UXA-039, UXA-041, UXA-044, UXA-045, UXA-046, UXA-043

## Wave 2 — Small fixes (30 min – 1 hr each)
UXA-009, UXA-010, UXA-012, UXA-014, UXA-015, UXA-017, UXA-018, UXA-022, UXA-025, UXA-028, UXA-029, UXA-030, UXA-031, UXA-032, UXA-033, UXA-035, UXA-037, UXA-038, UXA-040 (stub variant)

## Wave 3 — Medium fixes (1 – 3 hrs each)
UXA-001 (Calendar service-menu/rooms/equipment panels), UXA-003 (Advanced Filters), UXA-005 (Manage Columns), UXA-007 (Add Member modal), UXA-011 (Add Opportunity modal), UXA-040 (full audit generator)

## Wave 4 — Large fixes (3+ hrs each, scope separately)
UXA-023 (Proposal SettingsPanel), UXA-034 (Opportunities SettingsPanel), UXA-042 (GBP Optimization tab)

## Verify-first batch (do before fixing)
UXA-006, UXA-007, UXA-008, UXA-009, UXA-010, UXA-011, UXA-012, UXA-013, UXA-014, UXA-022, UXA-023, UXA-026, UXA-029, UXA-032, UXA-033, UXA-047 through UXA-055

---

# Note on staging-only gaps (data-driven)

Several modules render correctly but appear empty on staging because there's no real Supabase data:
- **Dashboard** — widgets pull from `useGetWidgetsQuery`; nothing to show without backend
- **Sierra AI** — agent retrieval needs real records
- **Storm Canvassing** — events/turfs/doors all backend-driven
- **Reporting** — most tabs need real call/appointment/ad data

These are **not UX gaps** — the code is correct. They're staging-environment data limitations. Track separately as "staging fixtures" if visible empty states cause concern during demos.
