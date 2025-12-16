import { supabase, getUserId } from '../lib/supabase';

export interface ContactData {
  first_name: string;
  last_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  source?: string;
}

export interface OpportunityData {
  title: string;
  contact_id: string;
  pipeline_id?: string;
  stage_id?: string;
  value?: number;
  description?: string;
}

export interface AppointmentData {
  contact_id: string;
  appointment_type: string;
  start_time: string;
  end_time: string;
  location?: string;
  notes?: string;
}

export class CRMAdapter {
  async createContact(data: ContactData): Promise<string> {
    const userId = await getUserId();

    const existingContact = data.phone
      ? await this.findContactByPhone(data.phone)
      : null;

    if (existingContact) {
      return existingContact.id;
    }

    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        ...data,
        source: data.source || 'sierra_ai'
      })
      .select('id')
      .single();

    if (error) throw error;
    return contact.id;
  }

  async findContactByPhone(phone: string): Promise<{ id: string } | null> {
    const userId = await getUserId();

    const cleanPhone = phone.replace(/\D/g, '');

    const { data, error } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', userId)
      .ilike('phone', `%${cleanPhone}%`)
      .maybeSingle();

    if (error) {
      console.error('Error finding contact by phone:', error);
      return null;
    }

    return data;
  }

  async updateContact(contactId: string, updates: Partial<ContactData>): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', contactId);

    if (error) throw error;
  }

  async createOpportunity(data: OpportunityData): Promise<string> {
    const userId = await getUserId();

    let pipelineId = data.pipeline_id;
    let stageId = data.stage_id;

    if (!pipelineId) {
      const defaultPipeline = await this.getDefaultPipeline();
      pipelineId = defaultPipeline?.id;
      stageId = defaultPipeline?.stages?.[0]?.id;
    }

    const { data: opportunity, error } = await supabase
      .from('opportunities')
      .insert({
        user_id: userId,
        contact_id: data.contact_id,
        pipeline_id: pipelineId,
        stage_id: stageId,
        title: data.title,
        value: data.value || 0,
        description: data.description,
        source: 'sierra_ai'
      })
      .select('id')
      .single();

    if (error) throw error;
    return opportunity.id;
  }

  async createAppointment(data: AppointmentData): Promise<string> {
    const userId = await getUserId();

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        user_id: userId,
        contact_id: data.contact_id,
        appointment_type: data.appointment_type,
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location || 'on_site',
        notes: data.notes,
        status: 'scheduled'
      })
      .select('id')
      .single();

    if (error) throw error;
    return appointment.id;
  }

  async logActivity(contactId: string, activityType: string, description: string): Promise<void> {
    const userId = await getUserId();

    await supabase
      .from('activities')
      .insert({
        user_id: userId,
        contact_id: contactId,
        activity_type: activityType,
        description,
        created_at: new Date().toISOString()
      });
  }

  private async getDefaultPipeline(): Promise<any> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('pipelines')
      .select('id, stages:pipeline_stages(id)')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching default pipeline:', error);
    }

    return data;
  }

  async getContact(contactId: string): Promise<any> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async searchContacts(query: string): Promise<any[]> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  }
}

export const crmAdapter = new CRMAdapter();
