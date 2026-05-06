import { apiClient } from '@/shared/utils/api';
import { isStagingMode } from '@/shared/utils/stagingAuth';

// Sample call logs for staging — covers inbound + outbound, completed +
// missed, plus a recording URL on a couple of entries so the recording
// player surface gets exercised.
const STAGING_CALL_LOGS: CallLog[] = [
  { id: 'call_demo_1', dateTime: '2026-05-05T16:08:00Z', contactName: 'Maria Davis', numberName: '+1 (555) 010-2031', direction: 'inbound', status: 'completed', duration: 218, recordingUrl: 'https://example.com/recording-demo-1.mp3' },
  { id: 'call_demo_2', dateTime: '2026-05-05T15:42:00Z', contactName: 'Tom Henderson', numberName: '+1 (555) 010-3199', direction: 'inbound', status: 'completed', duration: 134 },
  { id: 'call_demo_3', dateTime: '2026-05-05T14:21:00Z', contactName: 'Unknown', numberName: '+1 (555) 010-9912', direction: 'inbound', status: 'missed', duration: 0 },
  { id: 'call_demo_4', dateTime: '2026-05-05T13:48:00Z', contactName: 'Sam Chen', numberName: '+1 (555) 010-4422', direction: 'outbound', status: 'completed', duration: 92 },
  { id: 'call_demo_5', dateTime: '2026-05-05T11:32:00Z', contactName: 'Jess Walker', numberName: '+1 (555) 010-2031', direction: 'inbound', status: 'completed', duration: 412, recordingUrl: 'https://example.com/recording-demo-2.mp3' },
  { id: 'call_demo_6', dateTime: '2026-05-05T10:14:00Z', contactName: 'Patel Family', numberName: '+1 (555) 010-3199', direction: 'inbound', status: 'completed', duration: 167 },
  { id: 'call_demo_7', dateTime: '2026-05-05T09:02:00Z', contactName: 'Unknown', numberName: '+1 (555) 010-7720', direction: 'inbound', status: 'missed', duration: 0 },
  { id: 'call_demo_8', dateTime: '2026-05-04T17:18:00Z', contactName: 'Alex Smith', numberName: '+1 (555) 010-2031', direction: 'inbound', status: 'completed', duration: 305 },
  { id: 'call_demo_9', dateTime: '2026-05-04T15:50:00Z', contactName: 'Maria Davis', numberName: '+1 (555) 010-4422', direction: 'outbound', status: 'completed', duration: 78 },
  { id: 'call_demo_10', dateTime: '2026-05-04T13:25:00Z', contactName: 'Tom Henderson', numberName: '+1 (555) 010-2031', direction: 'inbound', status: 'completed', duration: 256 },
];

export interface CallLog {
  id: string;
  dateTime: string;
  contactName: string;
  numberName: string;
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'busy' | 'no-answer';
  duration: number;
  recordingUrl?: string;
}

export interface CallMetrics {
  totalCalls: number;
  completedCalls: number;
  missedCalls: number;
  inboundCalls: number;
  outboundCalls: number;
  averageDuration: number;
  totalDuration: number;
}

export async function getCallLogs(limit: number = 50): Promise<CallLog[]> {
  // Staging short-circuit: serve demo call logs without hitting Twilio.
  if (isStagingMode()) {
    return STAGING_CALL_LOGS.slice(0, limit);
  }

  try {
    const response = await apiClient.get<any>(`/twilio/calls?limit=${limit}`);
    const data = response.data || [];
    
    // Map backend response to frontend CallLog interface
    return data.map((call: any) => ({
      id: call.id || call.sid,
      dateTime: call.received_at || call.startTime || call.dateCreated || new Date().toISOString(),
      contactName: call.contact_name || call.from_number || 'Unknown',
      numberName: call.from_number || call.to_number || 'Unknown',
      direction: (call.direction?.toLowerCase().includes('inbound')) ? 'inbound' : 'outbound',
      status: (call.status === 'completed' || call.status === 'answered') ? 'completed' : 'missed',
      duration: parseInt(call.duration) || 0,
      recordingUrl: call.recording_url || call.recordingUrl
    }));
  } catch (error) {
    console.error('Failed to fetch call logs:', error);
    return [];
  }
}

export async function getCallMetrics(): Promise<CallMetrics> {
  const logs = await getCallLogs(100);
  
  const metrics: CallMetrics = {
    totalCalls: logs.length,
    completedCalls: logs.filter(l => l.status === 'completed').length,
    missedCalls: logs.filter(l => l.status === 'missed').length,
    inboundCalls: logs.filter(l => l.direction === 'inbound').length,
    outboundCalls: logs.filter(l => l.direction === 'outbound').length,
    averageDuration: logs.length > 0 ? logs.reduce((acc, curr) => acc + curr.duration, 0) / logs.length : 0,
    totalDuration: logs.reduce((acc, curr) => acc + curr.duration, 0)
  };
  
  return metrics;
}
