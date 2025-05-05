/**
 * Formats API error responses for consistent display
 * @param {Error} error - The error from an API call
 * @param {string} defaultMessage - Default message if no specific error is available
 * @returns {string} Formatted error message
 */
export const formatApiError = (
  error,
  defaultMessage = "An unexpected error occurred"
) => {
  // Check if it's a network error or error is not an object
  if (!error || typeof error !== "object" || !error.response) {
    return "Network error: Could not connect to the server. Please check your connection and try again.";
  }

  // Extract error message from response
  const status = error.response.status || 0;
  const responseData = error.response.data || {};

  // Format based on status code
  let errorMessage = "";
  switch (status) {
    case 400:
      // Bad request - likely validation error
      errorMessage =
        responseData.message ||
        "Invalid data provided. Please check your inputs.";
      break;

    case 401:
    case 403:
      // Authentication/authorization errors
      errorMessage =
        responseData.message ||
        "You don't have permission to perform this action.";
      break;

    case 404:
      // Not found
      errorMessage =
        responseData.message || "The requested resource was not found.";
      break;

    case 500:
      // Server error
      errorMessage = `Server error: ${
        responseData.message ||
        "Something went wrong on our end. Please try again later."
      }`;
      break;

    default:
      // If there's a message in the response, use it
      if (responseData && responseData.message) {
        errorMessage = String(responseData.message);
      } else {
        // Fall back to default message with status code
        errorMessage = `Error ${status}: ${defaultMessage}`;
      }
  }

  // Ensure we're returning a string
  return typeof errorMessage === "string"
    ? errorMessage
    : String(defaultMessage);
};

/**
 * Handles frontend form validation errors
 * @param {Object} formData - The form data being validated
 * @param {Object} rules - Validation rules (field: validationFn)
 * @returns {Object} Object containing error messages keyed by field name
 */
export const validateForm = (formData, rules) => {
  const errors = {};

  Object.entries(rules).forEach(([field, validationFn]) => {
    try {
      const error = validationFn(formData[field], formData);

      // Only add to errors if there is a value and ensure it's a string
      if (error) {
        errors[field] = typeof error === "string" ? error : "Invalid input";
      }
    } catch (e) {
      console.error(`Error validating field ${field}:`, e);
      errors[field] = "Validation error";
    }
  });

  return errors;
};

/**
 * Common validation rules for reuse
 */
export const validationRules = {
  required: (value, errorMsg = "This field is required") =>
    !value || (typeof value === "string" && !value.trim())
      ? String(errorMsg)
      : null,

  email: (value) =>
    value && !/\S+@\S+\.\S+/.test(value)
      ? "Please enter a valid email address"
      : null,

  minLength: (min) => (value) =>
    value && value.length < min ? `Must be at least ${min} characters` : null,

  maxLength: (max) => (value) =>
    value && value.length > max
      ? `Must be no more than ${max} characters`
      : null,

  phoneNumber: (value) =>
    value &&
    !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value)
      ? "Please enter a valid phone number"
      : null,
};
