

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
  const { vapiApi } = await import('./vapiApi');
  const response = await vapiApi.getPhoneNumbers();
  return response.data || [];
}

/**
 * Fetch phone numbers from Twilio via backend API
 */
export async function fetchTwilioPhoneNumbers(
  organizationId: string
): Promise<TwilioPhoneNumber[]> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/twilio/phone-numbers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch Twilio phone numbers');
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Import phone numbers from Twilio into database
 */
export async function importPhoneNumbers(
  organizationId: string,
  phoneNumbers: TwilioPhoneNumber[]
): Promise<void> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/ai-agents/phone-numbers/import`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phoneNumbers }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to import phone numbers');
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

/**
 * Assign phone number to an AI agent
 */
export async function assignPhoneNumberToAgent(
  phoneNumberId: string,
  agentId: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ai-agents/phone-numbers/assign`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ phone_number_id: phoneNumberId, agent_id: agentId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Error assigning phone number:', errorData);
    throw new Error(errorData.error || 'Failed to assign phone number to agent');
  }
}

/**
 * Unassign phone number from agent
 */
export async function unassignPhoneNumber(phoneNumberId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ai-agents/phone-numbers/unassign`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ phone_number_id: phoneNumberId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Error unassigning phone number:', errorData);
    throw new Error(errorData.error || 'Failed to unassign phone number');
  }
}

/**
 * Update phone number friendly name
 * Note: Currently no backend endpoint for updating friendly name only. 
 * Use client-side caching or wait for backend implementation.
 */
export async function updatePhoneNumber(
  phoneNumberId: string,
  updates: Partial<Pick<PhoneNumber, 'friendly_name' | 'is_default'>>
): Promise<void> {
  // TODO: Implement backend endpoint for updating phone number details
  console.warn('updatePhoneNumber not fully implemented on backend');
}

/**
 * Delete phone number
 */
export async function deletePhoneNumber(phoneNumberId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ai-agents/phone-numbers/${phoneNumberId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Error deleting phone number:', errorData);
    throw new Error(errorData.error || 'Failed to delete phone number');
  }
}

/**
 * Get phone numbers available for assignment
 */
export async function getAvailablePhoneNumbers(
  organizationId: string
): Promise<PhoneNumber[]> {
  try {
    const phoneNumbers = await fetchOrganizationPhoneNumbers(organizationId);
    return phoneNumbers.filter(p => !p.assigned_agent_id && p.status === 'active');
  } catch (error) {
    console.error('Error fetching available phone numbers:', error);
    return [];
  }
}

/**
 * Get phone number assigned to a specific agent
 */
export async function getAgentPhoneNumber(agentId: string): Promise<PhoneNumber | null> {
  try {
    // We assume organization ID is available in context or we fetch all and find
    // Ideally backend gives us this lookup
    // For now, return null as fallback or try to find in list
    // This function usage should be checked.
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if Twilio integration is configured for the organization
 */
export async function checkTwilioIntegration(organizationId: string): Promise<boolean> {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/twilio/status?organization_id=${organizationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const responseData = await response.json();
      return !!responseData.data?.connected;
    }

    return false;
  } catch (error) {
    console.error('Error checking Twilio integration:', error);
    return false;
  }
}

