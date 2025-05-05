/**
 * Safely converts values to string for rendering in React
 * Used to prevent "Objects are not valid as a React child" errors
 *
 * @param {any} value - The value to be safely converted to string
 * @param {string} fallback - Fallback value if conversion fails
 * @returns {string} A string representation of the value
 */
export const safeString = (value, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "object") {
    try {
      // If it's an object, try to stringify it
      return JSON.stringify(value);
    } catch (e) {
      console.error("Failed to stringify object:", e);
      return fallback;
    }
  }

  // For any other type, convert to string safely
  try {
    return String(value);
  } catch (e) {
    console.error("Failed to convert value to string:", e);
    return fallback;
  }
};

/**
 * Logs a value with type information for debugging
 *
 * @param {string} label - Label for the value being logged
 * @param {any} value - The value to log with type information
 */
export const debugLog = (label, value) => {
  if (process.env.NODE_ENV !== "development") {
    return; // Only log in development
  }

  const type = typeof value;
  const isArray = Array.isArray(value);
  const isNull = value === null;
  const isUndefined = value === undefined;

  console.group(`DEBUG: ${label}`);
  console.log("Value:", value);
  console.log(
    `Type: ${
      isNull ? "null" : isUndefined ? "undefined" : isArray ? "array" : type
    }`
  );

  if (type === "object" && !isNull && !isUndefined) {
    console.log("Keys:", Object.keys(value));
  }

  console.groupEnd();
};

/**
 * Wraps a component with error boundary logging
 * Use this to identify which component is causing rendering errors
 *
 * @param {string} componentName - Name of the component for identification
 * @param {Function} renderFn - The original render function
 * @returns {any} The rendered component or error message
 */
export const safeRender = (componentName, renderFn) => {
  try {
    return renderFn();
  } catch (error) {
    console.error(`Render error in ${componentName}:`, error);
    return (
      <div className="p-3 bg-red-100 text-red-700 rounded">
        Error rendering {componentName}. See console for details.
      </div>
    );
  }
};
