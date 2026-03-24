# Proposals Module — Mobile Web Build Guide

**Target platform:** Responsive web application (PWA-ready, optimized for mobile browsers)
**Stack:** React 18, TypeScript, Tailwind CSS, React Router v6, Supabase JS client v2
**Audience:** Developer building the Proposals module UI from scratch as a mobile-first web experience

---

## Table of Contents

1. [Overview](#overview)
2. [Design System](#design-system)
3. [Database Schema](#database-schema)
4. [Supabase API Reference](#supabase-api-reference)
5. [Screen Specifications](#screen-specifications)
6. [Reusable Components](#reusable-components)
7. [Navigation & Routing](#navigation--routing)
8. [Auto-save & Draft Behavior](#auto-save--draft-behavior)
9. [Accessibility](#accessibility)
10. [Out of Scope for v1](#out-of-scope-for-v1)

---

## Overview

The Proposals module lets field reps and office staff create, edit, send, and track proposals (and estimates/contracts) from a mobile web browser. The primary use case is a salesperson standing at a customer's property who needs to build and send a proposal in under five minutes.

### Goals

- Create a proposal manually or via AI generation
- Edit line items with live pricing totals
- Send to a customer via email or SMS
- Track proposal status through its lifecycle
- View an activity timeline of events per proposal

### Module location in the existing app

The module lives inside the `RoofRunnerModule` router and is registered under the `/proposals/*` path. The surrounding app provides:

- `supabase` singleton from `src/shared/lib/supabase.ts`
- Global Redux store from `src/modules/roof-runner/store`
- Authenticated user available via `useSupabaseUser` hook from `src/shared/hooks/useSupabaseUser.ts`
- `organization_id` available from `OrgContext` in `src/shared/context/OrgContext.tsx`

---

## Design System

### Spacing

Use an 8px base grid. Tailwind classes map directly:

| Token | px | Tailwind |
|-------|----|---------|
| xs    | 4  | `p-1` / `gap-1` |
| sm    | 8  | `p-2` / `gap-2` |
| md    | 16 | `p-4` / `gap-4` |
| lg    | 24 | `p-6` / `gap-6` |
| xl    | 32 | `p-8` / `gap-8` |

### Typography

Maximum three font weights: `font-normal` (400), `font-medium` (500), `font-semibold` (600).

| Role           | Tailwind classes                      |
|----------------|---------------------------------------|
| Page title     | `text-xl font-semibold`               |
| Section header | `text-sm font-semibold uppercase tracking-wide text-gray-500` |
| Body           | `text-sm font-normal text-gray-700`   |
| Label          | `text-xs font-medium text-gray-500`   |
| Micro          | `text-xs font-normal text-gray-400`   |

Line height: `leading-relaxed` (150%) for body copy, `leading-tight` (120%) for headings.

### Colors

Do not use purple, indigo, or violet. Use the following palette:

| Ramp     | Primary shade | Tailwind reference |
|----------|---------------|--------------------|
| Primary  | Blue-600      | `bg-blue-600 text-white` |
| Secondary| Gray-600      | `bg-gray-100 text-gray-700` |
| Accent   | Cyan-600      | `bg-cyan-600 text-white` |
| Success  | Green-600     | `bg-green-50 text-green-700` |
| Warning  | Amber-500     | `bg-amber-50 text-amber-700` |
| Error    | Red-600       | `bg-red-50 text-red-700` |
| Neutral  | Gray-50 → Gray-900 | full Tailwind gray ramp |

### Proposal Status Badge Colors

| Status    | Background       | Text             | Border            |
|-----------|------------------|------------------|-------------------|
| draft     | `bg-gray-100`    | `text-gray-600`  | —                 |
| waiting   | `bg-amber-50`    | `text-amber-700` | `border-amber-200`|
| completed | `bg-blue-50`     | `text-blue-700`  | `border-blue-200` |
| accepted  | `bg-green-50`    | `text-green-700` | `border-green-200`|
| declined  | `bg-red-50`      | `text-red-700`   | `border-red-200`  |
| expired   | `bg-gray-50`     | `text-gray-500`  | `border-gray-200` |
| archived  | `bg-gray-50`     | `text-gray-400`  | —                 |
| payments  | `bg-cyan-50`     | `text-cyan-700`  | `border-cyan-200` |

### Dark Mode

The app uses a `ThemeContext` (see `src/shared/context/ThemeContext.tsx`). Apply dark variants using Tailwind's `dark:` prefix. Key surface tokens:

| Token        | Light              | Dark                |
|--------------|--------------------|---------------------|
| Page bg      | `bg-white`         | `dark:bg-gray-900`  |
| Card bg      | `bg-white`         | `dark:bg-gray-800`  |
| Border       | `border-gray-200`  | `dark:border-gray-700`|
| Body text    | `text-gray-700`    | `dark:text-gray-300`|
| Muted text   | `text-gray-500`    | `dark:text-gray-400`|
| Input bg     | `bg-white`         | `dark:bg-gray-900`  |

### Minimum Tap Target

All interactive elements must be at least 44 × 44 px. Use `min-h-[44px] min-w-[44px]` or ensure adequate padding.

---

## Database Schema

### `proposals`

Primary table. All queries filter by `organization_id`.

| Column                      | Type         | Nullable | Notes |
|-----------------------------|--------------|----------|-------|
| id                          | uuid (PK)    | NO       | `gen_random_uuid()` |
| organization_id             | uuid (FK)    | NO       | → `organizations.id` CASCADE |
| title                       | text         | NO       | |
| type                        | text         | YES      | `'proposal'` \| `'estimate'` \| `'contract'`. Default: `'proposal'` |
| customer_id                 | uuid (FK)    | YES      | → `contacts.id` SET NULL |
| contact_id                  | uuid (FK)    | YES      | → `contacts.id` SET NULL (alias field) |
| job_id                      | uuid (FK)    | YES      | → `jobs.id` SET NULL |
| opportunity_id              | uuid (FK)    | YES      | → `opportunities.id` SET NULL |
| status                      | text         | YES      | See status values below. Default: `'draft'` |
| value                       | decimal      | YES      | Total proposal value. Default: `0` |
| content                     | jsonb        | YES      | Structured sections. Default: `'{}'` |
| property_id                 | text         | YES      | External property identifier |
| property_address            | text         | YES      | Human-readable address |
| linked_estimate_snapshot_id | uuid (FK)    | YES      | → `estimate_snapshots.id` SET NULL |
| sent_at                     | timestamptz  | YES      | Populated when proposal is sent |
| viewed_at                   | timestamptz  | YES      | Populated when customer opens |
| accepted_at                 | timestamptz  | YES      | Populated on acceptance |
| declined_at                 | timestamptz  | YES      | Populated on decline |
| expires_at                  | timestamptz  | YES      | Expiry deadline |
| signature_url               | text         | YES      | URL to signed document |
| signature_received_at       | timestamptz  | YES      | When signature was received |
| created_by                  | uuid (FK)    | YES      | → `auth.users.id` SET NULL |
| created_at                  | timestamptz  | NO       | Default: `now()` |
| updated_at                  | timestamptz  | NO       | Auto-updated via trigger |

**Valid status values:** `'draft'`, `'waiting'`, `'completed'`, `'accepted'`, `'declined'`, `'expired'`, `'archived'`, `'payments'`

### `proposal_line_items`

One row per line item. Ordered by `line_number` (or `sort_order` for legacy rows).

| Column        | Type          | Nullable | Notes |
|---------------|---------------|----------|-------|
| id            | uuid (PK)     | NO       | |
| proposal_id   | uuid (FK)     | NO       | → `proposals.id` CASCADE |
| organization_id | uuid (FK)   | YES      | → `organizations.id` CASCADE |
| section_name  | text          | YES      | Section grouping label |
| item_name     | text          | NO       | Display name |
| name          | text          | YES      | Extended name field (mirrors item_name) |
| description   | text          | YES      | Optional description |
| quantity      | numeric(10,2) | NO       | Default: `1` |
| unit          | text          | YES      | `'EA'`, `'SQ'`, `'LF'`, `'HR'`, etc. Default: `'EA'` |
| unit_price    | numeric(12,4) | NO       | |
| total_price   | numeric(12,2) | NO       | `quantity × unit_price` — compute client-side, persist |
| is_optional   | boolean       | YES      | Default: `false` |
| is_selected   | boolean       | YES      | Default: `true` |
| line_number   | integer       | NO       | Display order. Default: `0` |
| sort_order    | integer       | YES      | Legacy sort field. Default: `0` |
| source_tag    | text          | YES      | `'manual'` \| `'estimator'` \| `'ai'`. Default: `'manual'` |
| was_edited    | boolean       | YES      | Whether user manually changed a pre-filled value. Default: `false` |
| catalog_sku   | text          | YES      | Links to `org_pricing_catalog.sku` |
| created_at    | timestamptz   | NO       | |
| updated_at    | timestamptz   | NO       | |

### `proposal_audit_trail`

Append-only event log. Never update or delete rows.

| Column               | Type        | Nullable | Notes |
|----------------------|-------------|----------|-------|
| id                   | uuid (PK)   | NO       | |
| proposal_id          | uuid (FK)   | NO       | → `proposals.id` CASCADE |
| organization_id      | uuid (FK)   | NO       | → `organizations.id` CASCADE |
| event_type           | text        | NO       | See valid event types below |
| user_id              | uuid (FK)   | YES      | → `auth.users.id` SET NULL |
| estimate_snapshot_id | uuid (FK)   | YES      | → `estimate_snapshots.id` SET NULL |
| metadata             | jsonb       | YES      | Arbitrary event context. Default: `'{}'` |
| created_at           | timestamptz | NO       | Default: `now()` |

**Valid event_type values:**
`'proposal_created'`, `'proposal_updated'`, `'proposal_created_from_estimate'`, `'proposal_updated_from_estimate'`, `'proposal_sent'`, `'proposal_viewed'`, `'proposal_accepted'`, `'proposal_declined'`, `'proposal_expired'`, `'proposal_archived'`, `'line_item_added'`, `'line_item_edited'`, `'line_item_deleted'`, `'signature_received'`

### `estimate_snapshots`

Referenced by proposals when created from the Instant Estimator. Read-only from the Proposals module.

| Key column  | Type | Notes |
|-------------|------|-------|
| id          | uuid | PK |
| organization_id | uuid | |
| property_address | text | Pre-fills proposal address |
| total_value | numeric | Pre-fills proposal value |
| created_at  | timestamptz | |

### `org_pricing_catalog`

Optional reference for line item auto-complete. Read-only from the Proposals module.

| Key column       | Type    | Notes |
|------------------|---------|-------|
| id               | uuid    | PK |
| organization_id  | uuid    | |
| sku              | text    | Unique per org |
| name             | text    | Display name |
| default_unit_price | decimal | |
| unit             | text    | |
| category         | text    | `'roofing_materials'` \| `'accessories'` \| `'labor'` |
| is_active        | boolean | Filter: only show active items |

---

## Supabase API Reference

Import the client:

```typescript
import { supabase } from '../../../shared/lib/supabase';
```

Get `organization_id` from context:

```typescript
import { useOrgContext } from '../../../shared/context/OrgContext';
const { currentOrganization } = useOrgContext();
const orgId = currentOrganization?.id;
```

### List proposals (with pagination)

```typescript
const { data, error } = await supabase
  .from('proposals')
  .select(`
    id, title, type, status, value,
    expires_at, sent_at, created_at, updated_at,
    customer_id,
    contacts!customer_id(id, first_name, last_name, email, phone)
  `)
  .eq('organization_id', orgId)
  .order('updated_at', { ascending: false })
  .range(0, 49); // 50 per page
```

### List proposals filtered by status

```typescript
.eq('status', 'draft')
// or for multiple statuses:
.in('status', ['draft', 'waiting'])
```

### Search proposals by title or customer name

```typescript
.ilike('title', `%${query}%`)
```

### Get single proposal (header only)

```typescript
const { data, error } = await supabase
  .from('proposals')
  .select('*')
  .eq('id', proposalId)
  .eq('organization_id', orgId)
  .maybeSingle();
```

### Get proposal with line items

```typescript
const { data, error } = await supabase
  .from('proposals')
  .select(`
    *,
    proposal_line_items(*)
  `)
  .eq('id', proposalId)
  .eq('organization_id', orgId)
  .maybeSingle();

// Sort line items client-side after fetch:
const lineItems = (data?.proposal_line_items ?? [])
  .sort((a, b) => (a.line_number ?? a.sort_order ?? 0) - (b.line_number ?? b.sort_order ?? 0));
```

### Get proposal with contact info

```typescript
const { data, error } = await supabase
  .from('proposals')
  .select(`
    *,
    contacts!customer_id(id, first_name, last_name, email, phone),
    proposal_line_items(*)
  `)
  .eq('id', proposalId)
  .maybeSingle();
```

### Create proposal

```typescript
const { data, error } = await supabase
  .from('proposals')
  .insert({
    organization_id: orgId,
    title,
    type: 'proposal',
    status: 'draft',
    customer_id: contactId ?? null,
    value: 0,
    content: {},
    created_by: (await supabase.auth.getUser()).data.user?.id,
  })
  .select()
  .single();
```

### Update proposal fields (auto-save)

```typescript
const { error } = await supabase
  .from('proposals')
  .update({
    title,
    type,
    expires_at: expiresAt ?? null,
    property_address: address ?? null,
    value: computedTotal,
    // updated_at is set automatically by trigger
  })
  .eq('id', proposalId)
  .eq('organization_id', orgId);
```

### Update proposal status

```typescript
const statusTimestamps: Record<string, object> = {
  waiting:   { sent_at: new Date().toISOString() },
  accepted:  { accepted_at: new Date().toISOString() },
  declined:  { declined_at: new Date().toISOString() },
  archived:  {},
};

const { error } = await supabase
  .from('proposals')
  .update({ status: newStatus, ...statusTimestamps[newStatus] })
  .eq('id', proposalId)
  .eq('organization_id', orgId);
```

### Upsert line items (replace all)

Replace the entire set of line items in a single transaction-like sequence:

```typescript
// 1. Delete all existing line items
await supabase
  .from('proposal_line_items')
  .delete()
  .eq('proposal_id', proposalId);

// 2. Insert the new set
const rows = lineItems.map((item, index) => ({
  proposal_id: proposalId,
  organization_id: orgId,
  item_name: item.name,
  name: item.name,
  description: item.description ?? null,
  quantity: item.quantity,
  unit: item.unit,
  unit_price: item.unitPrice,
  total_price: item.quantity * item.unitPrice,
  line_number: index,
  sort_order: index,
  source_tag: item.sourceTag ?? 'manual',
  was_edited: item.wasEdited ?? false,
  catalog_sku: item.catalogSku ?? null,
  is_optional: item.isOptional ?? false,
  is_selected: item.isSelected ?? true,
  section_name: item.sectionName ?? null,
}));

await supabase.from('proposal_line_items').insert(rows);
```

### Add a single line item

```typescript
const { data, error } = await supabase
  .from('proposal_line_items')
  .insert({
    proposal_id: proposalId,
    organization_id: orgId,
    item_name: 'New Item',
    name: 'New Item',
    quantity: 1,
    unit: 'EA',
    unit_price: 0,
    total_price: 0,
    line_number: nextLineNumber,
    sort_order: nextLineNumber,
    source_tag: 'manual',
  })
  .select()
  .single();
```

### Update a single line item

```typescript
const { error } = await supabase
  .from('proposal_line_items')
  .update({
    item_name: name,
    name,
    quantity,
    unit_price: unitPrice,
    total_price: quantity * unitPrice,
    was_edited: true,
  })
  .eq('id', lineItemId);
```

### Delete a single line item

```typescript
const { error } = await supabase
  .from('proposal_line_items')
  .delete()
  .eq('id', lineItemId);
```

### Delete proposal (soft-delete via archive)

Prefer archiving over hard deletes:

```typescript
await supabase
  .from('proposals')
  .update({ status: 'archived' })
  .eq('id', proposalId)
  .eq('organization_id', orgId);
```

Hard delete (only if explicitly triggered by user):

```typescript
await supabase
  .from('proposals')
  .delete()
  .eq('id', proposalId)
  .eq('organization_id', orgId);
```

### Get audit trail for a proposal

```typescript
const { data, error } = await supabase
  .from('proposal_audit_trail')
  .select('*')
  .eq('proposal_id', proposalId)
  .order('created_at', { ascending: false });
```

### Log an audit event

```typescript
await supabase
  .from('proposal_audit_trail')
  .insert({
    proposal_id: proposalId,
    organization_id: orgId,
    event_type: 'proposal_sent',
    user_id: currentUserId,
    metadata: { channel: 'email', recipient: emailAddress },
  });
```

### Fetch pricing catalog for line item autocomplete

```typescript
const { data, error } = await supabase
  .from('org_pricing_catalog')
  .select('id, sku, name, default_unit_price, unit, category')
  .eq('organization_id', orgId)
  .eq('is_active', true)
  .order('name');
```

### Fetch contacts for customer picker

```typescript
const { data, error } = await supabase
  .from('contacts')
  .select('id, first_name, last_name, email, phone')
  .eq('organization_id', orgId)
  .ilike('first_name', `%${query}%`)
  .limit(20);
```

---

## Screen Specifications

### 1. Proposals Home (`/proposals`)

**Purpose:** Landing page. Provides at-a-glance KPIs and quick entry points.

#### Layout

- Fixed top bar (44px) with page title "Proposals" and a `+` icon button
- Scrollable body below
- Fixed FAB in bottom-right corner (fallback if top bar icon is insufficient for discoverability)

#### Stats Strip

Four KPI cards in a 2×2 grid (or horizontal scroll on very small viewports).

| Card | Query |
|------|-------|
| Total Value | `SUM(value)` WHERE status NOT IN (`'archived'`) |
| Accepted Value | `SUM(value)` WHERE status = `'accepted'` |
| Awaiting | `COUNT(*)` WHERE status IN (`'waiting'`, `'draft'`) |
| Drafts | `COUNT(*)` WHERE status = `'draft'` |

Compute these client-side from a single query that fetches `id`, `status`, `value` for all non-archived proposals.

#### Recent Proposals List

- Heading: "Recent Proposals"
- Show the 5 most recently updated proposals (any status except `'archived'`)
- Each row is a `ProposalCard` component (see Reusable Components)
- "View all" link navigates to `/proposals/all`

#### Quick Action Buttons

Two full-width buttons below the stats strip:

| Label | Action |
|-------|--------|
| Browse All Proposals | Navigate to `/proposals/all` |
| Generate with AI | Navigate to `/proposals/ai-generate` |

#### New Proposal Bottom Sheet

Triggered by FAB or `+` icon. Contains:

- Text input: Proposal title (required)
- Dropdown: Type — Proposal / Estimate / Contract
- Contact search input with autocomplete (searches `contacts` table)
- Submit button: "Create Proposal" — inserts row, navigates to `/proposals/:id/edit`
- Cancel button

Sheet slides up from the bottom with a backdrop overlay. Trap focus inside the sheet while open.

---

### 2. All Proposals List (`/proposals/all`)

**Purpose:** Browse, search, and filter the full proposals list.

#### Layout

- Top bar with back button and search input
- Filter chip row (horizontal scroll, no wrap)
- Proposal list (infinite scroll or paginated with "Load more")

#### Search Bar

- Debounce: 300ms
- Searches `title` field via `.ilike('title', '%query%')`
- Clear button (×) when input is non-empty

#### Filter Chips

One chip per status plus an "All" chip. Active chip uses primary blue fill, inactive chips use gray outline.

Order: All · Draft · Waiting · Completed · Accepted · Declined · Expired · Archived · Payments

Tapping a chip sets a single active filter. "All" clears the filter.

#### Proposal Card (in list)

See Reusable Components section. Tapping a card navigates to `/proposals/:id/preview`.

#### Swipe-to-Archive

On mobile web, implement swipe-left gesture on each card to reveal an "Archive" action button (red background, white "Archive" text). Confirm before archiving if status is `'accepted'`.

#### Sort Options

Accessible via a sort icon button in the top bar. Options:

- Last modified (default)
- Newest first
- Oldest first
- Value: high to low
- Value: low to high

---

### 3. Proposal Builder (`/proposals/new` and `/proposals/:id/edit`)

**Purpose:** Create or edit a proposal. This is the primary editing screen.

#### Layout

- Top bar: back button, proposal title (editable inline), auto-save indicator, "Send" button
- Three-tab navigation: Overview · Line Items · Totals
- Tab content area (scrollable)
- Keyboard-aware layout: when a soft keyboard is visible, the tab bar stays fixed above it

#### Tab: Overview

Fields (all auto-save on change with 1500ms debounce):

| Field | Input type | Notes |
|-------|-----------|-------|
| Title | Text input | Required. Inline edit in top bar or repeated in form |
| Type | Segmented control | Proposal / Estimate / Contract |
| Customer | Contact search | Searchable dropdown |
| Property address | Text input + Google Places | Optional |
| Expiry date | Date picker | Minimum: today |
| Internal notes | Textarea | Not visible to customer |

#### Tab: Line Items

- List of `LineItemRow` components ordered by `line_number`
- "Add Line Item" button at bottom opens `MaterialFormModal` (inline or bottom sheet)
- Each row supports:
  - Tap to edit (opens edit bottom sheet or expands inline)
  - Drag handle for reordering (use `@dnd-kit/sortable` — already in `package.json`)
  - Swipe-left or long-press to reveal "Delete" action
- After reorder, reassign `line_number` = index and persist
- Section name support: optional text above a group of line items

**Line Item Edit Form fields:**

| Field | Input type |
|-------|-----------|
| Name | Text input (required) |
| Description | Textarea (optional) |
| Section | Text input (optional) |
| Quantity | Numeric input (min: 0.01) |
| Unit | Dropdown: EA, SQ, LF, HR, LS, Bundle, Roll, Allow |
| Unit price | Currency input |
| Is optional | Toggle |

Computed `total_price = quantity × unit_price` shown read-only below inputs.

**Pricing catalog autocomplete:** When the user types in the Name field, query `org_pricing_catalog` and show matching suggestions. Selecting a suggestion pre-fills name, unit, and unit_price.

#### Tab: Totals

Read-only summary computed from line items:

| Row | Calculation |
|-----|------------|
| Subtotal | `SUM(total_price)` of all non-optional OR all selected items |
| Optional items | `SUM(total_price)` of optional items (shown separately) |
| Tax | Not computed in v1 — show "—" |
| **Total** | Subtotal (bold, larger font) |

Also shows the current `proposals.value` as stored and a "Recalculate & Save" button if the stored value differs from the computed total.

#### Auto-save Indicator (top bar)

| State | Display |
|-------|---------|
| Saved | Green dot + "Saved" (fades out after 2s) |
| Saving | Spinner + "Saving…" |
| Unsaved changes | Amber dot + "Unsaved" |
| Error | Red dot + "Save failed — Retry" |

#### Send Button

Opens the Send Proposal Bottom Sheet (see below). Only enabled when status is NOT `'accepted'` or `'archived'`.

---

### 4. Proposal Detail / Preview (`/proposals/:id/preview`)

**Purpose:** Read-only view for reviewing a proposal before sending, or reviewing the state of a sent proposal.

#### Layout

- Top bar: back button, proposal title, status badge, action menu (⋮)
- Scrollable body
- Sticky footer with primary actions

#### Header Card

Displays:
- Customer name and contact info
- Property address (if set)
- Sent date (if sent)
- Expiry date (with "Expires in X days" or "Expired" label)
- Total value (large, prominent)

#### Line Items List (collapsible sections)

- Group by `section_name` (ungrouped items shown under an implicit "Items" group)
- Each item shows: name, quantity × unit, total price
- Optional items shown with "Optional" badge and reduced opacity
- Collapse/expand each section with a chevron

#### Proposal Value Summary

- Subtotal
- Optional items subtotal
- **Total** (bold)

#### Activity Timeline

Fetched from `proposal_audit_trail`, ordered newest-first. Each entry shows:
- Event icon (send, view, accept, decline, edit, etc.)
- Human-readable event label (see mapping below)
- Relative timestamp ("2 hours ago", "3 days ago")

Event label mapping:

| event_type | Display label |
|-----------|---------------|
| proposal_created | Created |
| proposal_updated | Updated |
| proposal_sent | Sent to customer |
| proposal_viewed | Viewed by customer |
| proposal_accepted | Accepted |
| proposal_declined | Declined |
| proposal_archived | Archived |
| proposal_expired | Expired |
| line_item_added | Line item added |
| line_item_edited | Line item edited |
| line_item_deleted | Line item deleted |
| signature_received | Signature received |
| proposal_created_from_estimate | Created from estimate |
| proposal_updated_from_estimate | Updated from estimate |

#### Footer Actions

| Status | Primary action | Secondary action |
|--------|---------------|-----------------|
| draft | Edit | Send |
| waiting | Send again | Edit |
| accepted | — | Archive |
| declined | Edit (as new) | Archive |
| expired | Edit | Archive |
| archived | — | — |

#### Action Menu (⋮)

- Edit
- Send
- Duplicate (creates a new draft with the same title + "(copy)", same line items)
- Archive
- Delete (with confirmation dialog)

---

### 5. AI Proposal Generator (`/proposals/ai-generate`)

**Purpose:** 4-step wizard that uses AI to generate proposal content.

#### Wizard Layout

- Top bar: back button, step counter ("Step 2 of 4"), title
- Progress dots (4 dots, filled up to current step)
- Step content area (scrollable)
- Bottom navigation: "Back" (ghost) and "Continue" (primary) buttons — both full width, side by side

#### Step 1: Basic Info

Fields:
- Proposal title (text input, required)
- Customer (contact search, optional)
- Property address (text input, optional)
- Proposal type (segmented control: Proposal / Estimate / Contract)

Validation: Title must be non-empty to advance.

#### Step 2: Template & Sections

- Section heading: "What should the proposal include?"
- Checklist of content sections (multi-select toggles):

| Section | Default |
|---------|---------|
| Executive Summary | ON |
| Scope of Work | ON |
| Materials & Specifications | ON |
| Pricing Breakdown | ON |
| Warranty Information | ON |
| Company Credentials | OFF |
| Timeline | OFF |
| Payment Terms | OFF |

- "Additional instructions for the AI" — textarea (optional, max 500 chars)

#### Step 3: Generating

- Full-screen loading state (no back/continue buttons)
- Animated progress bar or pulsing dots
- Rotating status messages:
  - "Analyzing your property data…"
  - "Drafting scope of work…"
  - "Building pricing breakdown…"
  - "Polishing the final proposal…"
- Each message shows for ~2s before cycling
- This screen triggers the actual AI API call (call the `proposal-ai-generate` Supabase Edge Function if available, otherwise stub with a mock response for v1)
- On success: advances to Step 4
- On error: shows an error state with "Try again" button

**Edge Function call (if integrated):**

```typescript
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/proposal-ai-generate`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      type,
      customerName,
      propertyAddress,
      selectedSections,
      additionalInstructions,
      organizationId: orgId,
    }),
  }
);
const result = await response.json();
```

**v1 stub if Edge Function is not yet deployed:** After a 3-second timeout, create a draft proposal and navigate to its edit screen.

#### Step 4: Review & Edit

- Heading: "Review your AI-generated proposal"
- Displays the generated `content` sections (read-only preview, similar to Proposal Detail)
- "Edit in builder" button — navigates to `/proposals/:id/edit`
- "Send now" button — opens the Send Proposal Bottom Sheet

---

### 6. Send Proposal Bottom Sheet

Appears as a modal bottom sheet triggered from the Proposal Builder's Send button or the detail screen's footer action.

#### Fields

| Field | Type | Notes |
|-------|------|-------|
| Channel | Toggle | Email / SMS |
| Recipient email or phone | Text input | Pre-filled from contact |
| Subject line | Text input (email only) | Pre-filled: proposal title |
| Message | Textarea | Optional. Max 500 chars |
| Expiry date | Date picker | Optional. Updates `expires_at` |

#### Actions

- "Cancel" — dismisses sheet
- "Send Proposal" — primary button

On send:
1. Update `proposals.status` to `'waiting'` and `proposals.sent_at` to now
2. Insert `proposal_audit_trail` row with `event_type = 'proposal_sent'` and `metadata.channel`
3. Call send service (email/SMS via the `send-email` or `send-sms` Edge Functions already deployed)
4. Show success toast: "Proposal sent"
5. Navigate back to proposal detail or home

---

## Reusable Components

### `StatusBadge`

```tsx
interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}
```

Renders a pill with the correct background/text color from the status color table. Maps status to a human-readable label:

| status   | Label      |
|----------|------------|
| draft    | Draft      |
| waiting  | Sent       |
| completed| Completed  |
| accepted | Accepted   |
| declined | Declined   |
| expired  | Expired    |
| archived | Archived   |
| payments | Payments   |

### `ProposalCard`

Used in both the home screen recent list and the all-proposals list.

```tsx
interface ProposalCardProps {
  proposal: {
    id: string;
    title: string;
    status: string;
    value: number;
    updated_at: string;
    expires_at?: string;
    contacts?: { first_name: string; last_name: string } | null;
  };
  onClick: (id: string) => void;
}
```

Layout:
- Left: status color bar (4px wide, full height, rounded)
- Body: title (medium weight), customer name (muted), relative updated date (micro)
- Right: formatted value (medium, right-aligned), status badge

### `LineItemRow`

```tsx
interface LineItemRowProps {
  item: LineItem;
  onEdit: (item: LineItem) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: object; // from @dnd-kit
}
```

Layout:
- Left: drag handle icon (6 dots), item name
- Center: quantity × unit
- Right: total price, more icon (⋮)

### `StatsCard`

```tsx
interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: { direction: 'up' | 'down' | 'flat'; label: string };
}
```

Renders a white card with label in muted micro type and value in large semibold. Optional trend indicator.

### `BottomSheet`

```tsx
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  snapPoints?: ('50%' | '75%' | '95%')[];
}
```

Implementation requirements:
- Slides up with a CSS transition (`transform: translateY`)
- Semi-transparent backdrop (`bg-black/40`) with click-to-close
- Drag handle bar at top center
- Traps focus while open (use `focus-trap` or manual `tabIndex` management)
- Closes on Escape key
- `snap-points` controls initial height; user can drag to resize

### `ProgressDots`

```tsx
interface ProgressDotsProps {
  total: number;
  current: number; // 1-indexed
}
```

Renders `total` dots. Dots up to and including `current` are filled blue; the rest are gray outlines.

### `FAB` (Floating Action Button)

```tsx
interface FABProps {
  onClick: () => void;
  label?: string; // accessible label
}
```

Fixed bottom-right, `bottom-6 right-6`, 56×56px, blue background, white `+` icon, shadow-lg. Includes `aria-label`.

### `AutoSaveIndicator`

```tsx
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  state: SaveState;
  onRetry?: () => void;
}
```

Renders inline in the top bar, right of the title. See state display table in Screen Specifications §3.

---

## Navigation & Routing

### URL Structure

| Screen | Path |
|--------|------|
| Proposals Home | `/proposals` |
| All Proposals | `/proposals/all` |
| AI Generator | `/proposals/ai-generate` |
| New Proposal (builder) | `/proposals/new` |
| Edit Proposal | `/proposals/:proposalId/edit` |
| Preview Proposal | `/proposals/:proposalId/preview` |

### Back Navigation

| From | Back goes to |
|------|-------------|
| All Proposals | Proposals Home |
| AI Generator | Proposals Home |
| Proposal Builder (`/new`) | Proposals Home |
| Proposal Builder (`/edit`) | Proposal Detail (preview) |
| Proposal Detail | All Proposals (or Home if navigated from Home) |

Use `useNavigate(-1)` for back navigation when the history entry exists; otherwise navigate to the logical parent.

### Route Registration in `RoofRunnerModule.tsx`

Add these routes inside the existing `<Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>` block:

```tsx
<Route path="proposals" element={<ProposalsHome />} />
<Route path="proposals/all" element={<ProposalsAllList />} />
<Route path="proposals/ai-generate" element={<AIProposalGenerator />} />
<Route path="proposals/new" element={<ProposalBuilder />} />
<Route path="proposals/:proposalId/edit" element={<ProposalBuilder />} />
<Route path="proposals/:proposalId/preview" element={<ProposalDetail />} />
```

The `:proposalId` param is read with `useParams<{ proposalId: string }>()`. The `ProposalBuilder` component uses `proposalId` (if present) to distinguish create vs. edit mode.

---

## Auto-save & Draft Behavior

### Debounce Strategy

- All text field changes are debounced **1500ms** before triggering a Supabase `update`.
- Structural changes (status updates, line item add/delete/reorder) are **immediate** (no debounce).

### Save State Machine

```
idle → saving → saved → idle (after 2s)
            ↘ error → idle (after retry or dismiss)
```

- On every field change: set state to `'saving'`, start/reset debounce timer.
- When debounce fires and the Supabase call succeeds: set state to `'saved'`.
- On Supabase error: set state to `'error'`, display retry option.
- After 2 seconds in `'saved'`: return to `'idle'`.

### Proposal Value Sync

After every line item change (add, edit, delete, reorder), recompute:

```typescript
const newTotal = lineItems.reduce((sum, item) => sum + item.total_price, 0);
```

Immediately update `proposals.value` in Supabase (no debounce — this is a structural change).

### Conflict-free Optimistic Updates

For line item reordering, apply the new order in the local state immediately (optimistic). If the Supabase persist fails, revert to the previous order and show an error toast.

---

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Minimum tap target | `min-h-[44px] min-w-[44px]` on all buttons, chips, and card items |
| Focus management in wizard | On step change, call `focus()` on the first interactive element in the new step using a `useEffect` |
| Bottom sheet focus trap | When open, tab cycling must stay within the sheet. On close, return focus to the trigger element |
| Status badges | Do not rely on color alone. Include the text label |
| Loading states | Announce with `role="status"` and `aria-live="polite"` |
| Drag & drop | Provide keyboard alternative: up/down arrow buttons next to each line item for reordering |
| Contrast | All text on white/light backgrounds must pass WCAG AA (4.5:1 for body, 3:1 for large text) |
| Form inputs | Every input has an associated `<label>` (visible or via `aria-label`) |

---

## Out of Scope for v1

The following features are explicitly **not** part of the initial build. Do not design for them — build the minimum for current requirements.

- PDF export / print view
- E-signature collection (the `signature_url` column exists but the collection flow is not built)
- QuickBooks sync (the QuickBooks callback route exists in the app but proposal sync is not wired)
- Recurring proposals / subscriptions
- Proposal templates library (the `templates` table exists but is not surfaced in this module)
- Multi-currency support
- Discount / tax line items
- Customer-facing portal URL (public link for customers to view/accept online)
- Push notifications when a proposal is viewed or accepted
- Bulk actions (bulk archive, bulk send)
