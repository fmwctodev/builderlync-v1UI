# Dynamic Dashboard Implementation

## Overview
This implementation provides a fully dynamic dashboard system where users can select which widgets to display, and the widgets fetch real-time statistics from the database.

## Architecture

### Database Schema

#### 1. `dashboard_widgets` Table
Stores all available widgets that can be displayed on the dashboard.

```sql
- id: uuid (Primary Key)
- widget_key: text (Unique identifier for the widget)
- metric_id: text (Reference to metrics data)
- name: text (Display name)
- description: text (Widget description)
- category: text (Widget category: jobs, opportunities, payments, etc.)
- icon_name: text (Lucide icon name)
- is_active: boolean (Whether widget is available)
- default_visible: boolean (Show by default for new users)
- created_at: timestamptz
- updated_at: timestamptz
```

#### 2. `user_dashboard_preferences` Table
Stores user-specific widget preferences.

```sql
- id: uuid (Primary Key)
- user_id: uuid (Foreign Key to auth.users)
- widget_key: text (Widget identifier)
- is_visible: boolean (Whether user wants to see this widget)
- position: integer (Display order)
- created_at: timestamptz
- updated_at: timestamptz
- UNIQUE(user_id, widget_key)
```

#### 3. `widget_stats` Table
Caches calculated widget statistics for performance.

```sql
- id: uuid (Primary Key)
- organization_id: uuid (Foreign Key to organizations)
- widget_key: text (Widget identifier)
- stat_value: jsonb (Cached statistics)
- calculated_at: timestamptz
- expires_at: timestamptz (Cache expiration)
- UNIQUE(organization_id, widget_key)
```

## Frontend Components

### 1. DashboardWidgetSelector
Modal component for selecting which widgets to display.

**Features:**
- Search widgets by name/description
- Group widgets by category
- Select/deselect individual widgets or entire categories
- Shows count of selected widgets
- Expandable/collapsible categories

**Location:** `src/modules/roof-runner/components/dashboard/DashboardWidgetSelector.tsx`

### 2. DynamicWidgets
Component that renders widgets with real-time data.

**Features:**
- Fetches real statistics from database
- Shows loading state while fetching
- Displays trends (increase/decrease)
- Caches data for performance

**Location:** `src/modules/roof-runner/components/dashboard/DynamicWidgets.tsx`

### 3. Dashboard Page
Main dashboard page that orchestrates everything.

**Features:**
- Loads user widget preferences
- Displays selected widgets in grid layout
- Refresh functionality to update all stats
- Add Widget button to open selector
- Shows widget count badge

**Location:** `src/modules/roof-runner/pages/Dashboard.tsx`

## Backend Services

### 1. dashboardWidgetsApi
Handles widget configuration and user preferences.

**Methods:**
- `getAvailableWidgets()`: Get all active widgets
- `getUserPreferences(userId)`: Get user's widget preferences
- `getWidgetsWithPreferences(userId)`: Get widgets merged with user preferences
- `updateUserPreferences(userId, updates)`: Save user's widget selections
- `toggleWidgetVisibility(userId, widgetKey, isVisible)`: Toggle single widget
- `initializeDefaultPreferences(userId)`: Set up default widgets for new users

**Location:** `src/shared/store/services/dashboardWidgetsApi.ts`

### 2. widgetStatsService
Calculates and caches widget statistics.

**Methods:**
- `getWidgetStats(organizationId, widgetKey)`: Get stats for a widget (cached)
- `calculateWidgetStat(organizationId, widgetKey)`: Calculate fresh stats
- `refreshAllStats(organizationId, widgetKeys)`: Refresh multiple widgets

**Supported Widgets:**
- Jobs: total, created, completed, in-progress
- Opportunities: total, new, closed-won, pipeline value
- Contacts: total, new contacts
- Payments: total collected, pending, overdue (with trends)
- Appointments: total, booked, today's appointments

**Caching:**
- Stats are cached for 5 minutes
- Automatic cache invalidation on expiry
- Manual refresh available via dashboard

**Location:** `src/shared/store/services/widgetStatsService.ts`

## API Flow

### Selecting Widgets
1. User clicks "Add Widget" button
2. DashboardWidgetSelector modal opens
3. User selects/deselects widgets
4. User clicks "Apply Changes"
5. Frontend calls `dashboardWidgetsApi.updateUserPreferences()`
6. Backend saves to `user_dashboard_preferences` table
7. Dashboard reloads with new widget selection

### Displaying Widget Stats
1. Dashboard loads user's visible widgets
2. For each widget, DynamicWidget component renders
3. Component calls `widgetStatsService.getWidgetStats()`
4. Service checks `widget_stats` cache table
5. If cached and not expired, return cached value
6. If not cached, calculate fresh stats from source tables
7. Cache the result in `widget_stats` table
8. Return stats to component
9. Component displays the data

### Refreshing Dashboard
1. User clicks "Refresh" button
2. Dashboard calls `widgetStatsService.refreshAllStats()`
3. Service recalculates all visible widget stats
4. Updates cache in `widget_stats` table
5. Dashboard reloads to show fresh data

## Database Migrations

### Migration Files
1. `20251201000000_create_dashboard_widgets_system.sql`
   - Creates all three tables
   - Sets up RLS policies
   - Creates indexes for performance
   - Adds triggers for updated_at

2. `20251201000001_seed_dashboard_widgets.sql`
   - Seeds initial widget data
   - Maps widgets to metrics
   - Sets default visibility

### Running Migrations
```bash
# Apply migrations
supabase db push

# Or if using Supabase CLI
supabase migration up
```

## Usage

### For Users
1. Navigate to Dashboard
2. Click "Add Widget" button
3. Search or browse available widgets
4. Select desired widgets by clicking checkboxes
5. Click "Apply Changes"
6. Dashboard updates with selected widgets
7. Use "Refresh" button to update statistics

### For Developers

#### Adding a New Widget

1. **Add to metricsData.ts:**
```typescript
{
  id: 'my-new-widget',
  label: 'My New Widget',
  description: 'Description of widget',
  dashboardEnabled: true,
  reportingEnabled: true,
  defaultVisible: false
}
```

2. **Add calculation to widgetStatsService.ts:**
```typescript
case 'my-new-widget': {
  const { count } = await supabase
    .from('my_table')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);
  return { value: count || 0, subtitle: 'Description' };
}
```

3. **Add to DynamicWidgets.tsx:**
```typescript
'my-new-widget': () => (
  <DynamicWidget 
    widgetKey="my-new-widget" 
    title="My New Widget" 
    icon="IconName" 
  />
),
```

4. **Seed the database:**
```sql
INSERT INTO dashboard_widgets (widget_key, metric_id, name, description, category, icon_name, is_active, default_visible)
VALUES ('my-new-widget', 'my-new-widget', 'My New Widget', 'Description', 'category', 'IconName', true, false);
```

## Performance Considerations

1. **Caching:** Widget stats are cached for 5 minutes to reduce database load
2. **Lazy Loading:** Widgets only fetch data when rendered
3. **Batch Operations:** Multiple widget preferences updated in single transaction
4. **Indexes:** Database indexes on frequently queried columns
5. **RLS Policies:** Row-level security ensures users only see their data

## Security

1. **RLS Policies:** All tables have row-level security enabled
2. **User Isolation:** Users can only access their own preferences
3. **Organization Isolation:** Stats are scoped to user's organization
4. **Input Validation:** Widget keys validated against available widgets

## Future Enhancements

1. **Drag & Drop:** Allow users to reorder widgets
2. **Widget Sizing:** Support different widget sizes (1x1, 2x1, etc.)
3. **Custom Widgets:** Allow users to create custom widgets
4. **Export/Import:** Export dashboard configuration
5. **Templates:** Pre-configured dashboard templates
6. **Real-time Updates:** WebSocket support for live data
7. **Advanced Filters:** Date range filters for widgets
8. **Drill-down:** Click widgets to see detailed reports

## Troubleshooting

### Widgets not loading
- Check browser console for errors
- Verify Supabase connection
- Check RLS policies are correctly set
- Ensure user has organization_id

### Stats showing 0
- Verify data exists in source tables
- Check organization_id matches
- Review widgetStatsService calculations
- Check cache expiration

### Preferences not saving
- Check user authentication
- Verify RLS policies
- Check unique constraint on user_id + widget_key
- Review browser network tab for API errors

## Testing

### Manual Testing Checklist
- [ ] Select widgets and verify they appear
- [ ] Deselect widgets and verify they disappear
- [ ] Refresh dashboard and verify stats update
- [ ] Search widgets in selector
- [ ] Select entire category
- [ ] Clear all selections
- [ ] Verify stats are accurate
- [ ] Test with multiple users
- [ ] Test with different organizations

### Database Testing
```sql
-- Check widget data
SELECT * FROM dashboard_widgets WHERE is_active = true;

-- Check user preferences
SELECT * FROM user_dashboard_preferences WHERE user_id = 'your-user-id';

-- Check cached stats
SELECT * FROM widget_stats WHERE organization_id = 'your-org-id';

-- Clear cache for testing
DELETE FROM widget_stats WHERE organization_id = 'your-org-id';
```

## Support

For issues or questions:
1. Check this documentation
2. Review console logs
3. Check database tables
4. Verify migrations ran successfully
5. Contact development team
