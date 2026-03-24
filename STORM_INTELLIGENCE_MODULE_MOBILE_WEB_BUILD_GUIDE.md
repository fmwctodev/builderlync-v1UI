# Storm Intelligence Module — Mobile Web Build Guide

**Target platform:** Responsive web application (PWA-ready, optimized for mobile browsers)
**Stack:** React 18, TypeScript, Tailwind CSS, React Router v6, Supabase JS client v2, Mapbox GL JS
**Audience:** Developer building the Storm Intelligence (Storm Canvassing) module UI from scratch as a mobile-first web experience

---

## Table of Contents

1. [Overview](#overview)
2. [Design System](#design-system)
3. [Database Schema](#database-schema)
4. [Supabase API Reference](#supabase-api-reference)
5. [Screen Specifications](#screen-specifications)
6. [Reusable Components](#reusable-components)
7. [Navigation & Routing](#navigation--routing)
8. [Offline Mode Architecture](#offline-mode-architecture)
9. [GPS & Location Tracking](#gps--location-tracking)
10. [Accessibility](#accessibility)
11. [Out of Scope for v1](#out-of-scope-for-v1)

---

## Overview

The Storm Intelligence module is a field-first canvassing tool that lets roofing sales reps identify storm-damaged neighborhoods, manage canvassing territories (turfs), log door-to-door visit outcomes, reveal homeowner contact information, and pipeline interested homeowners into leads and appointments — all from a mobile browser, including offline.

### Goals

- Import storm events from NOAA or third-party providers (HailTrace, HailRecon) to identify hail-hit neighborhoods
- Define geographic turfs (territories) tied to a storm event and assign reps to them
- Field reps knock on doors and log outcomes (Interested, No Answer, Do Not Knock, etc.)
- Reveal homeowner contact information using a credit-based system
- Convert interested homeowners into canvass leads and schedule inspection appointments
- Managers see live rep GPS locations, leaderboards, and completion progress
- All visit logging works offline; data syncs when connectivity returns

### Module location in the existing app

The module lives inside the `RoofRunnerModule` router and is registered under the `/storm-canvassing/*` path. The surrounding app provides:

- `supabase` singleton from `src/shared/lib/supabase.ts`
- Authenticated user available via `useSupabaseUser` hook from `src/shared/hooks/useSupabaseUser.ts`
- `organization_id` available from `OrgContext` in `src/shared/context/OrgContext.tsx`
- Mapbox GL JS is already in `package.json` as `mapbox-gl` and `react-map-gl`
- Dexie (IndexedDB wrapper) is already in `package.json` as `dexie` and `dexie-react-hooks`

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

### Hail Severity Color Scale

This is a core visual system used on the map and throughout the module. Seven severity bands from trace to baseball-size hail. Each band maps to a warm color getting progressively darker/more saturated:

| Band         | Min inches | Color         | Tailwind bg         | Tailwind text        |
|--------------|-----------|---------------|---------------------|----------------------|
| TRACE        | 0.10"     | `#FEF3C7`     | `bg-yellow-100`     | `text-yellow-800`    |
| QUARTER      | 0.25"     | `#FDE68A`     | `bg-yellow-200`     | `text-yellow-800`    |
| HALF         | 0.50"     | `#FBBF24`     | `bg-amber-400`      | `text-white`         |
| THREE_QUARTER| 0.75"     | `#F59E0B`     | `bg-amber-500`      | `text-white`         |
| ONE_INCH     | 1.00"     | `#EF4444`     | `bg-red-500`        | `text-white`         |
| GOLF_BALL    | 1.75"     | `#DC2626`     | `bg-red-600`        | `text-white`         |
| BASEBALL     | 2.75"     | `#991B1B`     | `bg-red-900`        | `text-white`         |

A hail severity legend is shown on the map and in the storm event detail page. Render it as a horizontal bar with 7 labeled color stops.

### Turf Status Badge Colors

| Status       | Background        | Text              | Border               |
|--------------|-------------------|-------------------|----------------------|
| NOT_STARTED  | `bg-gray-100`     | `text-gray-600`   | —                    |
| IN_PROGRESS  | `bg-blue-50`      | `text-blue-700`   | `border-blue-200`    |
| COMPLETED    | `bg-green-50`     | `text-green-700`  | `border-green-200`   |
| ARCHIVED     | `bg-gray-50`      | `text-gray-400`   | —                    |

### Storm Event Status Badge Colors

| Status     | Background        | Text              | Border               |
|------------|-------------------|-------------------|----------------------|
| processing | `bg-amber-50`     | `text-amber-700`  | `border-amber-200`   |
| ready      | `bg-green-50`     | `text-green-700`  | `border-green-200`   |
| archived   | `bg-gray-50`      | `text-gray-400`   | —                    |
| failed     | `bg-red-50`       | `text-red-700`    | `border-red-200`     |

### Canvass Outcome Colors (Door Marker & Badge)

| Outcome            | Map marker color  | Badge bg           | Badge text          |
|--------------------|-------------------|--------------------|---------------------|
| NO_ANSWER          | `#6B7280` (gray)  | `bg-gray-100`      | `text-gray-600`     |
| NOT_HOME           | `#9CA3AF` (gray)  | `bg-gray-100`      | `text-gray-500`     |
| INTERESTED         | `#16A34A` (green) | `bg-green-50`      | `text-green-700`    |
| APPOINTMENT_SET    | `#2563EB` (blue)  | `bg-blue-50`       | `text-blue-700`     |
| FOLLOW_UP          | `#D97706` (amber) | `bg-amber-50`      | `text-amber-700`    |
| CALLBACK_REQUESTED | `#0891B2` (cyan)  | `bg-cyan-50`       | `text-cyan-700`     |
| NOT_INTERESTED     | `#EF4444` (red)   | `bg-red-50`        | `text-red-700`      |
| DO_NOT_KNOCK       | `#991B1B` (dark)  | `bg-red-100`       | `text-red-900`      |

Unvisited door markers use `#3B82F6` (blue-500). Do-Not-Knock doors display a stop-sign icon overlay.

### Lead Pipeline Status Colors

| Status    | Background        | Text              | Border               |
|-----------|-------------------|-------------------|----------------------|
| NEW       | `bg-gray-100`     | `text-gray-600`   | —                    |
| CONTACTED | `bg-blue-50`      | `text-blue-700`   | `border-blue-200`    |
| SCHEDULED | `bg-amber-50`     | `text-amber-700`  | `border-amber-200`   |
| WON       | `bg-green-50`     | `text-green-700`  | `border-green-200`   |
| LOST      | `bg-red-50`       | `text-red-700`    | `border-red-200`     |

### Dark Mode

The app uses `ThemeContext` (`src/shared/context/ThemeContext.tsx`). Apply dark variants using Tailwind's `dark:` prefix.

| Token     | Light             | Dark                  |
|-----------|-------------------|-----------------------|
| Page bg   | `bg-gray-50`      | `dark:bg-gray-900`    |
| Card bg   | `bg-white`        | `dark:bg-gray-800`    |
| Border    | `border-gray-200` | `dark:border-gray-700`|
| Body text | `text-gray-700`   | `dark:text-gray-300`  |
| Muted     | `text-gray-500`   | `dark:text-gray-400`  |
| Input bg  | `bg-white`        | `dark:bg-gray-900`    |
| Map panel | `bg-white`        | `dark:bg-gray-800`    |

### Minimum Tap Target

All interactive elements must be at least 44 × 44 px. Outcome buttons in canvassing mode must be at least 64px tall for gloved-hand usability. Use `min-h-[44px]` or `min-h-[64px]` as needed.

---

## Database Schema

All tables are in the `public` schema. All queries filter by `organization_id`. RLS ensures users can only access rows belonging to their organization.

### `storm_events`

| Column           | Type           | Nullable | Notes |
|------------------|----------------|----------|-------|
| id               | uuid (PK)      | NO       | `gen_random_uuid()` |
| organization_id  | uuid (FK)      | NO       | → `organizations.id` CASCADE |
| provider         | text           | NO       | `'MOCK'` \| `'HAILTRACE'` \| `'HAIL_RECON'`. Default: `'MOCK'` |
| external_id      | text           | YES      | Provider's internal ID. Unique with `(organization_id, provider)` |
| name             | text           | NO       | Display name e.g. "Austin Metro Hailstorm" |
| description      | text           | YES      | |
| event_date       | date           | YES      | Calendar date of storm |
| event_start      | timestamptz    | YES      | Storm start time |
| event_end        | timestamptz    | YES      | Storm end time |
| bbox             | jsonb          | YES      | `{ minLng, minLat, maxLng, maxLat }` bounding box |
| center_lat       | double precision | YES    | Center latitude |
| center_lng       | double precision | YES    | Center longitude |
| metadata         | jsonb          | YES      | Provider-specific extra fields. Default: `{}` |
| is_active        | boolean        | YES      | Whether event is shown by default. Default: `true` |
| status           | storm_event_status | YES  | See status enum below. Default: `'ready'` |
| max_hail_estimate| double precision | YES    | Largest hail size in inches in this event |
| confidence_score | double precision | YES    | 0.0–1.0 confidence in storm data |
| ingestion_job_id | uuid (FK)      | YES      | → `storm_ingestion_jobs.id` SET NULL |
| created_at       | timestamptz    | NO       | Default: `now()` |
| updated_at       | timestamptz    | NO       | Auto-updated via trigger |
| created_by       | uuid (FK)      | YES      | → `auth.users.id` |

**`storm_event_status` enum:** `'processing'`, `'ready'`, `'archived'`, `'failed'`

### `storm_layers`

One or more layers per storm event (typically a HAIL layer, optionally WIND).

| Column          | Type               | Nullable | Notes |
|-----------------|--------------------|----------|-------|
| id              | uuid (PK)          | NO       | |
| organization_id | uuid (FK)          | NO       | → `organizations.id` CASCADE |
| storm_event_id  | uuid (FK)          | NO       | → `storm_events.id` CASCADE DELETE |
| name            | text               | NO       | e.g. "Hail Layer" |
| layer_type      | storm_layer_type   | NO       | `'HAIL'` \| `'WIND'` \| `'TORNADO'` \| `'FLOOD'`. Default: `'HAIL'` |
| format          | storm_layer_format | NO       | `'GEOJSON'` \| `'TILESET_URL'`. Default: `'GEOJSON'` |
| geojson         | jsonb              | YES      | Full GeoJSON FeatureCollection when `format = 'GEOJSON'` |
| source_url      | text               | YES      | Tileset URL when `format = 'TILESET_URL'` |
| min_threshold   | double precision   | YES      | Minimum value for color scale |
| max_threshold   | double precision   | YES      | Maximum value for color scale |
| style           | jsonb              | YES      | `{ fillColor, fillOpacity, strokeColor, strokeWidth, colorScale }` |
| is_visible      | boolean            | YES      | Default: `true` |
| display_order   | integer            | YES      | Default: `0` |
| tile_template   | text               | YES      | Tile URL template for raster tiles |
| source_path     | text               | YES      | Storage bucket path for raw source files |
| generated_at    | timestamptz        | YES      | When the layer data was generated |
| created_at      | timestamptz        | NO       | Default: `now()` |
| updated_at      | timestamptz        | NO       | Auto-updated via trigger |

### `turfs`

Geographic canvassing territories. `geometry` stores the polygon as a JSON MultiPolygon (GeoJSON-shaped object, not a PostGIS geography type in the later schema revision). Use `bbox` for fast map bounds.

| Column          | Type         | Nullable | Notes |
|-----------------|--------------|----------|-------|
| id              | uuid (PK)    | NO       | |
| organization_id | uuid (FK)    | NO       | → `organizations.id` CASCADE |
| storm_event_id  | uuid (FK)    | YES      | → `storm_events.id` SET NULL |
| name            | text         | NO       | Territory display name |
| description     | text         | YES      | |
| geometry        | jsonb        | NO       | GeoJSON MultiPolygon. Default: `{"type":"MultiPolygon","coordinates":[]}` |
| bbox            | jsonb        | YES      | `{ minLng, minLat, maxLng, maxLat }` for quick map fit |
| status          | turf_status  | NO       | Default: `'NOT_STARTED'` |
| total_doors     | integer      | YES      | Cached count. Updated by `generate_doors_in_turf` and triggers |
| visited_doors   | integer      | YES      | Cached count. Updated by `update_door_after_visit` trigger |
| color           | text         | YES      | Hex color for map rendering. Default: `'#3B82F6'` |
| priority        | integer      | YES      | 1 (high) – 3 (low). Default: `2` |
| created_by      | uuid (FK)    | YES      | → `auth.users.id` |
| created_at      | timestamptz  | NO       | Default: `now()` |
| updated_at      | timestamptz  | NO       | Auto-updated via trigger |

**`turf_status` enum:** `'NOT_STARTED'`, `'IN_PROGRESS'`, `'COMPLETED'`, `'ARCHIVED'`

### `turf_assignments`

Links users to turfs. A user can be assigned to multiple turfs; a turf can have multiple assignees.

| Column          | Type                  | Nullable | Notes |
|-----------------|-----------------------|----------|-------|
| id              | uuid (PK)             | NO       | |
| organization_id | uuid (FK)             | NO       | → `organizations.id` CASCADE |
| turf_id         | uuid (FK)             | NO       | → `turfs.id` CASCADE DELETE |
| user_id         | uuid (FK)             | NO       | → `auth.users.id` CASCADE DELETE |
| status          | turf_assignment_status | NO      | Default: `'ASSIGNED'` |
| assigned_at     | timestamptz           | YES      | Default: `now()` |
| assigned_by     | uuid (FK)             | YES      | → `auth.users.id` |
| started_at      | timestamptz           | YES      | Set when rep begins canvassing |
| completed_at    | timestamptz           | YES      | Set when rep finishes turf |

**Unique constraint:** `(turf_id, user_id)`

**`turf_assignment_status` enum:** `'ASSIGNED'`, `'ACTIVE'`, `'DONE'`

### `doors`

Individual properties (addresses) within a turf. Coordinates are stored as plain `double precision` columns (`lat`, `lng`) — not as a PostGIS geography column.

| Column              | Type             | Nullable | Notes |
|---------------------|------------------|----------|-------|
| id                  | uuid (PK)        | NO       | |
| organization_id     | uuid (FK)        | NO       | → `organizations.id` CASCADE |
| turf_id             | uuid (FK)        | YES      | → `turfs.id` SET NULL |
| normalized_address  | text             | YES      | Lowercase canonical form for dedup |
| address1            | text             | NO       | Street address |
| address2            | text             | YES      | Apt/suite |
| city                | text             | NO       | |
| state               | text             | NO       | Two-letter state code |
| zip                 | text             | NO       | |
| country             | text             | YES      | Default: `'US'` |
| lat                 | double precision | NO       | Latitude. Default: `0` |
| lng                 | double precision | NO       | Longitude. Default: `0` |
| parcel_id           | text             | YES      | County parcel ID if available |
| property_type       | text             | YES      | e.g. `'residential'`, `'commercial'` |
| last_visit_at       | timestamptz      | YES      | Updated by `update_door_after_visit` trigger |
| last_outcome        | canvass_outcome  | YES      | Updated by trigger after each visit |
| visit_count         | integer          | YES      | Incremented by trigger. Default: `0` |
| is_do_not_knock     | boolean          | YES      | Auto-set to `true` when outcome is `'DO_NOT_KNOCK'`. Default: `false` |
| metadata            | jsonb            | YES      | Arbitrary extra fields. Default: `{}` |
| linked_contact_id   | uuid (FK)        | YES      | → `contacts.id` SET NULL |
| linked_opportunity_id | uuid           | YES      | Optional link to opportunity |
| linked_job_id       | bigint           | YES      | Optional link to job |
| storm_event_id      | uuid (FK)        | YES      | → `storm_events.id` SET NULL |
| created_at          | timestamptz      | NO       | Default: `now()` |
| updated_at          | timestamptz      | NO       | Auto-updated via trigger |

**`canvass_outcome` enum:** `'NO_ANSWER'`, `'INTERESTED'`, `'NOT_INTERESTED'`, `'FOLLOW_UP'`, `'APPOINTMENT_SET'`, `'DO_NOT_KNOCK'`, `'NOT_HOME'`, `'CALLBACK_REQUESTED'`

**Door stat trigger:** After `INSERT` on `canvass_visits`, the `update_door_after_visit` trigger fires and updates `last_visit_at`, `last_outcome`, `visit_count`, and `is_do_not_knock` on the parent door. It also recalculates `turfs.visited_doors`.

### `canvass_visits`

One row per door-knock event. The `device_visit_id` unique constraint enables offline deduplication — the device generates a UUID locally before going offline, then uses it as the idempotency key during sync.

| Column            | Type             | Nullable | Notes |
|-------------------|------------------|----------|-------|
| id                | uuid (PK)        | NO       | |
| organization_id   | uuid (FK)        | NO       | → `organizations.id` CASCADE |
| door_id           | uuid (FK)        | NO       | → `doors.id` CASCADE DELETE |
| turf_id           | uuid (FK)        | YES      | → `turfs.id` SET NULL |
| user_id           | uuid (FK)        | NO       | → `auth.users.id` |
| outcome           | canvass_outcome  | NO       | Required. One of the 8 outcome values |
| notes             | text             | YES      | Rep's free-text note |
| tags              | text[]           | YES      | Array of tag strings. Default: `{}` |
| objections        | jsonb            | YES      | Structured objection list. Default: `[]` |
| duration_seconds  | integer          | YES      | Time spent at door in seconds |
| occurred_at       | timestamptz      | NO       | When the knock happened. Default: `now()` |
| created_at        | timestamptz      | NO       | Default: `now()` |
| is_offline_synced | boolean          | YES      | `true` if created via offline sync. Default: `true` |
| device_visit_id   | text             | YES      | UUID generated by device before sync |
| device_lat        | double precision | YES      | GPS lat at time of knock |
| device_lng        | double precision | YES      | GPS lng at time of knock |

**Unique constraint:** `(organization_id, device_visit_id)` — only when `device_visit_id IS NOT NULL`

### `canvass_media`

Photos, videos, or documents captured during canvassing.

| Column          | Type               | Nullable | Notes |
|-----------------|--------------------|----------|-------|
| id              | uuid (PK)          | NO       | |
| organization_id | uuid (FK)          | NO       | → `organizations.id` CASCADE |
| door_id         | uuid (FK)          | YES      | → `doors.id` SET NULL |
| visit_id        | uuid (FK)          | YES      | → `canvass_visits.id` SET NULL |
| user_id         | uuid (FK)          | NO       | → `auth.users.id` |
| media_type      | canvass_media_type | NO       | `'PHOTO'` \| `'VIDEO'` \| `'DOCUMENT'`. Default: `'PHOTO'` |
| file_name       | text               | YES      | Original filename |
| file_size       | integer            | YES      | Bytes |
| mime_type       | text               | YES      | e.g. `'image/jpeg'` |
| url             | text               | NO       | Supabase Storage public URL |
| thumbnail_url   | text               | YES      | Smaller preview URL |
| caption         | text               | YES      | Rep-provided caption |
| metadata        | jsonb              | YES      | Default: `{}` |
| created_at      | timestamptz        | NO       | Default: `now()` |

Media files are stored in the `canvass-media` Supabase Storage bucket.

### `contact_reveals`

Stores the result of a homeowner contact lookup. Cached per `door_id` to avoid re-charging credits for the same address.

| Column          | Type                 | Nullable | Notes |
|-----------------|----------------------|----------|-------|
| id              | uuid (PK)            | NO       | |
| organization_id | uuid (FK)            | NO       | → `organizations.id` CASCADE |
| door_id         | uuid (FK)            | NO       | → `doors.id` CASCADE DELETE |
| provider        | contact_provider_type | NO      | `'MOCK'` \| `'HAILTRACE'` \| `'HAIL_RECON'`. Default: `'MOCK'` |
| revealed_by     | uuid (FK)            | NO       | → `auth.users.id` |
| credits_used    | integer              | YES      | Default: `1` |
| revealed_at     | timestamptz          | YES      | Default: `now()` |
| name            | text                 | YES      | Homeowner name |
| phones          | text[]               | YES      | Array of phone numbers. Default: `{}` |
| emails          | text[]               | YES      | Array of email addresses. Default: `{}` |
| fields_returned | jsonb                | YES      | Raw provider response. Default: `{}` |
| cache_key       | text                 | YES      | Unique key for cache lookup |
| expires_at      | timestamptz          | YES      | When the cached result expires |

Cache check: Before calling the provider, run `check_contact_reveal_cache(org_id, door_id)`. If a non-expired row is returned, use it without charging credits.

### `credit_ledger`

Immutable audit trail for credit transactions. Never update or delete rows; only insert.

| Column          | Type              | Nullable | Notes |
|-----------------|-------------------|----------|-------|
| id              | uuid (PK)         | NO       | |
| organization_id | uuid (FK)         | NO       | → `organizations.id` CASCADE |
| ledger_type     | credit_ledger_type | NO      | See enum below |
| delta           | integer           | NO       | Positive for credits added, negative for credits spent |
| reason          | text              | YES      | Human-readable description |
| related_id      | uuid              | YES      | ID of the related reveal, order, etc. |
| balance_after   | integer           | YES      | Snapshot of balance after this transaction |
| created_by      | uuid (FK)         | YES      | → `auth.users.id` |
| created_at      | timestamptz       | NO       | Default: `now()` |

**`credit_ledger_type` enum:** `'CONTACT_REVEAL'`, `'TOPUP'`, `'ADJUSTMENT'`, `'REFUND'`

Current balance = `SUM(delta)` from `credit_ledger` for the org (computed by the `get_credit_balance` RPC).

### `canvass_leads`

Leads generated from canvassing activity. Separate from the main CRM leads to keep the canvassing workflow isolated.

| Column          | Type               | Nullable | Notes |
|-----------------|--------------------|----------|-------|
| id              | uuid (PK)          | NO       | |
| organization_id | uuid (FK)          | NO       | → `organizations.id` CASCADE |
| door_id         | uuid (FK)          | YES      | → `doors.id` SET NULL |
| contact_id      | uuid (FK)          | YES      | → `contacts.id` SET NULL |
| source          | canvass_lead_source | NO      | `'CANVASSING'` \| `'REFERRAL'` \| `'IMPORT'`. Default: `'CANVASSING'` |
| status          | canvass_lead_status | NO      | See status enum below. Default: `'NEW'` |
| name            | text               | YES      | Homeowner name (may come from reveal) |
| phone           | text               | YES      | Primary phone |
| email           | text               | YES      | Primary email |
| address         | text               | YES      | Property address string |
| notes           | text               | YES      | |
| estimated_value | numeric(12,2)      | YES      | Estimated job value |
| assigned_to     | uuid (FK)          | YES      | → `auth.users.id` |
| created_by      | uuid (FK)          | YES      | → `auth.users.id` |
| created_at      | timestamptz        | NO       | Default: `now()` |
| updated_at      | timestamptz        | NO       | Auto-updated via trigger |
| contacted_at    | timestamptz        | YES      | Set when status moves to `CONTACTED` |
| scheduled_at    | timestamptz        | YES      | Set when status moves to `SCHEDULED` |
| won_at          | timestamptz        | YES      | Set when status moves to `WON` |
| lost_at         | timestamptz        | YES      | Set when status moves to `LOST` |
| lost_reason     | text               | YES      | Reason for loss |

**`canvass_lead_status` enum:** `'NEW'`, `'CONTACTED'`, `'SCHEDULED'`, `'WON'`, `'LOST'`

### `canvass_appointments`

Appointments scheduled from canvass leads.

| Column          | Type        | Nullable | Notes |
|-----------------|-------------|----------|-------|
| id              | uuid (PK)   | NO       | |
| organization_id | uuid (FK)   | NO       | → `organizations.id` CASCADE |
| lead_id         | uuid (FK)   | NO       | → `canvass_leads.id` CASCADE DELETE |
| title           | text        | NO       | e.g. "Roof Inspection" |
| description     | text        | YES      | |
| start_at        | timestamptz | NO       | Appointment start |
| end_at          | timestamptz | NO       | Appointment end |
| location_text   | text        | YES      | Human-readable address |
| status          | text        | YES      | `'scheduled'` \| `'completed'` \| `'cancelled'`. Default: `'scheduled'` |
| reminder_sent   | boolean     | YES      | Default: `false` |
| created_by      | uuid (FK)   | YES      | → `auth.users.id` |
| assigned_to     | uuid (FK)   | YES      | → `auth.users.id` |
| created_at      | timestamptz | NO       | Default: `now()` |
| updated_at      | timestamptz | NO       | Auto-updated via trigger |

### `canvass_org_settings`

One row per organization. Use upsert pattern to create on first access.

| Column                     | Type             | Nullable | Notes |
|----------------------------|------------------|----------|-------|
| organization_id            | uuid (PK, FK)    | NO       | → `organizations.id` CASCADE |
| contact_reveal_cache_hours | integer          | YES      | How long to cache reveals. Default: `720` (30 days) |
| contact_reveal_cost        | integer          | YES      | Credits per reveal. Default: `1` |
| allow_gps_tracking         | boolean          | YES      | Rep location tracking enabled. Default: `false` |
| offline_sync_enabled       | boolean          | YES      | Default: `true` |
| default_door_density       | integer          | YES      | Doors to generate per turf. Default: `150` |
| default_storm_provider     | text             | YES      | Default: `'MOCK'` |
| default_contact_provider   | text             | YES      | Default: `'MOCK'` |
| hailtrace_api_key          | text             | YES      | Encrypted API key for HailTrace |
| hail_recon_api_key         | text             | YES      | Encrypted API key for HailRecon |
| mapbox_style_url           | text             | YES      | Custom Mapbox style URL |
| noaa_mode_enabled          | boolean          | YES      | NOAA MRMS data engine enabled. Default: `false` |
| mrms_base_url              | text             | YES      | NOAA MRMS endpoint URL |
| hail_min_threshold_inches  | double precision | YES      | Minimum hail size for event import. Default: `0.75` |
| noaa_mode                  | text             | YES      | `'mock'` \| `'live'`. Default: `'mock'` |
| data_retention_days        | integer          | YES      | Default: `365` |
| created_at                 | timestamptz      | NO       | Default: `now()` |
| updated_at                 | timestamptz      | NO       | Auto-updated via trigger |

### `storm_ingestion_jobs`

Tracks a single import run (NOAA, HailTrace, etc.).

| Column          | Type               | Nullable | Notes |
|-----------------|--------------------|----------|-------|
| id              | uuid (PK)          | NO       | |
| organization_id | uuid (FK)          | NO       | → `organizations.id` CASCADE |
| source_type     | text               | NO       | `'MRMS'` \| `'NEXRAD'` \| `'MOCK'`. Default: `'MRMS'` |
| date_from       | timestamptz        | YES      | Date range start for data fetch |
| date_to         | timestamptz        | YES      | Date range end |
| bbox            | jsonb              | YES      | Geographic bounding box for fetch |
| status          | storm_event_status | NO       | Default: `'processing'` |
| log             | text               | YES      | Progress/error log text |
| raw_file_refs   | jsonb              | YES      | Array of source file references. Default: `[]` |
| record_count    | integer            | YES      | Number of records processed. Default: `0` |
| created_by      | uuid (FK)          | YES      | → `auth.users.id` |
| created_at      | timestamptz        | NO       | Default: `now()` |
| updated_at      | timestamptz        | NO       | Auto-updated via trigger |

### `storm_processing_runs`

Tracks each processing algorithm run against an ingestion job.

| Column              | Type               | Nullable | Notes |
|---------------------|--------------------|----------|-------|
| id                  | uuid (PK)          | NO       | |
| ingestion_job_id    | uuid (FK)          | NO       | → `storm_ingestion_jobs.id` CASCADE DELETE |
| organization_id     | uuid (FK)          | NO       | → `organizations.id` CASCADE |
| storm_event_id      | uuid (FK)          | YES      | → `storm_events.id` SET NULL |
| algorithm_version   | text               | NO       | Default: `'1.0.0'` |
| thresholds_used     | jsonb              | YES      | Thresholds applied during run. Default: `{}` |
| summary             | jsonb              | YES      | Run summary statistics. Default: `{}` |
| status              | storm_event_status | NO       | Default: `'processing'` |
| started_at          | timestamptz        | YES      | Default: `now()` |
| completed_at        | timestamptz        | YES      | |
| created_at          | timestamptz        | NO       | Default: `now()` |

### `door_storm_matches`

Links doors to storm events with hail size estimates. One row per door per storm event.

| Column           | Type              | Nullable | Notes |
|------------------|-------------------|----------|-------|
| id               | uuid (PK)         | NO       | |
| organization_id  | uuid (FK)         | NO       | → `organizations.id` CASCADE |
| door_id          | uuid (FK)         | NO       | → `doors.id` CASCADE DELETE |
| storm_event_id   | uuid (FK)         | NO       | → `storm_events.id` CASCADE DELETE |
| max_hail_estimate| double precision  | YES      | Hail size in inches |
| severity_band    | hail_severity_band | YES     | See enum below |
| confidence_score | double precision  | YES      | 0.0–1.0 |
| matched_at       | timestamptz       | YES      | Default: `now()` |

**Unique constraint:** `(door_id, storm_event_id)`

**`hail_severity_band` enum:** `'trace'`, `'quarter'`, `'half'`, `'golf_ball'`, `'baseball'`

### `rep_locations`

Live GPS position for each active rep. One row per user per org (upserted on every location update).

| Column          | Type             | Nullable | Notes |
|-----------------|------------------|----------|-------|
| id              | uuid (PK)        | NO       | |
| organization_id | uuid (FK)        | NO       | → `organizations.id` CASCADE |
| user_id         | uuid (FK)        | NO       | → `auth.users.id` CASCADE DELETE |
| lat             | double precision | NO       | Current latitude |
| lng             | double precision | NO       | Current longitude |
| updated_at      | timestamptz      | YES      | Default: `now()` |

**Unique constraint:** `(organization_id, user_id)`

---

## Supabase API Reference

All queries use the shared `supabase` client from `src/shared/lib/supabase.ts`. Pass `orgId` from `OrgContext` and `userId` from `useSupabaseUser`. Use `maybeSingle()` (not `single()`) when expecting zero or one row.

### Storm Events

**List events (with layers joined):**
```typescript
const { data } = await supabase
  .from('storm_events')
  .select('*, layers:storm_layers(*)')
  .eq('organization_id', orgId)
  .eq('is_active', true)
  .order('event_date', { ascending: false });
```

**Get single event:**
```typescript
const { data } = await supabase
  .from('storm_events')
  .select('*, layers:storm_layers(*)')
  .eq('organization_id', orgId)
  .eq('id', eventId)
  .maybeSingle();
```

**Create event:**
```typescript
const { data } = await supabase
  .from('storm_events')
  .insert({
    organization_id: orgId,
    name,
    provider: 'MOCK',
    event_date: date,
    center_lat, center_lng,
    bbox,
    max_hail_estimate,
    is_active: true,
    status: 'ready',
    created_by: userId,
  })
  .select()
  .single();
```

**Update event:**
```typescript
await supabase
  .from('storm_events')
  .update({ is_active: false, status: 'archived' })
  .eq('organization_id', orgId)
  .eq('id', eventId);
```

**Delete event (cascades to storm_layers):**
```typescript
await supabase
  .from('storm_events')
  .delete()
  .eq('organization_id', orgId)
  .eq('id', eventId);
```

### Storm Layers

**Create layer:**
```typescript
const { data } = await supabase
  .from('storm_layers')
  .insert({
    organization_id: orgId,
    storm_event_id: eventId,
    name: 'Hail Layer',
    layer_type: 'HAIL',
    format: 'GEOJSON',
    geojson: featureCollection,
    min_threshold: 0.1,
    max_threshold: 2.75,
    is_visible: true,
    display_order: 0,
  })
  .select()
  .single();
```

**Toggle layer visibility:**
```typescript
await supabase
  .from('storm_layers')
  .update({ is_visible: !layer.is_visible })
  .eq('id', layerId);
```

### Turfs

**List turfs (with assignments):**
```typescript
const { data } = await supabase
  .from('turfs')
  .select(`
    *,
    assignments:turf_assignments(
      id, user_id, status, assigned_at,
      user:user_id(id, email, raw_user_meta_data)
    )
  `)
  .eq('organization_id', orgId)
  .neq('status', 'ARCHIVED')
  .order('created_at', { ascending: false });
```

**Filter by storm event:**
```typescript
.eq('storm_event_id', selectedEventId)
```

**Filter by assigned user:**
```typescript
.contains('assignments', [{ user_id: userId }])
// — or use a separate query on turf_assignments then join:
const { data: myAssignments } = await supabase
  .from('turf_assignments')
  .select('turf_id')
  .eq('organization_id', orgId)
  .eq('user_id', userId);
const turfIds = myAssignments?.map(a => a.turf_id) ?? [];
```

**Create turf:**
```typescript
const { data } = await supabase
  .from('turfs')
  .insert({
    organization_id: orgId,
    storm_event_id: eventId,
    name, description, color,
    geometry: multiPolygonGeoJSON,
    bbox: { minLng, minLat, maxLng, maxLat },
    status: 'NOT_STARTED',
    created_by: userId,
  })
  .select()
  .single();
```

**Update turf status:**
```typescript
await supabase
  .from('turfs')
  .update({ status: 'IN_PROGRESS', updated_at: new Date().toISOString() })
  .eq('organization_id', orgId)
  .eq('id', turfId);
```

**Soft delete (archive):**
```typescript
await supabase
  .from('turfs')
  .update({ status: 'ARCHIVED' })
  .eq('organization_id', orgId)
  .eq('id', turfId);
```

**Assign users to turf (upsert):**
```typescript
const rows = userIds.map(uid => ({
  organization_id: orgId,
  turf_id: turfId,
  user_id: uid,
  assigned_by: userId,
  status: 'ASSIGNED',
}));
await supabase
  .from('turf_assignments')
  .upsert(rows, { onConflict: 'turf_id,user_id' });
```

**Remove user from turf:**
```typescript
await supabase
  .from('turf_assignments')
  .delete()
  .eq('turf_id', turfId)
  .eq('user_id', targetUserId);
```

**Generate mock doors (RPC):**
```typescript
const { data: count } = await supabase
  .rpc('generate_doors_in_turf', {
    p_turf_id: turfId,
    p_count: 100,
  });
// Returns the number of doors created as an integer
```

**Get turf progress (RPC):**
```typescript
const { data } = await supabase
  .rpc('calculate_turf_progress', { p_turf_id: turfId });
// Returns: { total, visited, unvisited, do_not_knock, interested, appointment_set, completion_pct }
```

### Doors

**Get doors in bbox (RPC — used by map):**
```typescript
const { data } = await supabase
  .rpc('get_doors_in_bbox', {
    p_org_id: orgId,
    p_min_lng: bounds.minLng,
    p_min_lat: bounds.minLat,
    p_max_lng: bounds.maxLng,
    p_max_lat: bounds.maxLat,
  });
```

**Get doors for a turf (RPC):**
```typescript
const { data } = await supabase
  .rpc('get_doors_in_turf', { p_turf_id: turfId });
```

**Get paginated doors (with filters):**
```typescript
let query = supabase
  .from('doors')
  .select('*', { count: 'exact' })
  .eq('organization_id', orgId)
  .order('normalized_address');

if (turfId) query = query.eq('turf_id', turfId);
if (lastOutcome) query = query.eq('last_outcome', lastOutcome);
if (isDoNotKnock !== undefined) query = query.eq('is_do_not_knock', isDoNotKnock);
if (hasBeenVisited) query = query.gt('visit_count', 0);
if (search) query = query.ilike('normalized_address', `%${search.toLowerCase()}%`);

query = query.range(offset, offset + limit - 1);
```

**Get single door with visits:**
```typescript
const { data } = await supabase
  .from('doors')
  .select('*, visits:canvass_visits(*, user:user_id(email, raw_user_meta_data))')
  .eq('organization_id', orgId)
  .eq('id', doorId)
  .maybeSingle();
```

**Create door:**
```typescript
const { data } = await supabase
  .from('doors')
  .insert({
    organization_id: orgId,
    turf_id: turfId,
    address1, city, state, zip,
    lat, lng,
    normalized_address: `${address1} ${city} ${state} ${zip}`.toLowerCase(),
  })
  .select()
  .single();
```

**Bulk create doors:**
```typescript
await supabase
  .from('doors')
  .insert(doorsArray);  // array of door objects
```

**Update DNK flag:**
```typescript
await supabase
  .from('doors')
  .update({ is_do_not_knock: true })
  .eq('organization_id', orgId)
  .eq('id', doorId);
```

### Visits

**Log a visit:**
```typescript
const deviceVisitId = crypto.randomUUID();
const { data } = await supabase
  .from('canvass_visits')
  .insert({
    organization_id: orgId,
    door_id: doorId,
    turf_id: turfId,
    user_id: userId,
    outcome,
    notes,
    tags,
    occurred_at: new Date().toISOString(),
    is_offline_synced: false,
    device_visit_id: deviceVisitId,
    device_lat: gpsLat,
    device_lng: gpsLng,
  })
  .select()
  .single();
```

**Bulk sync offline visits (upsert with conflict ignore):**
```typescript
const { data } = await supabase
  .from('canvass_visits')
  .upsert(visits, {
    onConflict: 'organization_id,device_visit_id',
    ignoreDuplicates: true,
  })
  .select();
```

**Get visits for a door:**
```typescript
const { data } = await supabase
  .from('canvass_visits')
  .select('*, user:user_id(email, raw_user_meta_data)')
  .eq('organization_id', orgId)
  .eq('door_id', doorId)
  .order('occurred_at', { ascending: false });
```

**Get today's visit count for a user:**
```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);
const { count } = await supabase
  .from('canvass_visits')
  .select('id', { count: 'exact', head: true })
  .eq('organization_id', orgId)
  .eq('user_id', userId)
  .gte('occurred_at', today.toISOString());
```

**Get visit stats by outcome:**
```typescript
const { data } = await supabase
  .from('canvass_visits')
  .select('outcome')
  .eq('organization_id', orgId)
  .eq('turf_id', turfId);
// Group client-side by outcome
const byOutcome = data?.reduce((acc, v) => {
  acc[v.outcome] = (acc[v.outcome] ?? 0) + 1;
  return acc;
}, {} as Record<string, number>);
```

### Contact Reveals

**Check cache before revealing:**
```typescript
const { data: cached } = await supabase
  .rpc('check_contact_reveal_cache', {
    p_org_id: orgId,
    p_door_id: doorId,
  });
if (cached) return cached; // Use cached reveal
```

**Record a new reveal (mock):**
```typescript
const { data } = await supabase
  .from('contact_reveals')
  .insert({
    organization_id: orgId,
    door_id: doorId,
    provider: 'MOCK',
    revealed_by: userId,
    credits_used: costPerReveal,
    name: 'John Smith',
    phones: ['555-0100'],
    emails: ['jsmith@example.com'],
    expires_at: new Date(Date.now() + cacheHours * 3600000).toISOString(),
  })
  .select()
  .single();
```

**Deduct credits after reveal:**
```typescript
await supabase
  .from('credit_ledger')
  .insert({
    organization_id: orgId,
    ledger_type: 'CONTACT_REVEAL',
    delta: -creditCost,
    reason: `Reveal for door ${doorId}`,
    related_id: revealId,
    created_by: userId,
  });
```

### Credits

**Get current balance (RPC):**
```typescript
const { data: balance } = await supabase
  .rpc('get_credit_balance', { p_org_id: orgId });
// Returns an integer
```

**Add credits (top-up):**
```typescript
await supabase
  .from('credit_ledger')
  .insert({
    organization_id: orgId,
    ledger_type: 'TOPUP',
    delta: amount,
    reason,
    created_by: adminUserId,
  });
```

**Get ledger history:**
```typescript
const { data } = await supabase
  .from('credit_ledger')
  .select('*')
  .eq('organization_id', orgId)
  .order('created_at', { ascending: false })
  .limit(50);
```

### Leads & Appointments

**List leads:**
```typescript
const { data } = await supabase
  .from('canvass_leads')
  .select('*, appointments:canvass_appointments(*)')
  .eq('organization_id', orgId)
  .order('created_at', { ascending: false });
```

**Filter by status:**
```typescript
.eq('status', 'NEW')
```

**Create lead from door:**
```typescript
const { data } = await supabase
  .from('canvass_leads')
  .insert({
    organization_id: orgId,
    door_id: doorId,
    source: 'CANVASSING',
    status: 'NEW',
    name: revealedContact?.name,
    phone: revealedContact?.phones?.[0],
    email: revealedContact?.emails?.[0],
    address: `${door.address1}, ${door.city}, ${door.state} ${door.zip}`,
    created_by: userId,
  })
  .select()
  .single();
```

**Update lead status (auto-timestamp):**
```typescript
const timestampField: Record<string, string> = {
  CONTACTED: 'contacted_at',
  SCHEDULED: 'scheduled_at',
  WON: 'won_at',
  LOST: 'lost_at',
};
const now = new Date().toISOString();
await supabase
  .from('canvass_leads')
  .update({
    status: newStatus,
    [timestampField[newStatus]]: now,
    ...(newStatus === 'LOST' ? { lost_reason } : {}),
  })
  .eq('organization_id', orgId)
  .eq('id', leadId);
```

**Create appointment (sets lead to SCHEDULED):**
```typescript
const { data: appt } = await supabase
  .from('canvass_appointments')
  .insert({
    organization_id: orgId,
    lead_id: leadId,
    title,
    start_at, end_at,
    location_text,
    status: 'scheduled',
    created_by: userId,
    assigned_to: assignedTo,
  })
  .select()
  .single();

await supabase
  .from('canvass_leads')
  .update({ status: 'SCHEDULED', scheduled_at: new Date().toISOString() })
  .eq('id', leadId);
```

**Lead stats:**
```typescript
const { data } = await supabase
  .from('canvass_leads')
  .select('status, estimated_value')
  .eq('organization_id', orgId);

const stats = {
  total: data?.length ?? 0,
  byStatus: data?.reduce((acc, l) => { acc[l.status] = (acc[l.status] ?? 0) + 1; return acc; }, {}),
  totalValue: data?.filter(l => l.status === 'WON').reduce((s, l) => s + (l.estimated_value ?? 0), 0),
};
```

### Org Settings

**Get or create settings:**
```typescript
let { data } = await supabase
  .from('canvass_org_settings')
  .select('*')
  .eq('organization_id', orgId)
  .maybeSingle();

if (!data) {
  const { data: created } = await supabase
    .from('canvass_org_settings')
    .insert({ organization_id: orgId })
    .select()
    .single();
  data = created;
}
```

**Update settings:**
```typescript
await supabase
  .from('canvass_org_settings')
  .update({ allow_gps_tracking: true, noaa_mode_enabled: false })
  .eq('organization_id', orgId);
```

### Rep Locations

**Upsert my location:**
```typescript
await supabase
  .from('rep_locations')
  .upsert({
    organization_id: orgId,
    user_id: userId,
    lat,
    lng,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'organization_id,user_id' });
```

**Get active reps (updated in last 10 min):**
```typescript
const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
const { data } = await supabase
  .from('rep_locations')
  .select('*')
  .eq('organization_id', orgId)
  .gte('updated_at', tenMinAgo);
```

**Get team locations with today's visit count:**

Fetch `rep_locations` and `canvass_visits` (today) separately, then join client-side:

```typescript
const [locsResult, visitsResult] = await Promise.all([
  supabase.from('rep_locations').select('*').eq('organization_id', orgId)
    .gte('updated_at', new Date(Date.now() - 600000).toISOString()),
  supabase.from('canvass_visits').select('user_id').eq('organization_id', orgId)
    .gte('occurred_at', new Date().toDateString()),
]);

const visitCounts = (visitsResult.data ?? []).reduce((acc, v) => {
  acc[v.user_id] = (acc[v.user_id] ?? 0) + 1;
  return acc;
}, {} as Record<string, number>);
```

### Leaderboard (RPC)

```typescript
const { data } = await supabase
  .rpc('get_canvassing_leaderboard', {
    p_org_id: orgId,
    p_start_date: thirtyDaysAgo.toISOString(),
    p_end_date: now.toISOString(),
  });
// Returns: [{ user_id, total_visits, interested_count, appointment_set_count, doors_knocked, conversion_rate }]
```

### Ingestion Jobs

**Create a job:**
```typescript
const { data } = await supabase
  .from('storm_ingestion_jobs')
  .insert({
    organization_id: orgId,
    source_type: 'MOCK',
    status: 'processing',
    created_by: userId,
  })
  .select()
  .single();
```

**Update job status:**
```typescript
await supabase
  .from('storm_ingestion_jobs')
  .update({ status: 'ready', record_count: 3 })
  .eq('id', jobId);
```

**List recent jobs:**
```typescript
const { data } = await supabase
  .from('storm_ingestion_jobs')
  .select('*')
  .eq('organization_id', orgId)
  .order('created_at', { ascending: false })
  .limit(10);
```

---

## Screen Specifications

### 1. Storm Map Page (`/storm-canvassing`)

The primary field screen. It is intentionally full-bleed — the map fills the entire viewport with floating panels on top.

**Layout (desktop):**
```
┌─────────────────────────────────────────────────────────┐
│ Left sidebar (320px fixed)    │ Map (fills rest)          │
│  ┌─────────────────────────┐  │                           │
│  │ Storm event selector    │  │  [Map controls top-right] │
│  │ ─────────────────────── │  │                           │
│  │ Turf list               │  │  [Storm hail overlay]     │
│  │  • Turf A  42% ████░░░ │  │  [Turf polygons]          │
│  │  • Turf B  78% ███████ │  │  [Door markers]           │
│  │  ...                    │  │  [Rep location dots]      │
│  └─────────────────────────┘  │                           │
│                               │  [Right drawer on select] │
└─────────────────────────────────────────────────────────┘
```

**Layout (mobile, < 768px):**

The left sidebar collapses to a bottom sheet that slides up. The map fills the full screen. A FAB (floating action button) in the bottom-left opens the turf list. The canvassing mode panel docks at the bottom of the screen.

**Left sidebar — storm event selector:**
- Dropdown showing all active storm events for the org, sorted by `event_date` descending
- Shows event name, date, and max hail size (with severity badge)
- "Import storm events" button triggers `noaaEngine.runMockIngestion()`
- Selecting an event filters the turf list and highlights the storm layer on the map

**Left sidebar — turf list:**
- Cards showing turf name, status badge, assigned reps (avatar stack), and a linear progress bar (`visited_doors / total_doors`)
- Tapping a turf card flies the map to that turf's `bbox` and selects it
- "Create turf" button opens `CreateTurfModal`
- Filter chips: All / My Turfs / Not Started / In Progress / Completed

**Map center:**
- Mapbox GL JS map with satellite or streets base style
- Storm hail GeoJSON layer rendered with the 7-band color scale at adjustable opacity (default 60%)
- Turf polygons rendered with turf `color` fill (30% opacity) and solid stroke; selected turf has thicker stroke
- Door markers as colored circles (12px radius), colored by `last_outcome`, DNK doors show a red X icon
- Unvisited doors show as blue circles; visited doors show outcome color
- Rep location markers: circle + initials bubble, updated every 60s on this screen
- User's own location: blue pulsing dot (navigator.geolocation watchPosition)

**Map controls (top-right floating panel):**
- Layer toggles: [Storm] [Turfs] [Doors] [Team]
- Storm opacity slider (0%–100%)
- Hail threshold slider (0.1"–2.75") — doors below threshold are dimmed

**Right drawer — door info:**
- Opens when a door marker is tapped
- Shows: address, last outcome badge, visit count, last visit date
- Quick outcome buttons: No Answer / Interested / Not Interested (top 3)
- "Log Full Visit" → opens CanvassingModePanel
- "View Details" → navigates to `/storm-canvassing/doors/:doorId`
- "Create Lead" button (only shown when outcome is INTERESTED or APPOINTMENT_SET)
- "Reveal Contact" button (shows credit cost; disabled if no credits)

**Right drawer — canvassing mode panel:**
- Full-height panel that replaces the door info drawer
- Shows: "Nearest unvisited door" navigation card with distance
- Large outcome buttons (at least 64px tall):
  - No Answer, Not Home, Interested, Not Interested, Follow Up, Appointment Set, Do Not Knock, Callback Requested
- Notes textarea (optional)
- Tags multi-select (common tags: "Spoke to homeowner", "Left flyer", "Damage visible")
- "Log Visit" primary button — saves visit, closes panel, advances to nearest next door
- Visit queue shows "X doors remaining in turf"

**Offline indicator:** When offline, a yellow banner appears at the top with "Offline mode — visits queued for sync (N pending)". Logging visits still works via IndexedDB.

---

### 2. Turfs Page (`/storm-canvassing/turfs`)

Management view for creating and overseeing territories.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Storm Intelligence > Turfs                  [+ New] │
│  ────────────────────────────────────────────────── │
│  [All] [Not Started] [In Progress] [Completed]       │
│  Storm: [Any ▼]    Search: [____________]            │
│  ────────────────────────────────────────────────── │
│  ┌────────────────┐  ┌────────────────┐              │
│  │ Turf Name      │  │ Turf Name      │              │
│  │ Storm: ABC...  │  │ Storm: XYZ...  │              │
│  │ IN PROGRESS    │  │ NOT STARTED    │              │
│  │ ████████░░ 78% │  │ ░░░░░░░░░░  0% │              │
│  │ 2 reps ●● ●   │  │ 0 reps         │              │
│  │ 156/200 doors  │  │ 0/100 doors    │              │
│  │ [Assign] [•••] │  │ [Assign] [•••] │              │
│  └────────────────┘  └────────────────┘              │
└──────────────────────────────────────────────────────┘
```

**Turf card:**
- Header: Turf color swatch + name + status badge
- Sub-line: Storm event name (if linked)
- Progress bar: `visited_doors / total_doors` as a horizontal bar (use turf's color)
- Percentage label right-aligned
- Rep avatars: up to 3 shown, then "+N" overflow
- Door count: "156 / 200 doors visited"
- Footer buttons:
  - "Assign Reps" → opens `AssignRepsModal`
  - Three-dot menu → Edit / Generate Doors / View on Map / Archive

**CreateTurfModal:**
- Fields: Name (required), Description (optional), Storm Event (dropdown), Color picker (preset swatches), Priority (Low/Medium/High toggle)
- Geometry: Instructions to draw on map or paste GeoJSON; for v1, accept a pasted GeoJSON polygon or use a simple bounding box input (NW corner lat/lng + SE corner lat/lng)
- "Generate N doors automatically" toggle with count input (default 150)
- Save / Cancel buttons

**EditTurfModal:**
- Same fields as Create, plus current assignments list with "Remove" per user
- Cannot change geometry after doors exist (show warning)

**AssignRepsModal:**
- Searchable list of all org members with checkboxes
- Currently assigned users are pre-checked
- Save button: upserts all checked, removes unchecked

---

### 3. Storm Events Page (`/storm-canvassing/events`)

Overview and management of imported storm events.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Storm Intelligence > Events         [Import Events] │
│  ────────────────────────────────────────────────── │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  │  12  │ │   4  │ │   8  │ │   3  │               │
│  │ Total│ │Active│ │w/Turf│ │This M│               │
│  └──────┘ └──────┘ └──────┘ └──────┘               │
│  ────────────────────────────────────────────────── │
│  [Search events...]                                  │
│                                                      │
│  NAME              DATE      MAX HAIL  STATUS  TURFS │
│  Austin Metro...   Mar 12    ⬤ 1.75"  READY    3    │
│  Round Rock...     Mar 10    ⬤ 2.75"  READY    1    │
│  Cedar Park...     Mar 10    ⬤ 1.00"  READY    0    │
└──────────────────────────────────────────────────────┘
```

**Stats bar (4 cards):**
- Total Events (all non-archived)
- Active (is_active = true)
- With Turfs (events that have at least one turf)
- This Month (event_date in current calendar month)

**Table columns:** Event Name (link to detail), Date, Max Hail (colored severity dot + size), Status badge, Turf count, Provider badge

**"Import Events" button:**
- Opens a confirmation dialog
- Runs `runMockIngestion(orgId, userId)` which creates 3 mock Austin-area storm events
- Shows a loading spinner while the ingestion job runs
- On completion, refreshes the table

**Row actions (three-dot menu):**
- View Details → navigates to `/storm-canvassing/events/:eventId`
- Archive (sets `is_active = false, status = 'archived'`)
- Delete (hard delete, requires confirmation)

---

### 4. Storm Event Detail Page (`/storm-canvassing/events/:eventId`)

Detailed view of a single storm event.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  ← Back to Events                                    │
│  Austin Metro Hailstorm          [READY] [Match Doors]│
│  ────────────────────────────────────────────────── │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  │Mar 12│ │1.75" │ │ 0.91 │ │  3   │               │
│  │ Date │ │ Hail │ │ Conf │ │Turfs │               │
│  └──────┘ └──────┘ └──────┘ └──────┘               │
│                                                      │
│  TURFS                              [+ Add Turf]     │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Downtown Zone    IN PROGRESS  ████████░░ 78%    │ │
│  │ North Suburbs    NOT STARTED  ░░░░░░░░░░  0%    │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  STORM LAYERS                                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │ [👁] Hail Layer   GEOJSON   0.1"–2.75"          │ │
│  │ [👁] Wind Layer   GEOJSON   (no threshold)      │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  HAIL SEVERITY SCALE                                 │
│  ├──────────────────────────────────────────────┤   │
│  TRACE  QUARTER  HALF  ¾ INCH  1"  GOLF  BASEBALL   │
│                                                      │
│  RECENT INGESTION JOBS                               │
│  ┌─────────────────────────────────────────────────┐ │
│  │ MOCK  READY  3 events  Mar 12 10:34am           │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**"Match Doors" button:**
- Finds all doors belonging to turfs linked to this event
- Assigns hail estimates based on distance from event center using `door_storm_matches`
- Shows a spinner and success toast with the count matched
- Implementation: reads all doors in linked turfs, calculates Euclidean distance from `center_lat/center_lng`, maps distance to a severity band, upserts into `door_storm_matches`

**Turf progress rows:**
- Each turf linked to this event shown as a row with name, status badge, progress bar
- Click → navigates to the Turfs Page filtered to this event

**Layer toggle:**
- Eye icon toggles `is_visible` on each layer (persisted to DB)

**Metadata sidebar (right column on desktop, section on mobile):**
- Event date, provider, external_id, confidence score
- Center coordinates (lat/lng)
- Bounding box display
- Created by, created at

---

### 5. Door Detail Page (`/storm-canvassing/doors/:doorId`)

Full-detail view for a single address. Accessed from the map drawer "View Details" link or directly.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  ← Back                                              │
│  123 Oak Street, Austin TX 78701                     │
│  INTERESTED  •  3 visits  •  Last: 2 days ago        │
│  ────────────────────────────────────────────────── │
│  [  Visits  ] [  Actions  ] [  Media  ]              │
└──────────────────────────────────────────────────────┘
```

**Header:**
- Full address (address1, city, state zip)
- Last outcome badge + visit count + last visit relative date
- Storm hail estimate if matched: "1.75 in hail (GOLF_BALL)" with severity dot

**Tab: Visits**
- Chronological list of all visits, newest first
- Each visit card: date/time, rep name (from user metadata), outcome badge, notes text, duration
- Empty state: "No visits logged yet"

**Tab: Actions**

Three action categories:

1. **Contact Reveal section:**
   - If cached: shows name, phone numbers, email addresses with copy buttons
   - If not revealed: "Reveal Homeowner Contact" button with credit cost (`1 credit`)
   - Shows credit balance next to the button ("You have 42 credits")
   - On insufficient credits: "Buy Credits" link to settings
   - On reveal: calls cache check, then mock provider, then logs credit deduction

2. **Log a visit section:**
   - Quick outcome selector (8 buttons in 2×4 grid)
   - Notes textarea (optional)
   - "Log Visit" button

3. **CRM actions section:**
   - "Add to CRM as Contact" — creates a new contact from revealed data, sets `linked_contact_id` on the door
   - "Create Lead" — creates a `canvass_lead` from this door
   - "Create Opportunity" — (out of scope for v1)
   - Do Not Knock toggle — immediately sets `is_do_not_knock = true`

**Tab: Media**
- Grid of photos/videos from `canvass_media` filtered by `door_id`
- Empty state: "No photos yet"
- "Add Photo" button opens native camera/file picker (out of scope for v1)

---

### 6. Canvass Leads Page (`/storm-canvassing/leads`)

CRM-style pipeline for canvassing leads.

**Layout:**

Toggle between Kanban and Table view (toggle button top-right).

**Kanban view:**
```
┌────────────────────────────────────────────────────────────────┐
│  [NEW 12]      [CONTACTED 8]   [SCHEDULED 5]  [WON 4] [LOST 2] │
│  ┌──────────┐  ┌──────────┐   ┌──────────┐                    │
│  │ John S.  │  │ Jane D.  │   │ Mike R.  │                    │
│  │ Oak St   │  │ Elm Ave  │   │ Cedar Ln │                    │
│  │ $8,500   │  │ $12,000  │   │ Appt:Mon │                    │
│  └──────────┘  └──────────┘   └──────────┘                    │
└────────────────────────────────────────────────────────────────┘
```

**Lead card content:**
- Name (or "Unknown" if no name)
- Address (shortened to street + city)
- Estimated value (if set, formatted as currency)
- Appointment date (if in SCHEDULED status)
- Assigned rep avatar + name
- Click → opens a lead detail slide-over panel

**Stats bar (above board):**
- Total leads / Pipeline value (sum of non-LOST estimated_value) / Appointments scheduled / Won deals

**Lead detail panel (slide-over, right side):**
- Full contact details (name, phone, email)
- Status change buttons (move to next stage)
- Notes field (editable)
- Appointment list + "Schedule Appointment" form
- Timeline of status changes (derived from `contacted_at`, `scheduled_at`, etc.)
- Created from: Door address link

**Table view:**
- Columns: Name, Address, Status, Value, Assigned To, Created, Last Updated
- Sortable by Created, Value, Status
- Row click opens same slide-over panel

**Filters (top of page):**
- Status filter chips (All / NEW / CONTACTED / SCHEDULED / WON / LOST)
- Search by name/address
- Assigned to filter (dropdown of org members)

---

### 7. Manager Dashboard Page (`/storm-canvassing/manager`)

Real-time team performance view. Primarily for managers; any org member can access.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  Manager Dashboard        [Last 30 days ▼]  [Refresh]│
│  ────────────────────────────────────────────────── │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│  │ 2400 │ │  63% │ │  142 │ │   4  │ │  28  │     │
│  │Doors │ │Comp. │ │Inter.│ │ActRep│ │Appts │     │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │
│                                                      │
│  LEADERBOARD               │  ACTIVE REPS            │
│  1. Sarah J.  120 visits   │  ● Sarah — Downtown     │
│     38% conversion         │  ● Mike  — North Side   │
│  2. Mike R.   98 visits    │  ● Ana   — (inactive)   │
│     42% conversion         │                         │
│  3. Ana T.    72 visits    │                         │
│                            │                         │
│  TURF PROGRESS                                       │
│  Downtown Zone    ████████░░ 78%  IN PROGRESS        │
│  North Suburbs    ████░░░░░░ 41%  IN PROGRESS        │
│  Cedar Area       ░░░░░░░░░░  0%  NOT STARTED        │
└──────────────────────────────────────────────────────┘
```

**KPI cards (5):**
- Total doors (across all non-archived turfs in org)
- Overall completion % (visited / total across all turfs)
- Interested today (visits with outcome INTERESTED, occurred today)
- Active reps today (unique users who logged at least 1 visit today)
- Appointments (canvass_appointments with start_at in the future)

**Leaderboard:**
- Powered by `get_canvassing_leaderboard` RPC
- Shows rank, name (from `raw_user_meta_data.full_name`), total visits, conversion rate
- Columns: Rank / Name / Doors Knocked / Interested / Appts Set / Conversion %
- Date range selector: Today / This Week / Last 30 Days (default) / Custom

**Active reps panel:**
- List of reps who have updated their location in the last 10 minutes
- Shows: avatar + name, current turf name (if set), today's visit count
- Pulsing green dot for reps updated in last 2 minutes; gray dot otherwise
- Refreshes every 60 seconds via `setInterval`

**Turf progress list:**
- All non-archived turfs with name, progress bar, completion %, status badge, assigned rep count
- Click turf → navigates to the Turfs Page

---

### 8. Canvass Settings Page (`/storm-canvassing/settings`)

Four-tab configuration page.

**Tab: General**
- "Allow GPS Tracking" toggle (`allow_gps_tracking`)
- "Enable Offline Mode" toggle (`offline_sync_enabled`)
- "Default Door Density" numeric input (doors per turf, 50–500, `default_door_density`)
- "Data Retention Days" numeric input (`data_retention_days`)
- Save button

**Tab: Data Providers**
- Storm data provider select: MOCK / HailTrace / HailRecon (`default_storm_provider`)
- If HailTrace or HailRecon: API key text input with show/hide toggle
- "Test Connection" button (calls test stub, shows success/error toast)
- Contact data provider select: MOCK / HailTrace / HailRecon (`default_contact_provider`)
- Same API key input pattern
- Contact reveal cache duration (`contact_reveal_cache_hours`): input in hours (default 720)
- Credits per reveal (`contact_reveal_cost`): numeric input (default 1)

**Tab: NOAA Storm Engine**
- "Enable NOAA Mode" toggle (`noaa_mode_enabled`)
- NOAA MRMS Base URL text input (`mrms_base_url`); placeholder: `https://mrms.ncep.noaa.gov/data/RIDGEII/L3/`
- Minimum hail threshold slider (0.10"–2.75", step 0.05) — shows current hail size label (e.g., "GOLF BALL — 1.75 inches") (`hail_min_threshold_inches`)
- "Run Manual Ingestion" button — triggers `runMockIngestion` and shows result toast
- Recent ingestion jobs list (last 5 from `storm_ingestion_jobs`)

**Tab: Credits**
- Current balance display (large number from `get_credit_balance` RPC)
- Credit cost per reveal: numeric input (`contact_reveal_cost`)
- Cache hours: numeric input (`contact_reveal_cache_hours`) — affects when cached reveals expire
- Ledger history table: Type / Amount / Reason / Date (last 20 rows from `credit_ledger`)
- (Admin only) "Add Credits" button with amount input for top-ups

---

## Reusable Components

### `HailSeverityBadge`

Displays a colored dot + label for a hail severity band or raw inch value.

```typescript
interface HailSeverityBadgeProps {
  inches?: number;          // Raw hail size; auto-derives band
  band?: HailSeverityBand;  // Or pass band directly
  size?: 'sm' | 'md';      // 'sm' = dot only, 'md' = dot + label
}
```

Renders: a 10px colored circle (using `HAIL_SEVERITY_COLORS`) + optional text label (e.g., "1.75" Golf Ball").

### `TurfStatusBadge`

```typescript
interface TurfStatusBadgeProps {
  status: TurfStatus;
}
```

Renders a small pill badge with the correct background/text color from the design system table.

### `CanvassOutcomeBadge`

```typescript
interface CanvassOutcomeBadgeProps {
  outcome: CanvassOutcome;
  size?: 'sm' | 'md';
}
```

Renders a colored pill. DNK outcome renders with a stop-sign icon prefix.

### `TurfProgressBar`

```typescript
interface TurfProgressBarProps {
  visited: number;
  total: number;
  color?: string;      // turf.color hex value; falls back to blue-500
  showLabel?: boolean; // show "156 / 200 (78%)" text
  height?: 'sm' | 'md'; // 'sm' = 4px, 'md' = 8px
}
```

Renders a horizontal progress bar. Uses the turf's custom color for the fill.

### `CreditBalanceDisplay`

```typescript
interface CreditBalanceDisplayProps {
  balance: number;
  cost?: number;          // Credits needed for next action
  showWarning?: boolean;  // Show warning if balance < cost
}
```

Renders: "42 credits" with a coin icon. If `showWarning` and `balance < cost`, shows an amber warning.

### `CanvassingModePanel`

Full-height slide-in panel (right or bottom depending on viewport) for logging door visits. Only one can be open at a time. Closes when "Log Visit" is confirmed or user taps outside.

```typescript
interface CanvassingModePanelProps {
  door: Door;
  turfId: string;
  onClose: () => void;
  onVisitLogged: (visit: CanvassVisit) => void;
  nextDoor?: Door;       // Pre-loaded nearest unvisited door
}
```

**Internal state:** `selectedOutcome`, `notes`, `tags`, `isLogging`

### `DoorInfoDrawer`

Smaller drawer (slides in from bottom on mobile, right side on desktop) showing door summary + quick actions.

```typescript
interface DoorInfoDrawerProps {
  door: Door | null;
  orgSettings: CanvassOrgSettings;
  creditBalance: number;
  onClose: () => void;
  onRevealContact: (doorId: string) => Promise<ContactReveal>;
  onLogVisit: (door: Door) => void;     // Opens CanvassingModePanel
  onCreateLead: (door: Door) => void;
  onViewDetails: (doorId: string) => void;
}
```

### `AssignRepsModal`

```typescript
interface AssignRepsModalProps {
  isOpen: boolean;
  onClose: () => void;
  turfId: string;
  orgId: string;
  currentAssignments: TurfAssignment[];
  onSaved: () => void;
}
```

Fetches org members from `organization_members` + `user_profiles`, shows a searchable checklist, upserts on save.

### `StormEventSelector`

```typescript
interface StormEventSelectorProps {
  events: StormEvent[];
  selectedEventId: string | null;
  onChange: (eventId: string | null) => void;
}
```

A dropdown (custom select) showing event name, date, and max hail severity dot. "All events" option at top.

### `OfflineBanner`

Shown at the top of the map page when `navigator.onLine === false` or `useOfflineStatus()` returns false.

```typescript
interface OfflineBannerProps {
  pendingCount: number;  // Visits queued for sync
}
```

Renders: amber banner — "Offline mode — N visits queued for sync". Disappears when back online and sync completes.

### `LeaderboardTable`

```typescript
interface LeaderboardTableProps {
  entries: RepLeaderboardEntry[];
  isLoading: boolean;
}
```

Columns: Rank (#) / Rep Name / Doors Knocked / Interested / Appts Set / Conversion %. Top 3 rows get rank badges (gold/silver/bronze color accents on the rank number).

---

## Navigation & Routing

### Route table

| URL Pattern                                | Component             | Title                  |
|--------------------------------------------|-----------------------|------------------------|
| `/storm-canvassing`                        | `StormMapPage`        | Storm Map              |
| `/storm-canvassing/turfs`                  | `TurfsPage`           | Turfs                  |
| `/storm-canvassing/events`                 | `StormEventsPage`     | Storm Events           |
| `/storm-canvassing/events/:eventId`        | `StormEventDetailPage`| Event Detail           |
| `/storm-canvassing/doors/:doorId`          | `DoorDetailPage`      | Door Detail            |
| `/storm-canvassing/leads`                  | `CanvassLeadsPage`    | Canvass Leads          |
| `/storm-canvassing/manager`                | `ManagerDashboardPage`| Manager Dashboard      |
| `/storm-canvassing/settings`              | `CanvassSettingsPage` | Settings               |

Any unmatched path under `/storm-canvassing/*` redirects to the map (`<Navigate to="" replace />`).

### Back navigation

- `StormEventDetailPage` → "← Back to Events" link → `/storm-canvassing/events`
- `DoorDetailPage` → "← Back" uses `navigate(-1)` (back to map or wherever the user came from)
- All other pages are top-level within the module sidebar

### Module sidebar nav items

The module registers 6 sidebar entries in the shared `Navigation` component:

| Label            | Icon         | Path                          |
|------------------|--------------|-------------------------------|
| Map              | Map          | `/storm-canvassing`           |
| Turfs            | Grid         | `/storm-canvassing/turfs`     |
| Events           | Cloud        | `/storm-canvassing/events`    |
| Leads            | Users        | `/storm-canvassing/leads`     |
| Manager          | BarChart2    | `/storm-canvassing/manager`   |
| Settings         | Settings     | `/storm-canvassing/settings`  |

### Module registration in `RoofRunnerModule`

The `StormCanvassingModule` is already registered as a lazy route under `/storm-canvassing/*` in the parent `RoofRunnerModule.tsx`. No additional wiring is needed.

---

## Offline Mode Architecture

The module uses Dexie (IndexedDB) for offline storage, providing full visit-logging capability with no network connection.

### IndexedDB database name: `storm-canvassing-offline`

### Dexie table schemas

```typescript
// db.ts — Dexie schema
class StormOfflineDB extends Dexie {
  pendingVisits!: Table<PendingVisit, number>;
  cachedTurfs!: Table<CachedTurf, string>;
  cachedDoors!: Table<CachedDoor, string>;
  pendingMedia!: Table<PendingMedia, number>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('storm-canvassing-offline');
    this.version(1).stores({
      pendingVisits: '++id, orgId, deviceVisitId, synced, createdAt',
      cachedTurfs: 'id, orgId, cachedAt',
      cachedDoors: 'id, turfId, orgId, cachedAt',
      pendingMedia: '++id, orgId, doorId, synced',
      syncQueue: '++id, type, priority, createdAt',
    });
  }
}
```

### `PendingVisit` shape

```typescript
interface PendingVisit {
  id?: number;             // Dexie auto-increment
  orgId: string;
  userId: string;
  doorId: string;
  turfId?: string;
  outcome: CanvassOutcome;
  notes?: string;
  tags: string[];
  occurredAt: string;      // ISO string
  deviceVisitId: string;   // crypto.randomUUID() — used for server-side dedup
  deviceLat?: number;
  deviceLng?: number;
  synced: boolean;         // false until synced
  syncAttempts: number;    // incremented on each failed attempt
  createdAt: string;
}
```

### Offline visit flow

1. User taps "Log Visit" in `CanvassingModePanel`
2. App checks `navigator.onLine`
3. **Online path:** Insert directly into Supabase `canvass_visits` with `is_offline_synced = false`; no IndexedDB write
4. **Offline path:** Write to `pendingVisits` table in IndexedDB with `synced = false`; show local success feedback immediately; increment pending count in UI

### Sync trigger

- On `window` `online` event, `syncPendingVisits()` runs automatically
- On app mount, if `pendingCount > 0`, run `syncPendingVisits()`
- Sync uses `bulkSyncVisits` → Supabase upsert with `ignoreDuplicates: true` on `(organization_id, device_visit_id)` conflict
- After sync: set `synced = true` on each `PendingVisit` record; update `pendingCount` display

### Conflict resolution

The `device_visit_id` unique constraint on `canvass_visits` is the dedup key. If a visit was somehow sent twice (e.g., connectivity dropped mid-flight), the second upsert is silently ignored. No data is lost or duplicated.

### Turf and door caching

Before entering a turf in canvassing mode, the app pre-downloads and caches:
- The `Turf` record (geometry, bbox, status)
- All `Door` records for that turf (via `get_doors_in_turf` RPC)

These are stored in `cachedTurfs` and `cachedDoors`. `findNearestUnvisitedDoor` runs client-side over the cached doors list using simple Euclidean distance.

Cache invalidation: Cached records have a `cachedAt` timestamp. Stale cached data (older than 4 hours) triggers a re-fetch when the user comes online.

### Media upload queue

When a user captures a photo offline, it is stored as a base64 blob in `pendingMedia`. On sync, the app:
1. Uploads the blob to Supabase Storage bucket `canvass-media`
2. Inserts a `canvass_media` row with the resulting URL
3. Marks the `pendingMedia` record as `synced = true`

### Retry logic

Visits that fail sync are retried on the next sync attempt. After 3 failed attempts (`syncAttempts >= 3`), the visit is flagged in the UI with an error state: "Some visits could not be synced. Tap to retry." Manual retry resets `syncAttempts` to 0.

---

## GPS & Location Tracking

### Rep location tracking

GPS tracking only runs if `canvass_org_settings.allow_gps_tracking === true` for the org.

**Starting tracking:**

On map page mount (when `allow_gps_tracking` is true):
```typescript
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
    upsertRepLocation(orgId, userId, position.coords.latitude, position.coords.longitude);
  },
  (err) => console.warn('GPS error', err),
  { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
);
```

**Stopping tracking:**

On map page unmount:
```typescript
navigator.geolocation.clearWatch(watchId);
deactivateRepLocation(orgId, userId);  // Sets is_active = false if that column exists; otherwise just stops upserting
```

**Upsert frequency:** The `watchPosition` callback fires on significant position change (typically every 5–15 seconds when moving). The upsert is cheap (single row per user) and is safe to call frequently.

### Manager dashboard polling

On `ManagerDashboardPage`:
- `getActiveRepLocations(orgId)` called every 60 seconds via `setInterval`
- Clear interval on component unmount

```typescript
useEffect(() => {
  fetchRepLocations();
  const interval = setInterval(fetchRepLocations, 60_000);
  return () => clearInterval(interval);
}, [orgId]);
```

### User location marker

The user's own position is shown as a pulsing blue circle on the map. Use CSS animation (`animate-ping`) on a small circle overlay.

### Permission request UX

Before starting tracking, check `navigator.permissions.query({ name: 'geolocation' })`:
- If `'granted'`: start immediately
- If `'prompt'`: call `watchPosition` which will trigger the browser permission dialog
- If `'denied'`: show a settings card: "Location access is blocked. Enable GPS in your browser settings to use live tracking."

Never start tracking without the org setting being `true`.

---

## Accessibility

- All icon-only buttons must have `aria-label` describing the action (e.g., `aria-label="Toggle layer visibility"`)
- Map controls panel must be keyboard navigable; focus trap is not required since the map is behind it
- Outcome buttons in `CanvassingModePanel` must have at minimum 44 × 44 px tap area; use `min-h-[64px]` for comfortable outdoor use
- Color is never the sole indicator of status — always pair a colored badge with a text label or icon
- The hail severity color scale must include text labels at each stop (not just colors)
- Form inputs must have visible `<label>` elements or `aria-label` attributes
- Toasts and banners must have `role="status"` or `role="alert"` so screen readers announce them
- Focus is moved to the first interactive element when a modal or drawer opens; returned to the trigger element when it closes
- The offline banner uses `role="alert"` and `aria-live="polite"` so it is announced when it appears

---

## Out of Scope for v1

The following features exist in the existing codebase but should be deferred to v2 to keep the initial build focused:

- **Real HailTrace / HailRecon API integration** — use MOCK provider only; the provider classes are stubbed
- **Native camera capture** in the Media tab (the `canvass_media` table and storage bucket exist but photo upload UI is deferred)
- **Offline media queue** — defer `pendingMedia` sync; v1 only supports online photo uploads
- **Custom Mapbox style** (the `mapbox_style_url` setting exists but v1 uses the default streets style)
- **NOAA MRMS live ingestion** — `noaa_mode_enabled` toggle exists but v1 only runs mock ingestion
- **Drag-and-drop Kanban** in the Leads page — v1 uses status-change buttons in the slide-over panel only
- **Email/SMS notifications** for appointment reminders (`reminder_sent` column exists but is not acted on)
- **Advanced turf drawing** — v1 accepts a pasted GeoJSON polygon or bounding box; interactive draw tools (Mapbox Draw) are deferred
- **Door import from CSV** — bulk create doors exists in the API layer but the CSV upload UI is deferred
- **QuickBooks / Stripe integration** for payments on canvass leads (out of scope entirely for this module)
