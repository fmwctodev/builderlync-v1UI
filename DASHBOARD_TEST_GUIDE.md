# Quick Test Guide - Dashboard Implementation

## ✅ What to Check

### 1. Open Browser Console
Press F12 to open Developer Tools and go to the Console tab.

### 2. Navigate to Dashboard
Go to `/dashboard` in your application.

### 3. Look for These Console Messages

#### On Page Load:
```
🔄 [Dashboard] Loading widgets for user: <user-id>
📊 [Dashboard] Calling getWidgetsWithPreferences...
📊 [dashboardWidgetsApi] Getting available widgets...
✅ [dashboardWidgetsApi] Found XX widgets
👤 [dashboardWidgetsApi] Getting user preferences for: <user-id>
✅ [dashboardWidgetsApi] Found X preferences
✅ [Dashboard] Loaded XX widgets
```

#### When You Click "Add Widget":
- Modal should open
- You should see a list of widgets grouped by category
- Search should work

#### When You Select Widgets and Click "Apply Changes":
```
💾 [Dashboard] Applying widget selection: [array of widget keys]
💾 [Dashboard] Saving preferences...
💾 [dashboardWidgetsApi] Updating preferences for: <user-id> X widgets
✅ [dashboardWidgetsApi] Saved to localStorage
✅ [dashboardWidgetsApi] Saved to database (or warning if DB not ready)
✅ [Dashboard] Preferences saved, reloading...
🔄 [Dashboard] Loading widgets for user: <user-id>
```

#### When Widgets Render:
```
📊 [widgetStatsService] Getting stats for: jobs-total
✅ [widgetStatsService] Stats for jobs-total: {value: 23, subtitle: "Total jobs"}
📊 [widgetStatsService] Getting stats for: revenue_total
✅ [widgetStatsService] Stats for revenue_total: {value: "$12,450", subtitle: "This month"}
... (for each visible widget)
```

## 🎯 Expected Behavior

### First Time User (No Preferences Saved)
1. Dashboard loads
2. Shows "No widgets selected" message
3. Click "Add Widget"
4. Select some widgets
5. Click "Apply Changes"
6. Widgets appear on dashboard with data

### Returning User (Has Preferences)
1. Dashboard loads
2. Shows previously selected widgets
3. Widgets display with data (mock data if DB not ready)
4. Can add/remove widgets
5. Preferences persist after page reload

## 🐛 Troubleshooting

### No Console Messages
**Problem:** Console is empty, no logs appearing

**Solution:**
- Make sure you're on the Dashboard page
- Check if console is filtered (should show "All levels")
- Refresh the page

### "Supabase not initialized" Warning
**Problem:** See warning about Supabase

**Solution:**
- This is NORMAL if migrations haven't been run yet
- Data will be saved to localStorage instead
- Widgets will use mock data
- Everything still works!

### Widgets Show 0 or "No data"
**Problem:** All widgets show 0

**Solution:**
- Check console for errors
- If you see "using mock data" - this is expected
- Mock data should show: Jobs: 23, Revenue: $12,450, etc.
- If still showing 0, check the widgetKey matches in DynamicWidgets.tsx

### Preferences Not Saving
**Problem:** Selected widgets don't persist after reload

**Solution:**
- Check browser console for errors
- Check localStorage: Open DevTools > Application > Local Storage
- Look for key: `dashboard_prefs_<user-id>`
- Should contain JSON array of preferences

### Modal Doesn't Open
**Problem:** Click "Add Widget" but nothing happens

**Solution:**
- Check console for errors
- Verify DashboardWidgetSelector component exists
- Check if modal is hidden behind other elements (z-index issue)

## 📊 Test Data

If using mock data, you should see:

| Widget | Value | Subtitle |
|--------|-------|----------|
| Total Jobs | 23 | Total jobs |
| Jobs Created | 8 | This month |
| Jobs Completed | 5 | This month |
| Active Jobs | 15 | In progress |
| Opportunities | $45,230 | Pipeline value |
| New Opportunities | 12 | This month |
| Closed Won | 4 | This month |
| Total Contacts | 1,247 | Total contacts |
| New Contacts | 34 | This month |
| Revenue | $12,450 | This month (↑ 12%) |
| Pending Payments | $8,200 | Awaiting payment |
| Overdue Payments | $2,100 | Overdue |
| Upcoming Appointments | 12 | Next 7 days |
| Appointments Booked | 18 | This month |
| Today's Appointments | 3 | Scheduled for today |

## ✅ Success Criteria

- [ ] Console shows API call logs
- [ ] Dashboard loads without errors
- [ ] "Add Widget" button opens modal
- [ ] Can search widgets in modal
- [ ] Can select/deselect widgets
- [ ] "Apply Changes" saves preferences
- [ ] Selected widgets appear on dashboard
- [ ] Widgets show data (mock or real)
- [ ] Preferences persist after page reload
- [ ] "Refresh" button works
- [ ] No JavaScript errors in console

## 🔄 Next Steps

Once this works:

1. **Run Database Migrations**
   ```bash
   supabase db push
   ```

2. **Verify Tables Created**
   - dashboard_widgets
   - user_dashboard_preferences
   - widget_stats

3. **Test with Real Data**
   - Add some jobs, opportunities, contacts
   - Refresh dashboard
   - Widgets should show real counts

4. **Remove Mock Data** (optional)
   - Once DB is working, you can remove the getMockStat fallback
   - Or keep it for development/demo purposes

## 📝 Notes

- **localStorage is used as fallback** - This means it works even without database
- **Mock data is provided** - Widgets show realistic data immediately
- **Console logs are detailed** - Easy to debug and track what's happening
- **Graceful degradation** - If DB fails, falls back to localStorage and mock data

## 🎉 Success!

If you see:
- ✅ Console logs showing API calls
- ✅ Widgets appearing on dashboard
- ✅ Data showing in widgets
- ✅ Preferences saving and persisting

**Then the implementation is working correctly!** 🎊

You can now:
- Run migrations to enable database storage
- Add more widgets
- Customize the UI
- Add real data calculations
