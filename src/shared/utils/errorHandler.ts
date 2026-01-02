/**
 * Extracts error message from API error response
 * Checks for message, error, and falls back to default
 */
export const getErrorMessage = (error: any, defaultMessage: string = 'An error occurred'): string => {
  return error.response?.data?.message || 
         error.response?.data?.error || 
         error.message || 
         defaultMessage;
};
