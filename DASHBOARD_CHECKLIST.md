# Dynamic Dashboard - Deployment Checklist

## Pre-Deployment Checklist

### ✅ Files Created
- [ ] `supabase/migrations/20251201000000_create_dashboard_widgets_system.sql`
- [ ] `supabase/migrations/20251201000001_seed_dashboard_widgets.sql`
- [ ] `src/shared/store/services/widgetStatsService.ts`
- [ ] `src/modules/roof-runner/components/dashboard/DynamicWidgets.tsx`
- [ ] `DASHBOARD_IMPLEMENTATION.md`
- [ ] `DASHBOARD_SETUP.md`
- [ ] `DASHBOARD_ADD_WIDGET_EXAMPLE.md`
- [ ] `DASHBOARD_SUMMARY.md`
- [ ] `DASHBOARD_ARCHITECTURE.md`

### ✅ Files Modified
- [ ] `src/modules/roof-runner/pages/Dashboard.tsx` (updated imports and refresha)

### ✅ Existing Files (Verify Present)
- [ ] `src/modules/roof-runner/components/dashboard/DashboardWidgetSelector.tsx`
- [ ] `src/modules/roof-runner/components/dashboard/DashboardWidgetCard.tsx`
- [ ] `src/shared/store/services/dashboardWidgetsApi.ts`
- [ ] `src/shared/constants/metricsData.ts`
- [ ] `src/modules/roof-runner/types/dashboard.ts`

## Database Setup

### Step 1: Backup Current Database
- [ ] Create database backup
- [ ] Document current schema
- [ ] Note any custom modifications

### Step 2: Run Migrations
- [ ] Navigate to project directory
- [ ] Run: `supabase db push` OR
- [ ] Manually execute SQL in Supabase dashboard:
  - [ ] Run `20251201000000_create_dashboard_widgets_system.sql`
  - [ ] Run `20251201000001_seed_dashboard_widgets.sql`

### Step 3: Verify Database
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('dashboard_widgets', 'user_dashboard_preferences', 'widget_stats');
-- Expected: 3 rows

-- Check widgets seeded
SELECT COUNT(*) FROM dashboard_widgets WHERE is_active = true;
-- Expected: 25+

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('dashboard_widgets', 'user_dashboard_preferences', 'widget_stats');
-- Expected: All should have rowsecurity = true

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('user_dashboard_preferences', 'widget_stats');
-- Expected: Multiple indexes
```

## Frontend Setup

### Step 1: Install Dependencies (if needed)
- [ ] Verify all dependencies installed: `npm install`
- [ ] Check for TypeScript errors: `npm run type-check`
- [ ] Check for linting errors: `npm run lint`

### Step 2: Build Application
- [ ] Run development build: `npm run dev`
- [ ] Check for build errors
- [ ] Verify no console errors on startup

### Step 3: Test in Development
- [ ] Application starts successfully
- [ ] No console errors
- [ ] Dashboard page loads
- [ ] No TypeScript errors

## Functional Testing

### User Authentication
- [ ] User can login
- [ ] User has `organization_id` set
- [ ] User session persists

### Dashboard Page
- [ ] Dashboard page loads without errors
- [ ] Page shows breadcrumb: "Home / Dashboard"
- [ ] Page shows action buttons: Refresh, Clone, Add Widget
- [ ] Default widgets appear (if first time user)

### Widget Selection
- [ ] Click "Add Widget" button
- [ ] Modal opens
- [ ] Search bar is visible
- [ ] Categories are listed
- [ ] Widget count badges show correct numbers
- [ ] Can expand/collapse categories
- [ ] Can search widgets
- [ ] Search filters widgets correctly
- [ ] Can select individual widgets
- [ ] Can select entire category
- [ ] Selected count updates
- [ ] Can clear all selections
- [ ] Cancel button closes modal
- [ ] Apply Changes button saves and closes modal

### Widget Display
- [ ] Selected widgets appear on dashboard
- [ ] Widgets show loading state initially
- [ ] Widgets display actual data (not 0)
- [ ] Widget icons display correctly
- [ ] Widget titles are correct
- [ ] Widget subtitles are correct
- [ ] Trends show when applicable (↑ or ↓)
- [ ] Grid layout is responsive

### Data Accuracy
Test each widget type:

#### Jobs Widgets
- [ ] Total Jobs shows correct count
- [ ] Jobs Created shows this month's count
- [ ] Jobs Completed shows this month's count
- [ ] Active Jobs shows in-progress count

#### Opportunities Widgets
- [ ] Total Opportunities shows pipeline value
- [ ] New Opportunities shows this month's count
- [ ] Closed Won shows this month's count

#### Contacts Widgets
- [ ] Total Contacts shows correct count
- [ ] New Contacts shows this month's count

#### Payments Widgets
- [ ] Total Payments shows this month's revenue
- [ ] Pending Payments shows pending amount
- [ ] Overdue Payments shows overdue amount
- [ ] Revenue shows trend (if data available)

#### Appointments Widgets
- [ ] Total Appointments shows next 7 days
- [ ] Appointments Booked shows this month's count
- [ ] Today's Appointments shows today's count

### Refresh Functionality
- [ ] Click Refresh button
- [ ] Button shows loading state (spinner)
- [ ] Stats update after refresh
- [ ] Loading state clears after refresh

### Persistence
- [ ] Reload page
- [ ] Selected widgets still appear
- [ ] Widget order is maintained
- [ ] Stats are still visible

### Multi-User Testing
- [ ] Login as User A
- [ ] Select widgets for User A
- [ ] Logout
- [ ] Login as User B
- [ ] User B sees different/default widgets
- [ ] Select different widgets for User B
- [ ] Logout
- [ ] Login as User A again
- [ ] User A still sees their original widgets

### Performance Testing
- [ ] Dashboard loads in < 2 seconds
- [ ] Widget stats load in < 1 second (cached)
- [ ] Refresh completes in < 3 seconds
- [ ] No memory leaks (check DevTools)
- [ ] No excessive re-renders

### Cache Testing
- [ ] Select widgets and wait 5 minutes
- [ ] Reload page
- [ ] Stats should load from cache (fast)
- [ ] Click Refresh
- [ ] Stats should recalculate (slower)
- [ ] Check `widget_stats` table for updated timestamps

### Error Handling
- [ ] Disconnect internet
- [ ] Try to load dashboard
- [ ] Widgets show fallback values (0 or N/A)
- [ ] No app crash
- [ ] Reconnect internet
- [ ] Click Refresh
- [ ] Stats load correctly

### Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Grid adjusts correctly
- [ ] Modal is usable on all sizes

### Dark Mode
- [ ] Switch to dark mode
- [ ] Dashboard displays correctly
- [ ] Widgets are readable
- [ ] Modal displays correctly
- [ ] No contrast issues

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Database Verification

### Check User Preferences
```sql
-- Replace with actual user ID
SELECT 
  udp.widget_key,
  dw.name,
  udp.is_visible,
  udp.position
FROM user_dashboard_preferences udp
JOIN dashboard_widgets dw ON dw.widget_key = udp.widget_key
WHERE udp.user_id = 'YOUR_USER_ID'
ORDER BY udp.position;
```
- [ ] Preferences match what user selected
- [ ] Position values are sequential
- [ ] is_visible matches dashboard display

### Check Widget Stats Cache
```sql
-- Replace with actual organization ID
SELECT 
  widget_key,
  stat_value,
  calculated_at,
  expires_at,
  (expires_at > now()) as is_valid
FROM widget_stats
WHERE organization_id = 'YOUR_ORG_ID'
ORDER BY calculated_at DESC;
```
- [ ] Stats exist for visible widgets
- [ ] stat_value contains valid JSON
- [ ] expires_at is 5 minutes after calculated_at
- [ ] is_valid shows true for recent stats

### Check RLS Policies
```sql
-- Test as different users
SET ROLE authenticated;
SET request.jwt.claim.sub = 'USER_ID_1';

-- Should only see own preferences
SELECT * FROM user_dashboard_preferences;

-- Should see organization stats
SELECT * FROM widget_stats;
```
- [ ] Users can only see own preferences
- [ ] Users can only see organization stats
- [ ] No unauthorized access

## Performance Benchmarks

### Load Times
- [ ] Initial page load: < 2 seconds
- [ ] Widget stats (cached): < 500ms
- [ ] Widget stats (fresh): < 2 seconds
- [ ] Refresh all widgets: < 3 seconds
- [ ] Modal open: < 100ms

### Database Queries
- [ ] Widget list query: < 100ms
- [ ] User preferences query: < 50ms
- [ ] Stats cache query: < 50ms
- [ ] Stats calculation: < 500ms per widget

### Memory Usage
- [ ] Initial load: < 50MB
- [ ] After 10 minutes: < 100MB
- [ ] No memory leaks detected

## Security Verification

### Authentication
- [ ] Unauthenticated users redirected to login
- [ ] Expired sessions handled correctly
- [ ] User ID validated on all requests

### Authorization
- [ ] Users can only modify own preferences
- [ ] Users can only see organization data
- [ ] No cross-organization data leakage

### Input Validation
- [ ] Widget keys validated against available widgets
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (React escaping)

### RLS Policies
- [ ] All tables have RLS enabled
- [ ] Policies tested with multiple users
- [ ] No policy bypasses found

## Documentation Review

- [ ] `DASHBOARD_IMPLEMENTATION.md` is accurate
- [ ] `DASHBOARD_SETUP.md` is clear
- [ ] `DASHBOARD_ADD_WIDGET_EXAMPLE.md` has working examples
- [ ] `DASHBOARD_SUMMARY.md` is up to date
- [ ] `DASHBOARD_ARCHITECTURE.md` matches implementation
- [ ] Code comments are sufficient
- [ ] README updated (if needed)

## Deployment Steps

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Code reviewed
- [ ] Documentation complete

### Deployment
- [ ] Backup production database
- [ ] Run migrations on production
- [ ] Verify migrations successful
- [ ] Deploy frontend code
- [ ] Verify deployment successful

### Post-Deployment
- [ ] Test in production
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify user feedback
- [ ] Document any issues

## Rollback Plan

If issues occur:
- [ ] Revert frontend deployment
- [ ] Rollback database migrations (if needed)
- [ ] Restore from backup (if needed)
- [ ] Notify users of downtime
- [ ] Document issues for fix

## Success Criteria

✅ All tests passing
✅ No console errors
✅ Performance benchmarks met
✅ Security verified
✅ Documentation complete
✅ User acceptance testing passed
✅ Production deployment successful

## Known Limitations

- [ ] Cache duration is fixed at 5 minutes
- [ ] No drag-and-drop reordering yet
- [ ] No custom widget sizes yet
- [ ] No real-time updates yet
- [ ] Limited to predefined widgets

## Future Enhancements

- [ ] Drag-and-drop widget reordering
- [ ] Custom widget sizes (1x1, 2x1, 2x2)
- [ ] User-created custom widgets
- [ ] Dashboard templates
- [ ] Export/import configurations
- [ ] Real-time updates via WebSocket
- [ ] Date range filters
- [ ] Drill-down functionality
- [ ] More widget types (charts, tables)
- [ ] Widget alerts and notifications

## Support Contacts

- **Technical Issues:** [Contact Info]
- **Database Issues:** [Contact Info]
- **User Support:** [Contact Info]

## Sign-Off

- [ ] Developer: _________________ Date: _______
- [ ] QA: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______
- [ ] DevOps: _________________ Date: _______

---

**Status:** Ready for Deployment ✅

**Last Updated:** December 1, 2024
