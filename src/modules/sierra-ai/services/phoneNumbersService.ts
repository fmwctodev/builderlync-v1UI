import { supabase } from '../lib/supabase';

export interface PhoneNumber {
  id: string;
  organization_id: string;
  user_id?: string;
  phone_number: string;
  friendly_name: string;
  twilio_sid?: string;
  phone_number_type: 'local' | 'toll-free' | 'mobile' | 'short-code';
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  status: 'active' | 'inactive';
  assigned_agent_id?: string;
  assigned_agent?: {
    id: string;
    name: string;
  };
  is_default: boolean;
  country_code: string;
  created_at: string;
  updated_at: string;
}

export interface TwilioPhoneNumber {
  sid: string;
  phoneNumber: string;
  friendlyName: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
  status: string;
  phoneNumberType: 'local' | 'toll-free' | 'mobile' | 'short-code';
}

export interface PhoneCapabilities {
  voice: boolean;
  sms: boolean;
  mms: boolean;
}

/**
 * Fetch organization phone numbers from database
 */
export async function fetchOrganizationPhoneNumbers(
  organizationId: string
): Promise<PhoneNumber[]> {
  const { data, error } = await supabase
    .from('phone_numbers')
    .select(`
      *,
      assigned_agent:ai_agents!phone_numbers_assigned_agent_id_fkey(id, name)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching phone numbers:', error);
    throw new Error('Failed to fetch phone numbers');
  }

  return data || [];
}

/**
 * Fetch phone numbers from Twilio via Edge Function
 */
export async function fetchTwilioPhoneNumbers(
  organizationId: string
): Promise<TwilioPhoneNumber[]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiUrl = `${supabaseUrl}/functions/v1/fetch-twilio-numbers`;

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ organizationId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch Twilio phone numbers');
  }

  const { phoneNumbers } = await response.json();
  return phoneNumbers;
}

/**
 * Import phone numbers from Twilio into database
 */
export async function importPhoneNumbers(
  organizationId: string,
  phoneNumbers: TwilioPhoneNumber[]
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const numbersToInsert = phoneNumbers.map((number) => ({
    organization_id: organizationId,
    user_id: user.id,
    phone_number: number.phoneNumber,
    friendly_name: number.friendlyName,
    twilio_sid: number.sid,
    phone_number_type: number.phoneNumberType,
    capabilities: number.capabilities,
    status: number.status === 'in-use' ? 'active' : 'inactive',
    is_default: false,
    country_code: 'US',
  }));

  const { error } = await supabase
    .from('phone_numbers')
    .insert(numbersToInsert);

  if (error) {
    console.error('Error importing phone numbers:', error);
    throw new Error('Failed to import phone numbers');
  }
}

/**
 * Assign phone number to an AI agent (exclusive assignment)
 */
export async function assignPhoneNumberToAgent(
  phoneNumberId: string,
  agentId: string
): Promise<void> {
  const { error } = await supabase
    .from('phone_numbers')
    .update({ assigned_agent_id: agentId })
    .eq('id', phoneNumberId);

  if (error) {
    console.error('Error assigning phone number:', error);
    throw new Error('Failed to assign phone number to agent');
  }

  // Also update the agent's phone_number field
  const { data: phoneNumber } = await supabase
    .from('phone_numbers')
    .select('phone_number')
    .eq('id', phoneNumberId)
    .single();

  if (phoneNumber) {
    await supabase
      .from('ai_agents')
      .update({ phone_number: phoneNumber.phone_number })
      .eq('id', agentId);
  }
}

/**
 * Unassign phone number from agent
 */
export async function unassignPhoneNumber(phoneNumberId: string): Promise<void> {
  // Get the phone number to find the agent
  const { data: phoneNumber } = await supabase
    .from('phone_numbers')
    .select('assigned_agent_id')
    .eq('id', phoneNumberId)
    .single();

  if (phoneNumber?.assigned_agent_id) {
    // Clear agent's phone_number field
    await supabase
      .from('ai_agents')
      .update({ phone_number: null })
      .eq('id', phoneNumber.assigned_agent_id);
  }

  // Unassign from phone_numbers table
  const { error } = await supabase
    .from('phone_numbers')
    .update({ assigned_agent_id: null })
    .eq('id', phoneNumberId);

  if (error) {
    console.error('Error unassigning phone number:', error);
    throw new Error('Failed to unassign phone number');
  }
}

/**
 * Update phone number friendly name
 */
export async function updatePhoneNumber(
  phoneNumberId: string,
  updates: Partial<Pick<PhoneNumber, 'friendly_name' | 'is_default'>>
): Promise<void> {
  const { error } = await supabase
    .from('phone_numbers')
    .update(updates)
    .eq('id', phoneNumberId);

  if (error) {
    console.error('Error updating phone number:', error);
    throw new Error('Failed to update phone number');
  }
}

/**
 * Delete phone number (only if not assigned to an agent)
 */
export async function deletePhoneNumber(phoneNumberId: string): Promise<void> {
  // Check if phone number is assigned
  const { data: phoneNumber, error: fetchError } = await supabase
    .from('phone_numbers')
    .select('assigned_agent_id')
    .eq('id', phoneNumberId)
    .single();

  if (fetchError) {
    throw new Error('Failed to fetch phone number');
  }

  if (phoneNumber.assigned_agent_id) {
    throw new Error('Cannot delete phone number that is assigned to an agent. Please unassign it first.');
  }

  const { error } = await supabase
    .from('phone_numbers')
    .delete()
    .eq('id', phoneNumberId);

  if (error) {
    console.error('Error deleting phone number:', error);
    throw new Error('Failed to delete phone number');
  }
}

/**
 * Check if Twilio integration is active for organization
 */
export async function checkTwilioIntegration(organizationId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('integration_connections')
    .select('id, status')
    .eq('organization_id', organizationId)
    .eq('integration_name', 'twilio')
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error checking Twilio integration:', error);
    return false;
  }

  return !!data;
}

/**
 * Get phone numbers available for assignment (not already assigned)
 */
export async function getAvailablePhoneNumbers(
  organizationId: string
): Promise<PhoneNumber[]> {
  const { data, error } = await supabase
    .from('phone_numbers')
    .select('*')
    .eq('organization_id', organizationId)
    .is('assigned_agent_id', null)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching available phone numbers:', error);
    throw new Error('Failed to fetch available phone numbers');
  }

  return data || [];
}

/**
 * Get phone number assigned to a specific agent
 */
export async function getAgentPhoneNumber(agentId: string): Promise<PhoneNumber | null> {
  const { data, error } = await supabase
    .from('phone_numbers')
    .select('*')
    .eq('assigned_agent_id', agentId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching agent phone number:', error);
    return null;
  }

  return data;
}
