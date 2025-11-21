import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { BarChart3, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

type DashboardState = 'loading' | 'error' | 'data';

export function Dashboard() {
  const [state, setState] = useState<DashboardState>('data');
  
  const handleRetry = () => {
    setState('loading');
    setTimeout(() => {
      setState('data');
    }, 1500);
  };
  
  if (state === 'loading') {
    return <LoadingState message="Loading dashboard data..." />;
  }
  
  if (state === 'error') {
    return (
      <ErrorState 
        title="Dashboard Error" 
        message="Unable to load dashboard data. Please try again."
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Contacts" 
          value="245" 
          change="+12%" 
          icon={<Users className="w-10 h-10 text-primary-500 dark:text-primary-400" />} 
        />
        <StatCard 
          title="Appointments" 
          value="28" 
          change="+5%" 
          timeframe="This Week"
          icon={<Calendar className="w-10 h-10 text-green-500 dark:text-green-400" />} 
        />
        <StatCard 
          title="Revenue" 
          value="$24,500" 
          change="+18%" 
          timeframe="This Month"
          icon={<DollarSign className="w-10 h-10 text-primary-500 dark:text-purple-400" />} 
        />
        <StatCard 
          title="Conversion Rate" 
          value="32%" 
          change="-3%" 
          isNegative
          icon={<TrendingUp className="w-10 h-10 text-amber-500 dark:text-amber-400" />} 
        />
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revenue Overview</h3>
            <select className="text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
            </select>
          </div>
          
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600" />
            <span className="ml-3 text-gray-500 dark:text-gray-400">Chart Placeholder</span>
          </div>
        </Card>
        
        {/* Recent Activity */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              View all
            </button>
          </div>
          
          <div className="space-y-4">
            <ActivityItem 
              title="New Contact Added" 
              description="Sarah Johnson was added as a new contact"
              time="2 hours ago"
            />
            <ActivityItem 
              title="Meeting Scheduled" 
              description="Call with Acme Corp about project proposal"
              time="5 hours ago"
            />
            <ActivityItem 
              title="Deal Closed" 
              description="Residential renovation project - $12,500"
              time="Yesterday"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  timeframe?: string;
  isNegative?: boolean;
  icon?: React.ReactNode;
}

function StatCard({ title, value, change, timeframe = "This Month", isNegative = false, icon }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
        {icon}
      </div>
      <div className="mt-2 flex items-center text-sm">
        <span className={`mr-1 ${isNegative ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
          {change}
        </span>
        <span className="text-gray-500 dark:text-gray-400">{timeframe}</span>
      </div>
    </Card>
  );
}

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
}

function ActivityItem({ title, description, time }: ActivityItemProps) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 h-3 w-3 rounded-full bg-primary-500 mt-1.5"></div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{time}</p>
      </div>
    </div>
  );
}