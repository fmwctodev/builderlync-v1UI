# Dynamic Dashboard Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Dashboard Page                             │  │
│  │  /src/modules/roof-runner/pages/Dashboard.tsx                │  │
│  │                                                                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐             │  │
│  │  │ Add Widget │  │  Refresh   │  │   Clone    │             │  │
│  │  │   Button   │  │   Button   │  │   Button   │             │  │
│  │  └────────────┘  └────────────┘  └────────────┘             │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │         Widget Grid (Dynamic Layout)                  │   │  │
│  │  │                                                        │   │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │  │
│  │  │  │ Widget 1 │  │ Widget 2 │  │ Widget 3 │           │   │  │
│  │  │  │  Jobs    │  │ Revenue  │  │ Contacts │           │   │  │
│  │  │  │   23     │  │ $12,450  │  │  1,247   │           │   │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘           │   │  │
│  │  │                                                        │   │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │  │
│  │  │  │ Widget 4 │  │ Widget 5 │  │ Widget 6 │           │   │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘           │   │  │
│  │  └──────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            DashboardWidgetSelector Modal                      │  │
│  │  /components/dashboard/DashboardWidgetSelector.tsx           │  │
│  │                                                                │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │ Search: [___________________________]                   │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │                                                                │  │
│  │  ┌─ Jobs (7) ──────────────────────────────────────────┐    │  │
│  │  │ ☑ Total Jobs                                         │    │  │
│  │  │ ☑ Jobs Created                                       │    │  │
│  │  │ ☐ Jobs Completed                                     │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  │                                                                │  │
│  │  ┌─ Opportunities (4) ─────────────────────────────────┐    │  │
│  │  │ ☑ Total Opportunities                                │    │  │
│  │  │ ☐ New Opportunities                                  │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  │                                                                │  │
│  │  [Cancel]  [Apply Changes]                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND SERVICES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              dashboardWidgetsApi.ts                           │  │
│  │  /shared/store/services/dashboardWidgetsApi.ts               │  │
│  │                                                                │  │
│  │  • getAvailableWidgets()                                      │  │
│  │  • getUserPreferences(userId)                                 │  │
│  │  • getWidgetsWithPreferences(userId)                          │  │
│  │  • updateUserPreferences(userId, updates)                     │  │
│  │  • toggleWidgetVisibility(userId, widgetKey, isVisible)       │  │
│  │  • initializeDefaultPreferences(userId)                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              widgetStatsService.ts                            │  │
│  │  /shared/store/services/widgetStatsService.ts                │  │
│  │                                                                │  │
│  │  • getWidgetStats(orgId, widgetKey)                           │  │
│  │  • calculateWidgetStat(orgId, widgetKey)                      │  │
│  │  • refreshAllStats(orgId, widgetKeys)                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE CLIENT                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  • Authentication                                                     │
│  • Row Level Security (RLS)                                          │
│  • Real-time Subscriptions (future)                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              dashboard_widgets                                │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │ id | widget_key | name | category | is_active | ...    │ │  │
│  │  ├────────────────────────────────────────────────────────┤ │  │
│  │  │ 1  | jobs-total | Total Jobs | jobs | true | ...       │ │  │
│  │  │ 2  | revenue_total | Revenue | payments | true | ...   │ │  │
│  │  │ 3  | contacts_total | Contacts | reporting | true |... │ │  │
│  │  └────────────────────────────���───────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         user_dashboard_preferences                            │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │ id | user_id | widget_key | is_visible | position |... │ │  │
│  │  ├────────────────────────────────────────────────────────┤ │  │
│  │  │ 1  | user-1  | jobs-total | true | 0 | ...            │ │  │
│  │  │ 2  | user-1  | revenue_total | true | 1 | ...         │ │  │
│  │  │ 3  | user-2  | contacts_total | true | 0 | ...        │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                widget_stats (Cache)                           │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │ id | org_id | widget_key | stat_value | expires_at |...│ │  │
│  │  ├────────────────────────────────────────────────────────┤ │  │
│  │  │ 1  | org-1  | jobs-total | {value:23,...} | 2024-... │ │  │
│  │  │ 2  | org-1  | revenue_total | {value:"$12K",...} |... │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Source Data Tables                               │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │  │
│  │  │   jobs     │  │opportunities│  │  contacts  │            │  │
│  │  └────────────┘  └────────────┘  └────────────┘            │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │  │
│  │  │  payments  │  │appointments │  │   tasks    │            │  │
│  │  └────────────┘  └────────────┘  └────────────┘            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Widget Selection Flow

```
User Action                Frontend                    Database
─────────────────────────────────────────────────────────────────

1. Click "Add Widget"
                    ──────────────────────────────────────────────>
                    Load available widgets
                    <──────────────────────────────────────────────
                    dashboard_widgets (WHERE is_active = true)

2. Select widgets
   Click "Apply"
                    ──────────────────────────────────────────────>
                    Save preferences
                    <──────────────────────────────────────────────
                    user_dashboard_preferences (UPSERT)

3. Dashboard reloads
                    ──────────────────────────────────────────────>
                    Load user preferences
                    <──────────────────────────────────────────────
                    user_dashboard_preferences (WHERE user_id = ?)

4. Widgets render
```

### 2. Widget Stats Flow

```
Widget Render              Service                     Database
─────────────────────────────────────────────────────────────────

1. Component mounts
                    ──────────────────────────────────────────────>
                    getWidgetStats(orgId, widgetKey)

2. Check cache
                    ──────────────────────────────────────────────>
                    SELECT * FROM widget_stats
                    WHERE org_id = ? AND widget_key = ?
                    <──────────────────────────────────────────────

3a. If cached & not expired
                    Return cached value
                    <──────────────────────────────────────────────

3b. If not cached or expired
                    ──────────────────────────────────────────────>
                    Calculate from source tables
                    (jobs, opportunities, payments, etc.)
                    <──────────────────────────────────────────────

4. Cache result
                    ──────────────────────────────────────────────>
                    UPSERT widget_stats
                    SET expires_at = now() + 5 minutes
                    <──────────────────────────────────────────────

5. Return to component
                    <──────────────────────────────────────────────

6. Display value
```

### 3. Refresh Flow

```
User Action                Service                     Database
─────────────────────────────────────────────────────────────────

1. Click "Refresh"
                    ──────────────────────────────────────────────>
                    refreshAllStats(orgId, widgetKeys[])

2. For each widget
                    ──────────────────────────────────────────────>
                    Calculate fresh stats
                    <──────────────────────────────────────────────
                    Query source tables

3. Update cache
                    ──────────────────────────────────────────────>
                    UPSERT widget_stats
                    <──────────────────────────────────────────────

4. Reload dashboard
                    ──────────────────────────────────────────────>
                    Load fresh cached stats
                    <──────────────────────────────────────────────

5. Display updated values
```

## Component Hierarchy

```
Dashboard
├── Header
│   ├── Breadcrumb
│   └── Actions
│       ├── Refresh Button
│       ├── Clone Button
│       └── Add Widget Button
│           └── DashboardWidgetSelector (Modal)
│               ├── Search Bar
│               ├── Category List
│               │   ├── Category Header
│               │   │   ├── Expand/Collapse Icon
│               │   │   ├── Category Checkbox
│               │   │   └── Widget Count Badge
│               │   └── Widget List
│               │       └── Widget Item
│               │           ├── Checkbox
│               │           ├── Label
│               │           └── Description
│               └── Footer
│                   ├── Cancel Button
│                   └── Apply Button
└── Widget Grid
    └── DynamicWidget (for each selected widget)
        ├── Loading State (skeleton)
        └── DashboardWidgetCard
            ├── Title
            ├── Icon
            ├── Value
            ├── Subtitle
            └── Trend (optional)
```

## State Management

```
Redux Store
├── auth
│   └── user
│       ├── id
│       └── organization_id
└── (widgets managed locally in component)

Component State (Dashboard)
├── isRefreshing: boolean
├── showWidgetSelector: boolean
├── widgets: WidgetWithPreference[]
└── loading: boolean

Component State (DynamicWidget)
├── stat: WidgetStat | null
└── loading: boolean
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Row Level Security (RLS)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  dashboard_widgets:                                           │
│    SELECT: is_active = true (public read)                    │
│                                                               │
│  user_dashboard_preferences:                                  │
│    SELECT: auth.uid() = user_id                              │
│    INSERT: auth.uid() = user_id                              │
│    UPDATE: auth.uid() = user_id                              │
│    DELETE: auth.uid() = user_id                              │
│                                                               │
│  widget_stats:                                                │
│    SELECT: organization_id IN (                              │
│      SELECT organization_id FROM users                        │
│      WHERE id = auth.uid()                                   │
│    )                                                          │
└─────────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                    Caching Strategy                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Level 1: Database Cache (widget_stats)                      │
│    • Duration: 5 minutes                                     │
│    • Scope: Organization-wide                                │
│    • Invalidation: Time-based + Manual refresh               │
│                                                               │
│  Level 2: Component State                                    │
│    • Duration: Until unmount                                 │
│    • Scope: Per widget instance                              │
│    • Invalidation: Component unmount                         │
│                                                               │
│  Indexes:                                                     │
│    • user_dashboard_preferences(user_id)                     │
│    • user_dashboard_preferences(widget_key)                  │
│    • widget_stats(organization_id)                           │
│    • widget_stats(widget_key)                                │
│    • widget_stats(expires_at)                                │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Handling Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Try to fetch stats                                          │
│    ├─ Success: Display value                                 │
│    └─ Error:                                                 │
│        ├─ Log to console                                     │
│        ├─ Return null/fallback value                         │
│        └─ Display 0 or "N/A"                                 │
│                                                               │
│  Try to save preferences                                     │
│    ├─ Success: Reload dashboard                              │
│    └─ Error:                                                 │
│        ├─ Log to console                                     │
│        ├─ Show error message (future)                        │
│        └─ Keep modal open                                    │
└─────────────────────────────────────────────────────────────┘
```

This architecture provides a scalable, performant, and secure dashboard system that can easily be extended with new widgets and features.
