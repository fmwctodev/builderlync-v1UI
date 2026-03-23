import React from 'react';
import { Stat, ActivityItem, Task, Lead } from '../types';
import { StatsSection } from '../components/dashboard/StatsSection';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { TasksList } from '../components/dashboard/TasksList';
import { LeadsList } from '../components/dashboard/LeadsList';

export const Dashboard: React.FC = () => {
  // Mock data
  const stats: Stat[] = [
    { 
      title: 'Total Reviews', 
      value: '156',
      change: { value: '+24', type: 'increase', period: 'This Month' },
      icon: 'Star'
    },
    { 
      title: 'Website Traffic', 
      value: '12.5K',
      change: { value: '+15%', type: 'increase', period: 'vs Last Month' },
      icon: 'Globe'
    },
    { 
      title: 'Conversion Rate', 
      value: '3.2%',
      change: { value: '+0.8%', type: 'increase', period: 'vs Last Month' },
      icon: 'TrendingUp'
    },
    { 
      title: 'Active Leads', 
      value: '48',
      change: { value: '+12', type: 'increase', period: 'This Month' },
      icon: 'Users'
    }
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'contact',
      title: 'New Lead Generated',
      description: 'Website contact form submission from Sarah Johnson',
      time: '2 hours ago'
    },
    {
      id: '2',
      type: 'meeting',
      title: 'Review Campaign Performance',
      description: 'Monthly marketing metrics review meeting',
      time: '5 hours ago'
    },
    {
      id: '3',
      type: 'deal',
      title: 'Campaign Launched',
      description: 'Spring Renovation Promotion campaign is live',
      time: 'Yesterday'
    }
  ];

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Review Google Ads performance',
      dueDate: 'Today',
      priority: 'high',
      completed: false
    },
    {
      id: '2',
      title: 'Update website content for SEO',
      dueDate: 'Tomorrow',
      priority: 'medium',
      completed: false
    },
    {
      id: '3',
      title: 'Prepare monthly newsletter',
      dueDate: 'May 15',
      priority: 'high',
      completed: false
    }
  ];

  const leads: Lead[] = [
    {
      id: '1',
      name: 'Robert Smith',
      company: 'Hometown Builders',
      value: 8500,
      status: 'new'
    },
    {
      id: '2',
      name: 'Jessica Miller',
      company: 'Miller Construction',
      value: 12000,
      status: 'contacted'
    },
    {
      id: '3',
      name: 'David Wong',
      company: 'Wong Interiors',
      value: 5000,
      status: 'qualified'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
      
      <StatsSection stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart title="Marketing Performance" />
        </div>
        <div>
          <ActivityFeed activities={activities} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksList tasks={tasks} />
        <LeadsList leads={leads} />
      </div>
    </div>
  );
};