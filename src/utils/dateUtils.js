/**
 * Format a date as 'yyyy-MM-ddTHH:mm:ss' for Spring Boot LocalDateTime parsing
 * @param {Date} date - The JavaScript Date object to format
 * @returns {string} Formatted date string
 */
export const formatDateForBackend = (date) => {
  if (!date) return null;

  // Ensure we're working with a Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  // Format as ISO string without milliseconds
  return dateObj.toISOString().split(".")[0];
};

/**
 * Format a date specifically for API queries in Java's LocalDateTime.parse() compatible format
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string for API queries (yyyy-MM-ddTHH:mm:ss format)
 */
export const formatDateForApiQuery = (date) => {
  if (!date) return null;

  // Ensure we're working with a Date object
  const dateObj = date instanceof Date ? date : new Date(date);

  // Format as ISO string without milliseconds and timezone
  const isoString = dateObj.toISOString();
  return isoString.substring(0, 19); // Keep only yyyy-MM-ddTHH:mm:ss part
};

/**
 * Format a date in a human-readable format for UI display
 * @param {string|Date} date - The date to format
 * @param {Object} options - Display options for toLocaleDateString
 * @returns {string} Formatted date string for display
 */
export const formatDateForDisplay = (date, options = {}) => {
  if (!date) return "N/A";

  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    // Default options
    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    };

    return dateObj.toLocaleDateString(undefined, defaultOptions);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Format a time for display in the UI
 * @param {string|Date} datetime - The date/time to format
 * @returns {string} Formatted time string (e.g., "3:30 PM")
 */
export const formatTimeForDisplay = (datetime) => {
  if (!datetime) return "N/A";

  try {
    const dateObj = datetime instanceof Date ? datetime : new Date(datetime);
    return dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid time";
  }
};

/**
 * Calculate age from date of birth
 * @param {string|Date} dateOfBirth - The date of birth
 * @returns {string|number} Age in years or "N/A" if invalid
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return "N/A";

  try {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  } catch (error) {
    console.error("Error calculating age:", error);
    return "N/A";
  }
};

/**
 * Format a date for display (exported as formatDate for compatibility)
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "Jan 31, 2023")
 */
export const formatDate = (date) => {
  if (!date) return "N/A";

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Format a time for display (exported as formatTime for compatibility)
 * @param {string|Date} datetime - The date/time to format
 * @returns {string} Formatted time string (e.g., "3:30 PM")
 */
export const formatTime = (datetime) => {
  if (!datetime) return "N/A";

  try {
    const dateObj = datetime instanceof Date ? datetime : new Date(datetime);
    return dateObj.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Invalid time";
  }
};
