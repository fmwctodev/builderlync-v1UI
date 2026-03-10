import {
  SuperAdminEmailDomain,
  AddEmailDomainRequest,
  SuperAdminSMTPConfig,
  CreateSMTPConfigRequest,
  SuperAdminEmailTemplate,
} from '../types/settings';

const DOMAIN_STORAGE_KEY = 'super_admin_email_domains';
const TEMPLATE_STORAGE_KEY = 'super_admin_email_templates';

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const readStorage = <T>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return [];
  }
};

const writeStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const nowIso = () => new Date().toISOString();
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api';
const getAuthToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token');

const apiRequest = async (path: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...(options.headers || {}),
    },
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `Request failed (${response.status})`);
  }

  return payload;
};

export async function getEmailDomains(): Promise<{
  success: boolean;
  data?: SuperAdminEmailDomain[];
  error?: string;
}> {
  try {
    const data = readStorage<SuperAdminEmailDomain>(DOMAIN_STORAGE_KEY);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addEmailDomain(
  request: AddEmailDomainRequest
): Promise<{ success: boolean; data?: SuperAdminEmailDomain; error?: string }> {
  try {
    const domains = readStorage<SuperAdminEmailDomain>(DOMAIN_STORAGE_KEY);
    const record: SuperAdminEmailDomain = {
      id: createId(),
      domain: request.domain,
      provider: request.provider,
      verification_status: 'pending',
      verification_token: Math.random().toString(36).slice(2),
      dkim_selector: null,
      dkim_public_key: null,
      dkim_verified: false,
      spf_verified: false,
      dmarc_verified: false,
      dns_records: [],
      is_default: domains.length === 0,
      verified_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    writeStorage(DOMAIN_STORAGE_KEY, [record, ...domains]);
    return { success: true, data: record };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyEmailDomain(
  domainId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const domains = readStorage<SuperAdminEmailDomain>(DOMAIN_STORAGE_KEY);
    const updated = domains.map((d) =>
      d.id === domainId
        ? { ...d, verification_status: 'verified' as const, verified_at: nowIso(), updated_at: nowIso() }
        : d
    );
    writeStorage(DOMAIN_STORAGE_KEY, updated);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSMTPConfigs(): Promise<{
  success: boolean;
  data?: SuperAdminSMTPConfig[];
  error?: string;
}> {
  try {
    const payload = await apiRequest('/smtp/settings', { method: 'GET' });
    if (!payload || Object.keys(payload).length === 0) {
      return { success: true, data: [] };
    }

    const mapped: SuperAdminSMTPConfig = {
      id: String(payload.id || 'smtp-default'),
      config_name: payload.from_name || 'SMTP Service',
      smtp_host: payload.host || '',
      smtp_port: Number(payload.port || 587),
      smtp_username: payload.user || '',
      smtp_password: payload.pass || '',
      use_tls: !Boolean(payload.secure),
      from_email: payload.from_email || '',
      from_name: payload.from_name || null,
      reply_to_email: null,
      is_active: true,
      daily_limit: 5000,
      sent_today: 0,
      last_reset_at: nowIso(),
      test_status: null,
      last_test_at: null,
      created_at: payload.created_at || nowIso(),
      updated_at: payload.updated_at || nowIso(),
    };

    return { success: true, data: [mapped] };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch SMTP settings' };
  }
}

export async function createSMTPConfig(
  payload: CreateSMTPConfigRequest | Record<string, any>
): Promise<{ success: boolean; data?: SuperAdminSMTPConfig; error?: string }> {
  try {
    const config_name = payload.config_name || payload.name;
    const smtp_username = payload.smtp_username || payload.smtp_user;
    const smtp_password = payload.smtp_password || payload.smtp_pass || '';
    const smtp_port = Number(payload.smtp_port);

    if (!config_name || !payload.smtp_host || !smtp_port || !payload.from_email) {
      return { success: false, error: 'Missing required SMTP fields' };
    }

    await apiRequest('/smtp/settings', {
      method: 'POST',
      body: JSON.stringify({
        host: payload.smtp_host,
        port: smtp_port,
        secure: String(!(payload.use_tls ?? true)),
        user: smtp_username || '',
        pass: smtp_password,
        fromName: payload.from_name || config_name,
        fromEmail: payload.from_email,
      }),
    });

    const refreshed = await getSMTPConfigs();
    if (!refreshed.success) {
      return { success: false, error: refreshed.error || 'Saved, but failed to refresh SMTP settings' };
    }
    return { success: true, data: refreshed.data?.[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function testSMTPConfig(
  configId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const smtpRes = await getSMTPConfigs();
    const active = smtpRes.data?.[0];
    if (!active) return { success: false, error: 'No SMTP configuration found' };

    await apiRequest('/smtp/test', {
      method: 'POST',
      body: JSON.stringify({
        host: active.smtp_host,
        port: active.smtp_port,
        secure: String(!active.use_tls),
        user: active.smtp_username,
        pass: active.smtp_password,
      }),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getEmailTemplates(): Promise<{
  success: boolean;
  data?: SuperAdminEmailTemplate[];
  error?: string;
}> {
  try {
    const data = readStorage<SuperAdminEmailTemplate>(TEMPLATE_STORAGE_KEY);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateEmailTemplate(
  id: string,
  updates: Partial<SuperAdminEmailTemplate>
): Promise<{ success: boolean; data?: SuperAdminEmailTemplate; error?: string }> {
  try {
    const templates = readStorage<SuperAdminEmailTemplate>(TEMPLATE_STORAGE_KEY);
    let updatedRecord: SuperAdminEmailTemplate | undefined;
    const next = templates.map((template) => {
      if (template.id !== id) return template;
      updatedRecord = { ...template, ...updates, updated_at: nowIso() };
      return updatedRecord;
    });
    writeStorage(TEMPLATE_STORAGE_KEY, next);
    return { success: true, data: updatedRecord };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
