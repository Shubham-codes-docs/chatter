import { AxiosError } from 'axios';
import { type ApiError } from '../types/api.types';

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError && error.response) {
    const apiError = error.response.data as ApiError;

    if (apiError.error) {
      return apiError.error;
    }

    // HTTP status errors
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Invalid credentials. Please try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'This resource already exists.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  // Network error (no response from server)
  if (error instanceof AxiosError && error.request) {
    return 'Unable to connect to server. Please check your internet connection.';
  }

  // Unknown error
  return 'An unexpected error occurred. Please try again.';
};
