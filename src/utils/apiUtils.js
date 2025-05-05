/**
 * Utility functions for API interactions
 */

/**
 * Handles API errors and returns a user-friendly message
 * @param {Error} error - The error object from the API call
 * @returns {string} - A user-friendly error message
 */
export const getErrorMessage = (error) => {
  // Handle network errors
  if (!error.response) {
    if (error.isNetworkError) {
      return (
        error.message ||
        "Unable to connect to the server. Please check your internet connection or try again later."
      );
    }
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    return "Network error. Please check your connection and try again.";
  }

  // Handle server response errors
  const status = error.response.status;
  const message = error.response.data?.message || error.message;

  switch (status) {
    case 400:
      return `Bad request: ${message}`;
    case 401:
      return "You are not authorized. Please log in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 500:
      return "Server error. Please try again later or contact support.";
    default:
      return `Error (${status}): ${message}`;
  }
};

/**
 * Formats a date string to a more readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Truncates a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} length - The maximum length
 * @returns {string} - Truncated string
 */
export const truncateString = (str, length = 50) => {
  if (!str) return "";
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
};

/**
 * Formats a phone number to a standard format
 * @param {string} phone - The phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return "N/A";

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(
      3,
      6
    )}-${cleaned.substring(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(
      4,
      7
    )}-${cleaned.substring(7)}`;
  } else {
    return phone; // Return original if we can't format it
  }
};
