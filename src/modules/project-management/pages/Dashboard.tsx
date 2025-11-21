import React from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  BarChart 
} from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors">
            New Job
          </button>
        </div>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Contacts"
          value="245"
          icon={<Users size={24} />}
          trend={{ value: "+12%", direction: "up", label: "This Month" }}
        />
        <MetricCard
          title="Appointments"
          value="28"
          icon={<Calendar size={24} />}
          trend={{ value: "+5%", direction: "up", label: "This Week" }}
        />
        <MetricCard
          title="Revenue"
          value="$24,500"
          icon={<DollarSign size={24} />}
          trend={{ value: "+18%", direction: "up", label: "This Month" }}
        />
        <MetricCard
          title="Conversion Rate"
          value="32%"
          icon={<TrendingUp size={24} />}
          trend={{ value: "-3%", direction: "down", label: "This Month" }}
        />
      </div>
      
      {/* Chart and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue Overview</CardTitle>
            <div className="flex items-center">
              <select className="text-sm border border-gray-200 dark:border-gray-700 rounded-md p-1 bg-white dark:bg-gray-800">
                <option>Last 30 days</option>
                <option>Last 60 days</option>
                <option>Last 90 days</option>
                <option>This year</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500 flex flex-col items-center">
                <BarChart size={48} strokeWidth={1} />
                <p className="mt-2 text-sm">Chart Placeholder</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <button className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
              View all
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActivityItem 
              color="blue" 
              title="New Contact Added" 
              description="Sarah Johnson was added as a new contact" 
              time="2 hours ago" 
            />
            <ActivityItem 
              color="purple" 
              title="Meeting Scheduled" 
              description="Call with Acme Corp about project proposal" 
              time="5 hours ago" 
            />
            <ActivityItem 
              color="green" 
              title="Deal Closed" 
              description="Residential renovation project - $12,500" 
              time="1 day ago" 
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Recent jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Jobs</CardTitle>
          <button className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
            View all jobs
          </button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 font-medium text-gray-500 dark:text-gray-400">Client</th>
                  <th className="pb-2 font-medium text-gray-500 dark:text-gray-400">Job Type</th>
                  <th className="pb-2 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="pb-2 font-medium text-gray-500 dark:text-gray-400">Value</th>
                  <th className="pb-2 font-medium text-gray-500 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 font-medium">Robert Johnson</td>
                  <td className="py-3">Roof Repair</td>
                  <td className="py-3">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">Completed</span>
                  </td>
                  <td className="py-3">$2,300</td>
                  <td className="py-3">Apr 12, 2025</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 font-medium">Amy Williams</td>
                  <td className="py-3">Bathroom Remodel</td>
                  <td className="py-3">
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full">In Progress</span>
                  </td>
                  <td className="py-3">$8,500</td>
                  <td className="py-3">Apr 10, 2025</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Mark Davis</td>
                  <td className="py-3">Flooring Installation</td>
                  <td className="py-3">
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full">Delayed</span>
                  </td>
                  <td className="py-3">$4,800</td>
                  <td className="py-3">Apr 8, 2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Activity item component
const ActivityItem = ({ color, title, description, time }: { 
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
  title: string;
  description: string;
  time: string;
}) => {
  const colorClasses = {
    blue: 'bg-primary-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="flex items-start">
      <div className={`w-2 h-2 mt-1.5 rounded-full ${colorClasses[color]} mr-3`} />
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
};

export default Dashboard;