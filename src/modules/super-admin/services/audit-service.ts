import { supabase, handleSupabaseError } from './supabase-client';
import { AuditEvent, AuditFilters } from '../types';

export const getAuditLog = async (filters?: AuditFilters, limit: number = 100): Promise<AuditEvent[]> => {
  try {
    let query = supabase
      .from('audit_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (filters?.actorType && filters.actorType !== 'all') {
      query = query.eq('actor_type', filters.actorType);
    }

    if (filters?.actionType && filters.actionType !== 'all') {
      query = query.eq('action', filters.actionType);
    }

    if (filters?.targetType && filters.targetType !== 'all') {
      query = query.eq('target_type', filters.targetType);
    }

    if (filters?.dateFrom) {
      query = query.gte('timestamp', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('timestamp', filters.dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(event => ({
      id: event.id,
      timestamp: event.timestamp,
      actorType: event.actor_type,
      actorId: event.actor_id,
      actorName: event.actor_name,
      action: event.action,
      targetType: event.target_type,
      targetId: event.target_id,
      targetName: event.target_name,
      metadata: event.metadata,
      ipAddress: event.ip_address,
    }));
  } catch (error) {
    console.error('Error fetching audit log:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const logAuditEvent = async (event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('audit_events')
      .insert({
        actor_type: event.actorType,
        actor_id: event.actorId,
        actor_name: event.actorName,
        action: event.action,
        target_type: event.targetType,
        target_id: event.targetId,
        target_name: event.targetName,
        metadata: event.metadata,
        ip_address: event.ipAddress,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};
