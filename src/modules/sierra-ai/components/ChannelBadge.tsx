import React from 'react';
import { Phone, MessageSquare, MessageCircle, Globe } from 'lucide-react';

interface ChannelBadgeProps {
  channel: 'voice' | 'sms' | 'mms' | 'webchat';
  size?: 'sm' | 'md';
}

export function ChannelBadge({ channel, size = 'sm' }: ChannelBadgeProps) {
  const config = {
    voice: {
      label: 'Voice',
      icon: Phone,
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
    sms: {
      label: 'SMS',
      icon: MessageSquare,
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    mms: {
      label: 'MMS',
      icon: MessageCircle,
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
    webchat: {
      label: 'Webchat',
      icon: Globe,
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    },
  };

  const { label, icon: Icon, color } = config[channel];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${color} ${sizeClasses[size]}`}>
      <Icon size={iconSizes[size]} />
      {label}
    </span>
  );
}
