import React from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { MarketingAccount, ChannelType } from '../../types/marketing';

const channelLabel: Record<ChannelType, string> = {
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  tiktok_ads: 'TikTok',
  microsoft_ads: 'Microsoft',
  local_services_ads: 'Local Services',
  youtube: 'YouTube',
  call_tracking: 'Call Tracking',
  gbp: 'Google Business',
  organic_social: 'Organic Social',
  direct: 'Direct',
  referral: 'Referral',
  email: 'Email',
  sms: 'SMS',
  unknown: 'Unknown',
};

const channelColor: Record<string, string> = {
  google_ads: 'bg-blue-500',
  meta_ads: 'bg-indigo-500',
  tiktok_ads: 'bg-gray-800',
  local_services_ads: 'bg-green-500',
  call_tracking: 'bg-orange-500',
  referral: 'bg-teal-500',
  default: 'bg-gray-400',
};

interface ChannelStatusWidgetProps {
  channels: MarketingAccount[];
  onConnect?: (channelId: string) => void;
}

export const ChannelStatusWidget: React.FC<ChannelStatusWidgetProps> = ({ channels, onConnect }) => {
  const fmtMoney = (n: number) => n > 0 ? `$${n.toLocaleString()}` : '—';

  return (
    <div className="space-y-2">
      {channels.map((ch) => (
        <div key={ch.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${ch.status === 'connected' ? 'bg-green-500' : ch.status === 'error' ? 'bg-red-500' : 'bg-gray-300'}`} />
          <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold shrink-0 ${channelColor[ch.channel] ?? channelColor.default}`}>
            {channelLabel[ch.channel]?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{channelLabel[ch.channel]}</span>
              <span className="text-xs text-gray-500 shrink-0">{ch.leads_mtd > 0 ? `${ch.leads_mtd} leads` : '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className="text-xs text-gray-400">{fmtMoney(ch.spend_mtd)} spent</span>
              {ch.issues.length > 0 && (
                <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <AlertCircle size={11} />
                  <span className="text-xs">{ch.issues.length} issue{ch.issues.length > 1 ? 's' : ''}</span>
                </div>
              )}
              {ch.status === 'disconnected' && onConnect && (
                <button
                  onClick={() => onConnect(ch.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
