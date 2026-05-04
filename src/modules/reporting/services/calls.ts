import { apiClient } from '@/shared/utils/api';

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
