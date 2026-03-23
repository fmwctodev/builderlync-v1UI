import { supabase } from '../lib/supabase';

export interface AuditLogEvent {
  id: string;
  organization_id: string;
  user_id?: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AuditLogChange {
  id: string;
  audit_log_event_id: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface AuditLogEventWithChanges extends AuditLogEvent {
  changes?: AuditLogChange[];
}

export interface CreateAuditLogInput {
  event_type: string;
  entity_type: string;
  entity_id: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  changes?: Array<{
    field_name: string;
    old_value?: string;
    new_value?: string;
  }>;
}

export interface AuditLogFilters {
  event_type?: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const auditLogsApi = {
  async getAuditLogs(
    organizationId: string,
    filters?: AuditLogFilters
  ): Promise<AuditLogEventWithChanges[]> {
    let query = supabase
      .from('audit_log_events')
      .select(`
        *,
        changes:audit_log_changes(*)
      `)
      .eq('organization_id', organizationId);

    if (filters?.event_type) {
      query = query.eq('event_type', filters.event_type);
    }

    if (filters?.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }

    if (filters?.entity_id) {
      query = query.eq('entity_id', filters.entity_id);
    }

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 50) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return data || [];
  },

  async getAuditLog(eventId: string): Promise<AuditLogEventWithChanges | null> {
    const { data, error } = await supabase
      .from('audit_log_events')
      .select(`
        *,
        changes:audit_log_changes(*)
      `)
      .eq('id', eventId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching audit log:', error);
      throw new Error(`Failed to fetch audit log: ${error.message}`);
    }

    return data;
  },

  async getAuditLogsForEntity(
    organizationId: string,
    entityType: string,
    entityId: string
  ): Promise<AuditLogEventWithChanges[]> {
    const { data, error } = await supabase
      .from('audit_log_events')
      .select(`
        *,
        changes:audit_log_changes(*)
      `)
      .eq('organization_id', organizationId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching entity audit logs:', error);
      throw new Error(`Failed to fetch entity audit logs: ${error.message}`);
    }

    return data || [];
  },

  async getAuditLogsForUser(
    organizationId: string,
    userId: string,
    limit?: number
  ): Promise<AuditLogEventWithChanges[]> {
    let query = supabase
      .from('audit_log_events')
      .select(`
        *,
        changes:audit_log_changes(*)
      `)
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user audit logs:', error);
      throw new Error(`Failed to fetch user audit logs: ${error.message}`);
    }

    return data || [];
  },

  async createAuditLog(
    organizationId: string,
    input: CreateAuditLogInput
  ): Promise<AuditLogEvent> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: event, error: eventError } = await supabase
      .from('audit_log_events')
      .insert({
        organization_id: organizationId,
        user_id: user?.id,
        event_type: input.event_type,
        entity_type: input.entity_type,
        entity_id: input.entity_id,
        action: input.action,
        ip_address: input.ip_address,
        user_agent: input.user_agent,
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error creating audit log event:', eventError);
      throw new Error(`Failed to create audit log event: ${eventError.message}`);
    }

    if (input.changes && input.changes.length > 0) {
      const changes = input.changes.map((change) => ({
        audit_log_event_id: event.id,
        field_name: change.field_name,
        old_value: change.old_value,
        new_value: change.new_value,
      }));

      const { error: changesError } = await supabase
        .from('audit_log_changes')
        .insert(changes);

      if (changesError) {
        console.error('Error creating audit log changes:', changesError);
      }
    }

    return event;
  },

  async getAuditLogsByDateRange(
    organizationId: string,
    startDate: string,
    endDate: string
  ): Promise<AuditLogEventWithChanges[]> {
    const { data, error } = await supabase
      .from('audit_log_events')
      .select(`
        *,
        changes:audit_log_changes(*)
      `)
      .eq('organization_id', organizationId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit logs by date range:', error);
      throw new Error(`Failed to fetch audit logs by date range: ${error.message}`);
    }

    return data || [];
  },

  async getAuditLogStats(organizationId: string): Promise<{
    total: number;
    byEventType: Record<string, number>;
    byAction: Record<string, number>;
    byEntityType: Record<string, number>;
  }> {
    const { data: logs, error } = await supabase
      .from('audit_log_events')
      .select('event_type, action, entity_type')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching audit log stats:', error);
      throw new Error(`Failed to fetch audit log stats: ${error.message}`);
    }

    const stats = {
      total: logs?.length || 0,
      byEventType: {} as Record<string, number>,
      byAction: {} as Record<string, number>,
      byEntityType: {} as Record<string, number>,
    };

    logs?.forEach((log) => {
      stats.byEventType[log.event_type] =
        (stats.byEventType[log.event_type] || 0) + 1;
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      stats.byEntityType[log.entity_type] =
        (stats.byEntityType[log.entity_type] || 0) + 1;
    });

    return stats;
  },

  async searchAuditLogs(
    organizationId: string,
    searchTerm: string
  ): Promise<AuditLogEventWithChanges[]> {
    const { data, error } = await supabase
      .from('audit_log_events')
      .select(`
        *,
        changes:audit_log_changes(*)
      `)
      .eq('organization_id', organizationId)
      .or(
        `event_type.ilike.%${searchTerm}%,action.ilike.%${searchTerm}%,entity_type.ilike.%${searchTerm}%`
      )
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error searching audit logs:', error);
      throw new Error(`Failed to search audit logs: ${error.message}`);
    }

    return data || [];
  },
};
