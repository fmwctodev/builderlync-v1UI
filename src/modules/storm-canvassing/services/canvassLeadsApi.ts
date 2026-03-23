import { supabase } from '../../../shared/lib/supabase';
import type { CanvassLead, CanvassAppointment, CanvassLeadStatus } from '../types';
import { getExistingReveal } from './contactRevealApi';

export interface LeadFilters {
  status?: CanvassLeadStatus;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export async function getLeads(
  organizationId: string,
  filters?: LeadFilters,
  limit: number = 50,
  offset: number = 0
): Promise<{ leads: CanvassLead[]; total: number }> {
  let query = supabase
    .from('canvass_leads')
    .select(`
      *,
      canvass_appointments(*)
    `, { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%,address.ilike.%${filters.search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }

  return {
    leads: (data || []).map((lead) => ({
      ...lead,
      appointments: lead.canvass_appointments || [],
    })),
    total: count || 0,
  };
}

export async function getLeadById(
  organizationId: string,
  leadId: string
): Promise<CanvassLead | null> {
  const { data, error } = await supabase
    .from('canvass_leads')
    .select(`
      *,
      canvass_appointments(*)
    `)
    .eq('organization_id', organizationId)
    .eq('id', leadId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch lead: ${error.message}`);
  }

  if (!data) return null;

  return {
    ...data,
    appointments: data.canvass_appointments || [],
  };
}

export async function createLeadFromDoor(
  organizationId: string,
  doorId: string,
  userId: string,
  overrideData?: {
    name?: string;
    phone?: string;
    email?: string;
    notes?: string;
    estimatedValue?: number;
    assignedTo?: string;
  }
): Promise<CanvassLead> {
  const { data: door, error: doorError } = await supabase
    .from('doors')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('id', doorId)
    .single();

  if (doorError || !door) {
    throw new Error('Door not found');
  }

  let contactName = overrideData?.name;
  let contactPhone = overrideData?.phone;
  let contactEmail = overrideData?.email;

  if (!contactName || !contactPhone) {
    const reveal = await getExistingReveal(organizationId, doorId);
    if (reveal) {
      contactName = contactName || reveal.name;
      contactPhone = contactPhone || reveal.phones?.[0];
      contactEmail = contactEmail || reveal.emails?.[0];
    }
  }

  const address = `${door.address1}${door.address2 ? ' ' + door.address2 : ''}, ${door.city}, ${door.state} ${door.zip}`;

  const { data, error } = await supabase
    .from('canvass_leads')
    .insert({
      organization_id: organizationId,
      door_id: doorId,
      source: 'CANVASSING',
      status: 'NEW',
      name: contactName,
      phone: contactPhone,
      email: contactEmail,
      address,
      notes: overrideData?.notes,
      estimated_value: overrideData?.estimatedValue,
      assigned_to: overrideData?.assignedTo,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create lead: ${error.message}`);
  }

  return data;
}

export async function updateLead(
  organizationId: string,
  leadId: string,
  updates: Partial<Pick<CanvassLead,
    'status' | 'name' | 'phone' | 'email' | 'notes' | 'estimated_value' | 'assigned_to' | 'lost_reason'
  >>
): Promise<CanvassLead> {
  const updateData: Record<string, unknown> = {};

  if (updates.status !== undefined) {
    updateData.status = updates.status;

    if (updates.status === 'CONTACTED') {
      updateData.contacted_at = new Date().toISOString();
    } else if (updates.status === 'SCHEDULED') {
      updateData.scheduled_at = new Date().toISOString();
    } else if (updates.status === 'WON') {
      updateData.won_at = new Date().toISOString();
    } else if (updates.status === 'LOST') {
      updateData.lost_at = new Date().toISOString();
      if (updates.lost_reason) {
        updateData.lost_reason = updates.lost_reason;
      }
    }
  }

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.estimated_value !== undefined) updateData.estimated_value = updates.estimated_value;
  if (updates.assigned_to !== undefined) updateData.assigned_to = updates.assigned_to;

  const { data, error } = await supabase
    .from('canvass_leads')
    .update(updateData)
    .eq('organization_id', organizationId)
    .eq('id', leadId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update lead: ${error.message}`);
  }

  return data;
}

export async function deleteLead(
  organizationId: string,
  leadId: string
): Promise<void> {
  const { error } = await supabase
    .from('canvass_leads')
    .delete()
    .eq('organization_id', organizationId)
    .eq('id', leadId);

  if (error) {
    throw new Error(`Failed to delete lead: ${error.message}`);
  }
}

export async function createAppointment(
  organizationId: string,
  leadId: string,
  appointmentData: {
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    locationText?: string;
    assignedTo?: string;
  },
  userId: string
): Promise<CanvassAppointment> {
  const { data, error } = await supabase
    .from('canvass_appointments')
    .insert({
      organization_id: organizationId,
      lead_id: leadId,
      title: appointmentData.title,
      description: appointmentData.description,
      start_at: appointmentData.startAt,
      end_at: appointmentData.endAt,
      location_text: appointmentData.locationText,
      assigned_to: appointmentData.assignedTo || userId,
      created_by: userId,
      status: 'scheduled',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create appointment: ${error.message}`);
  }

  await updateLead(organizationId, leadId, { status: 'SCHEDULED' });

  return data;
}

export async function getAppointments(
  organizationId: string,
  filters?: {
    leadId?: string;
    assignedTo?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }
): Promise<CanvassAppointment[]> {
  let query = supabase
    .from('canvass_appointments')
    .select('*')
    .eq('organization_id', organizationId)
    .order('start_at', { ascending: true });

  if (filters?.leadId) {
    query = query.eq('lead_id', filters.leadId);
  }

  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }

  if (filters?.dateFrom) {
    query = query.gte('start_at', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('start_at', filters.dateTo);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch appointments: ${error.message}`);
  }

  return data || [];
}

export async function updateAppointment(
  organizationId: string,
  appointmentId: string,
  updates: Partial<Pick<CanvassAppointment,
    'title' | 'description' | 'start_at' | 'end_at' | 'location_text' | 'status' | 'assigned_to'
  >>
): Promise<CanvassAppointment> {
  const { data, error } = await supabase
    .from('canvass_appointments')
    .update(updates)
    .eq('organization_id', organizationId)
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update appointment: ${error.message}`);
  }

  return data;
}

export async function deleteAppointment(
  organizationId: string,
  appointmentId: string
): Promise<void> {
  const { error } = await supabase
    .from('canvass_appointments')
    .delete()
    .eq('organization_id', organizationId)
    .eq('id', appointmentId);

  if (error) {
    throw new Error(`Failed to delete appointment: ${error.message}`);
  }
}

export async function getLeadStats(
  organizationId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{
  total: number;
  byStatus: Record<CanvassLeadStatus, number>;
  totalValue: number;
  appointmentsScheduled: number;
}> {
  let query = supabase
    .from('canvass_leads')
    .select('status, estimated_value')
    .eq('organization_id', organizationId);

  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo);
  }

  const { data: leads, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch lead stats: ${error.message}`);
  }

  const byStatus: Record<string, number> = {};
  let totalValue = 0;

  for (const lead of leads || []) {
    byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
    if (lead.estimated_value) {
      totalValue += Number(lead.estimated_value);
    }
  }

  let appointmentQuery = supabase
    .from('canvass_appointments')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  if (dateFrom) {
    appointmentQuery = appointmentQuery.gte('start_at', dateFrom);
  }

  if (dateTo) {
    appointmentQuery = appointmentQuery.lte('start_at', dateTo);
  }

  const { count: appointmentsCount } = await appointmentQuery;

  return {
    total: leads?.length || 0,
    byStatus: byStatus as Record<CanvassLeadStatus, number>,
    totalValue,
    appointmentsScheduled: appointmentsCount || 0,
  };
}
