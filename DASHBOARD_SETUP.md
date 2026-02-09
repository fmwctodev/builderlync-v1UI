# Dynamic Dashboard - Quick Setup Guide

## Prerequisites
- Supabase project configured
- Database connection working
- User authentication in place

## Setup Steps

### 1. Run Database Migrations

```bash
# Navigate to project root
cd "d:\Delaine\BuilderLync Plateform\builderlync-unified"

# Apply migrations (if using Supabase CLI)
supabase db push

# Or manually run the SQL files in Supabase dashboard:
# 1. supabase/migrations/20251201000000_create_dashboard_widgets_system.sql
# 2. supabase/migrations/20251201000001_seed_dashboard_widgets.sql
```

### 2. Verify Database Tables

Check that these tables were created:
- `dashboard_widgets`
- `user_dashboard_preferences`
- `widget_stats`

```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('dashboard_widgets', 'user_dashboard_preferences', 'widget_stats');
```

### 3. Verify Seed Data

```sql
-- Check widgets were seeded
SELECT widget_key, name, category, default_visible 
FROM dashboard_widgets 
WHERE is_active = true;

-- Should return ~25 widgets
```

### 4. Test the Dashboard

1. **Login to your application**
2. **Navigate to Dashboard** (`/dashboard`)
3. **Click "Add Widget"** button
4. **Select some widgets** from the modal
5. **Click "Apply Changes"**
6. **Verify widgets appear** on dashboard
7. **Click "Refresh"** to update stats

### 5. Verify Data Flow

#### Check User Preferences
```sql
-- Replace with your user ID
SELECT * FROM user_dashboard_preferences 
WHERE user_id = 'your-user-id';
```

#### Check Widget Stats Cache
```sql
-- Replace with your organization ID
SELECT widget_key, stat_value, calculated_at, expires_at 
FROM widget_stats 
WHERE organization_id = 'your-org-id';
```

## File Structure

```
builderlync-unified/
├── src/
│   ├── modules/roof-runner/
│   │   ├── components/dashboard/
│   │   │   ├── DashboardWidgetCard.tsx (existing)
│   │   │   ├── DashboardWidgetSelector.tsx (existing)
│   │   │   ├── DynamicWidgets.tsx (NEW)
│   │   │   └── widgets.tsx (old - can be removed)
│   │   ├── pages/
│   │   │   └── Dashboard.tsx (updated)
│   │   └── types/
│   │       └── dashboard.ts (existing)
│   └── shared/
│       └── store/services/
│           ├── dashboardWidgetsApi.ts (existing)
│           └── widgetStatsService.ts (NEW)
└── supabase/migrations/
    ├── 20251201000000_create_dashboard_widgets_system.sql (NEW)
    └── 20251201000001_seed_dashboard_widgets.sql (NEW)
```

## Key Features Implemented

✅ **Widget Selection UI**
- Modal with search functionality
- Category grouping
- Select/deselect widgets
- Shows selected count

✅ **Dynamic Data Fetching**
- Real-time stats from database
- Automatic caching (5 min)
- Loading states
- Error handling

✅ **User Preferences**
- Save widget selections per user
- Persist across sessions
- Default widgets for new users

✅ **Performance Optimization**
- Stats caching in database
- Lazy loading of widgets
- Batch preference updates

✅ **Refresh Functionality**
- Manual refresh button
- Clears cache and fetches fresh data
- Updates all visible widgets

## Supported Widgets

### Jobs (7 widgets)
- Total Jobs
- Jobs Created
- Jobs Completed
- Jobs In Progress
- Active Jobs

### Opportunities (4 widgets)
- Total Opportunities
- New Opportunities
- Closed Won
- Pipeline Value

### Contacts (3 widgets)
- Total Contacts
- New Contacts

### Payments (5 widgets)
- Total Payments Collected (with trend)
- Pending Payments
- Overdue Payments
- Revenue

### Appointments (4 widgets)
- Total Appointments
- Appointments Booked
- Today's Appointments
- Upcoming Appointments

### Special (2 widgets)
- Recent Activity
- Upcoming Tasks

## Testing Checklist

- [ ] Database migrations applied successfully
- [ ] Seed data loaded (25+ widgets)
- [ ] Dashboard page loads without errors
- [ ] "Add Widget" button opens modal
- [ ] Can search widgets
- [ ] Can select/deselect widgets
- [ ] "Apply Changes" saves preferences
- [ ] Selected widgets appear on dashboard
- [ ] Widget stats show real data (not 0)
- [ ] "Refresh" button updates stats
- [ ] Preferences persist after page reload
- [ ] Multiple users have separate preferences

## Troubleshooting

### Issue: Widgets show 0 for all stats
**Solution:** 
- Ensure you have data in source tables (jobs, opportunities, contacts, etc.)
- Check that user has `organization_id` set
- Verify RLS policies allow access to data

### Issue: Preferences not saving
**Solution:**
- Check browser console for errors
- Verify user is authenticated
- Check RLS policies on `user_dashboard_preferences`
- Ensure unique constraint isn't violated

### Issue: Migration fails
**Solution:**
- Check if tables already exist
- Drop existing tables if needed (be careful!)
- Verify Supabase connection
- Check for syntax errors in SQL

### Issue: Stats not refreshing
**Solution:**
- Check cache expiration in `widget_stats` table
- Manually delete cache: `DELETE FROM widget_stats WHERE organization_id = 'your-org-id'`
- Verify `widgetStatsService` is being called

## Next Steps

1. **Add More Widgets:** Follow the guide in DASHBOARD_IMPLEMENTATION.md
2. **Customize Styling:** Update Tailwind classes in components
3. **Add Filters:** Implement date range filters for widgets
4. **Real-time Updates:** Add WebSocket support for live data
5. **Export/Import:** Allow users to export dashboard config

## API Endpoints Used

All operations use Supabase client directly:

- `supabase.from('dashboard_widgets').select()`
- `supabase.from('user_dashboard_preferences').select()`
- `supabase.from('user_dashboard_preferences').upsert()`
- `supabase.from('widget_stats').select()`
- `supabase.from('widget_stats').upsert()`
- `supabase.from('jobs').select()` (for stats)
- `supabase.from('opportunities').select()` (for stats)
- `supabase.from('contacts').select()` (for stats)
- `supabase.from('payments').select()` (for stats)
- `supabase.from('appointments').select()` (for stats)

## Support

For detailed documentation, see: `DASHBOARD_IMPLEMENTATION.md`

For questions or issues:
1. Check console logs
2. Verify database tables and data
3. Review RLS policies
4. Check user authentication
5. Contact development team
