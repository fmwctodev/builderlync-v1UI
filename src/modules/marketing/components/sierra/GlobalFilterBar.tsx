import React from 'react';
import { Calendar, ChevronDown, MapPin, Wrench, Megaphone } from 'lucide-react';

interface GlobalFilterBarProps {
  dateRange: string;
  onDateRangeChange: (v: string) => void;
  serviceType?: string;
  onServiceTypeChange?: (v: string) => void;
  channel?: string;
  onChannelChange?: (v: string) => void;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  dateRange,
  onDateRangeChange,
  serviceType = 'all',
  onServiceTypeChange,
  channel = 'all',
  onChannelChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-gray-300 transition-colors">
        <Calendar size={14} className="text-gray-500" />
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="bg-transparent text-gray-700 dark:text-gray-300 outline-none cursor-pointer text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="mtd">Month to date</option>
          <option value="ytd">Year to date</option>
        </select>
        <ChevronDown size={12} className="text-gray-400" />
      </div>

      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-gray-300 transition-colors">
        <MapPin size={14} className="text-gray-500" />
        <select className="bg-transparent text-gray-700 dark:text-gray-300 outline-none cursor-pointer text-sm">
          <option value="all">All Locations</option>
          <option value="tampa">Tampa, FL</option>
          <option value="orlando">Orlando, FL</option>
          <option value="jacksonville">Jacksonville, FL</option>
        </select>
        <ChevronDown size={12} className="text-gray-400" />
      </div>

      {onServiceTypeChange && (
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-gray-300 transition-colors">
          <Wrench size={14} className="text-gray-500" />
          <select
            value={serviceType}
            onChange={(e) => onServiceTypeChange(e.target.value)}
            className="bg-transparent text-gray-700 dark:text-gray-300 outline-none cursor-pointer text-sm"
          >
            <option value="all">All Services</option>
            <option value="residential_roofing">Residential Roofing</option>
            <option value="commercial_roofing">Commercial Roofing</option>
            <option value="roof_repair">Roof Repair</option>
            <option value="emergency_tarp">Emergency Tarp</option>
            <option value="siding">Siding</option>
            <option value="gutters">Gutters</option>
            <option value="solar">Solar</option>
          </select>
          <ChevronDown size={12} className="text-gray-400" />
        </div>
      )}

      {onChannelChange && (
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-gray-300 transition-colors">
          <Megaphone size={14} className="text-gray-500" />
          <select
            value={channel}
            onChange={(e) => onChannelChange(e.target.value)}
            className="bg-transparent text-gray-700 dark:text-gray-300 outline-none cursor-pointer text-sm"
          >
            <option value="all">All Channels</option>
            <option value="google_ads">Google Ads</option>
            <option value="meta_ads">Meta Ads</option>
            <option value="local_services_ads">Local Services Ads</option>
            <option value="referral">Referral</option>
            <option value="direct">Direct</option>
          </select>
          <ChevronDown size={12} className="text-gray-400" />
        </div>
      )}
    </div>
  );
};
