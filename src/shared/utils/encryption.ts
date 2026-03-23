const SECRET_KEY = 'builderlynk-secret-key';

export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
  } catch {
    return '';
  }
};

export const decryptData = (encryptedData: string): any => {
  try {
    const jsonString = atob(encryptedData);
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
};

export const setEncryptedStorage = (key: string, data: any): void => {
  const encrypted = encryptData(data);
  localStorage.setItem(key, encrypted);
};

export const getEncryptedStorage = (key: string): any => {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;
  return decryptData(encrypted);
};