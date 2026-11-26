// Turns an Axios error into a message a person can understand.
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ERR_NETWORK') {
    return 'Cannot reach the server. Please check that the backend is running.';
  }
  if (error?.code === 'ECONNABORTED') return 'The request took too long. Please try again.';
  return fallback;
};

// Field-level messages from the backend: { email: '...', phone: '...' }
export const getFieldErrors = (error) => error?.response?.data?.errors || {};