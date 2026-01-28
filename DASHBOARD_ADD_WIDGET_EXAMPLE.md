# Example: Adding a New Widget to Dashboard

This guide shows you how to add a new widget step-by-step.

## Example: "Overdue Tasks" Widget

Let's add a widget that shows the count of overdue tasks.

### Step 1: Add to Metrics Data

**File:** `src/shared/constants/metricsData.ts`

Add to the appropriate category (e.g., General category):

```typescript
{
  id: 'general-overdue-tasks',
  label: 'Overdue Tasks',
  description: 'Tasks that are past their due date',
  dashboardEnabled: true,
  reportingEnabled: true,
  defaultVisible: false
}
```

### Step 2: Add Stat Calculation

**File:** `src/shared/store/services/widgetStatsService.ts`

Add a new case in the `calculateWidgetStat` method:

```typescript
case 'general-overdue-tasks': {
  const now = new Date();
  
  const { count } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'pending')
    .lt('due_date', now.toISOString());
  
  return {
    value: count || 0,
    subtitle: 'Need attention'
  };
}
```

### Step 3: Add Widget Component

**File:** `src/modules/roof-runner/components/dashboard/DynamicWidgets.tsx`

Add to the `WidgetComponents` object:

```typescript
'general-overdue-tasks': () => (
  <DynamicWidget 
    widgetKey="general-overdue-tasks" 
    title="Overdue Tasks" 
    icon="AlertTriangle"
    defaultSubtitle="Need attention"
  />
),
```

### Step 4: Seed Database

**File:** Create a new migration or add to existing seed file

```sql
INSERT INTO dashboard_widgets (
  widget_key, 
  metric_id, 
  name, 
  description, 
  category, 
  icon_name, 
  is_active, 
  default_visible
) VALUES (
  'general-overdue-tasks',
  'general-overdue-tasks',
  'Overdue Tasks',
  'Tasks that are past their due date',
  'reporting',
  'AlertTriangle',
  true,
  false
)
ON CONFLICT (widget_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = now();
```

### Step 5: Run Migration

```bash
# If you created a new migration file
supabase db push

# Or run the SQL directly in Supabase dashboard
```

### Step 6: Test

1. Refresh your application
2. Go to Dashboard
3. Click "Add Widget"
4. Search for "Overdue Tasks"
5. Select it and click "Apply Changes"
6. Verify it appears on dashboard with correct count

## Example: Widget with Trend

Let's add a widget that shows revenue with month-over-month trend.

### Step 1: Add Calculation with Trend

```typescript
case 'revenue-monthly': {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Current month revenue
  const { data: currentMonth } = await supabase
    .from('payments')
    .select('amount')
    .eq('organization_id', organizationId)
    .eq('status', 'completed')
    .gte('created_at', startOfMonth.toISOString());
  
  const currentTotal = currentMonth?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  // Last month revenue
  const { data: lastMonth } = await supabase
    .from('payments')
    .select('amount')
    .eq('organization_id', organizationId)
    .eq('status', 'completed')
    .gte('created_at', startOfLastMonth.toISOString())
    .lte('created_at', endOfLastMonth.toISOString());
  
  const lastTotal = lastMonth?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  // Calculate trend
  const trend = lastTotal > 0 
    ? ((currentTotal - lastTotal) / lastTotal) * 100 
    : 0;

  return {
    value: `$${currentTotal.toLocaleString()}`,
    subtitle: 'This month',
    trend: {
      value: Math.abs(Math.round(trend)),
      isPositive: trend >= 0
    }
  };
}
```

## Example: Complex Widget (Chart/List)

For widgets that need custom rendering (not just a stat card):

### Step 1: Create Custom Component

**File:** `src/modules/roof-runner/components/dashboard/CustomWidgets.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../shared/store';
import { supabase } from '../../../../shared/lib/supabase';

export const TopPerformersWidget: React.FC = () => {
  const [performers, setPerformers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.organization_id) return;

      const { data } = await supabase
        .from('staff')
        .select('name, jobs_completed')
        .eq('organization_id', user.organization_id)
        .order('jobs_completed', { ascending: false })
        .limit(5);

      setPerformers(data || []);
      setLoading(false);
    };

    fetchData();
  }, [user?.organization_id]);

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Top Performers
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          By jobs completed
        </p>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {performers.map((performer, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {performer.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {performer.jobs_completed} jobs
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### Step 2: Add to Widget Components

```typescript
import { TopPerformersWidget } from './CustomWidgets';

export const WidgetComponents: Record<string, React.FC> = {
  // ... other widgets
  'top-performers': TopPerformersWidget,
};
```

## Common Widget Patterns

### 1. Simple Count Widget
```typescript
case 'my-count-widget': {
  const { count } = await supabase
    .from('my_table')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);
  
  return { value: count || 0, subtitle: 'Description' };
}
```

### 2. Sum/Total Widget
```typescript
case 'my-sum-widget': {
  const { data } = await supabase
    .from('my_table')
    .select('amount')
    .eq('organization_id', organizationId);
  
  const total = data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  return { value: `$${total.toLocaleString()}`, subtitle: 'Total' };
}
```

### 3. Percentage Widget
```typescript
case 'my-percentage-widget': {
  const { count: total } = await supabase
    .from('my_table')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);
  
  const { count: completed } = await supabase
    .from('my_table')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'completed');
  
  const percentage = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
  return { value: `${percentage}%`, subtitle: 'Completion rate' };
}
```

### 4. Average Widget
```typescript
case 'my-average-widget': {
  const { data } = await supabase
    .from('my_table')
    .select('value')
    .eq('organization_id', organizationId);
  
  const avg = data && data.length > 0
    ? data.reduce((sum, item) => sum + (item.value || 0), 0) / data.length
    : 0;
  
  return { value: Math.round(avg), subtitle: 'Average' };
}
```

### 5. Date Range Widget
```typescript
case 'my-date-range-widget': {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days
  
  const { count } = await supabase
    .from('my_table')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('created_at', startDate.toISOString());
  
  return { value: count || 0, subtitle: 'Last 30 days' };
}
```

## Testing Your Widget

### 1. Unit Test the Calculation
```typescript
// Test with sample data
const testOrgId = 'test-org-id';
const stat = await widgetStatsService.calculateWidgetStat(testOrgId, 'my-widget');
console.log('Widget stat:', stat);
```

### 2. Check Cache
```sql
SELECT * FROM widget_stats 
WHERE widget_key = 'my-widget' 
AND organization_id = 'your-org-id';
```

### 3. Manual Testing
1. Add widget to dashboard
2. Verify correct value displays
3. Check loading state
4. Test refresh functionality
5. Verify cache expiration (wait 5 minutes)

## Best Practices

1. **Use Descriptive Names:** Widget keys should be clear and consistent
2. **Handle Null Values:** Always provide fallback values (|| 0)
3. **Optimize Queries:** Use count when you only need count, not full data
4. **Cache Appropriately:** 5 minutes is good for most stats
5. **Error Handling:** Wrap calculations in try-catch
6. **Loading States:** Always show loading state while fetching
7. **Responsive Design:** Ensure widgets look good on all screen sizes
8. **Accessibility:** Use semantic HTML and ARIA labels

## Troubleshooting

### Widget shows 0
- Check if data exists in source table
- Verify organization_id is correct
- Check RLS policies
- Review query logic

### Widget not appearing in selector
- Verify it's in metricsData.ts with dashboardEnabled: true
- Check database seed ran successfully
- Ensure is_active = true in dashboard_widgets table

### Stats not updating
- Check cache expiration
- Clear cache manually
- Verify refresh functionality
- Check for errors in console

## Resources

- Main Documentation: `DASHBOARD_IMPLEMENTATION.md`
- Setup Guide: `DASHBOARD_SETUP.md`
- Metrics Data: `src/shared/constants/metricsData.ts`
- Widget Stats Service: `src/shared/store/services/widgetStatsService.ts`
- Dynamic Widgets: `src/modules/roof-runner/components/dashboard/DynamicWidgets.tsx`
