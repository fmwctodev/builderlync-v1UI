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