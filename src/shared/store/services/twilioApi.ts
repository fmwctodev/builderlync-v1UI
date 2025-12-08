import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface TwilioStatus {
  connected: boolean;
  accountSid?: string;
  phoneNumbers?: string[];
}

export interface TwilioConnectResponse {
  success: boolean;
  data: {
    authUrl: string;
  };
  message: string;
}

export const connectTwilio = async (accountSid?: string, authToken?: string): Promise<TwilioConnectResponse | TwilioResponse> => {
  if (accountSid && authToken) {
    // Direct connection with credentials
    const response = await axios.post<TwilioResponse>(
      `${API_BASE_URL}/twilio/connect`,
      { accountSid, authToken },
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  } else {
    // OAuth redirect flow
    const response = await axios.post<TwilioConnectResponse>(
      `${API_BASE_URL}/twilio/connect`,
      {},
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  }
};

export interface TwilioStatusResponse {
  success: boolean;
  data: TwilioStatus;
  message: string;
}

export const getTwilioStatus = async (): Promise<TwilioStatusResponse> => {
  const response = await axios.get<TwilioStatusResponse>(
    `${API_BASE_URL}/twilio/status`,
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export interface TwilioResponse {
  success: boolean;
  message: string;
}

export const disconnectTwilio = async (): Promise<TwilioResponse> => {
  const response = await axios.post<TwilioResponse>(
    `${API_BASE_URL}/twilio/disconnect`,
    {},
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export const getTwilioPhoneNumbers = async (): Promise<{ success: boolean; data?: string[] }> => {
  const response = await axios.get(`${API_BASE_URL}/twilio/phone-numbers`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const processTwilioCallback = async (accountSid: string, authToken: string): Promise<TwilioResponse> => {
  const response = await axios.post<TwilioResponse>(
    `${API_BASE_URL}/twilio/process-callback`,
    { accountSid, authToken },
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export interface AvailableNumber {
  phoneNumber: string;
  locality: string;
  region: string;
  postalCode: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
  };
}

export const getAvailableNumbers = async (areaCode?: string, country = 'US'): Promise<{ success: boolean; data?: AvailableNumber[]; message?: string }> => {
  try {
    const params = new URLSearchParams({ country });
    if (areaCode) params.append('areaCode', areaCode);
    
    const response = await axios.get(`${API_BASE_URL}/twilio/available-numbers?${params}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to search for available numbers'
    };
  }
};

export const purchaseNumber = async (phoneNumber: string): Promise<TwilioResponse> => {
  try {
    const response = await axios.post<TwilioResponse>(
      `${API_BASE_URL}/twilio/purchase-number`,
      { phoneNumber },
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  } catch (error: any) {
    console.log(`error ${JSON.stringify(error)}`);
    console.log(error.response?.data?.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to purchase number'
    };
  }
};

// A2P/10DLC APIs

export interface Brand {
  sid: string;
  status: string;
  brandType: string;
  dateCreated?: string;
}

export interface Campaign {
  sid: string;
  status: string;
  campaignType?: string;
  description?: string;
}

export const registerBrand = async (customerProfileBundleSid: string, a2pProfileBundleSid: string): Promise<{ success: boolean; data?: Brand; message?: string }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/twilio/brands`,
      { customerProfileBundleSid, a2pProfileBundleSid },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to register brand'
    };
  }
};

export const getBrands = async (): Promise<{ success: boolean; data?: Brand[]; message?: string }> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/twilio/brands`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get brands'
    };
  }
};

export const createCampaign = async (params: {
  brandSid: string;
  campaignType: string;
  description: string;
  messageSamples: string[];
  useCases: string[];
}): Promise<{ success: boolean; data?: Campaign; message?: string }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/twilio/campaigns`,
      params,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create campaign'
    };
  }
};

export const getCampaigns = async (brandSid?: string): Promise<{ success: boolean; data?: Campaign[]; message?: string }> => {
  try {
    const params = brandSid ? `?brandSid=${brandSid}` : '';
    const response = await axios.get(
      `${API_BASE_URL}/twilio/campaigns${params}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get campaigns'
    };
  }
};

export const assignNumberToCampaign = async (phoneNumberSid: string, campaignSid: string): Promise<{ success: boolean; data?: { sid: string; phoneNumberSid: string; campaignSid: string }; message?: string }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/twilio/assign-number`,
      { phoneNumberSid, campaignSid },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to assign number to campaign'
    };
  }
};