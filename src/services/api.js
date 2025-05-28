import axios from "axios";

// Configure API URL based on environment - use proxy through Next.js to avoid CORS issues
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

console.log("API URL:", API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // Increased timeout to 15 seconds
});

// Add ping function to test server connectivity
api.pingServer = async () => {
  try {
    // Try different endpoints that might exist
    const possibleEndpoints = [
      `${API_URL}/actuator/health`,
      `${API_URL}/health`,
      `${API_URL}/doctor/dashboard`, // Doctor dashboard is more likely to exist
      `${API_URL}/doctor/rooms`, // This endpoint should exist in our application
      `${API_URL}/login`, // Login endpoint is usually available
    ];

    const startTime = Date.now();
    let response;

    // Try each endpoint until one works
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying health check at ${endpoint}...`);
        response = await axios.get(endpoint, {
          timeout: 3000, // Shorter timeout for health checks
        });
        console.log(`Health check successful at ${endpoint}`);
        break; // Stop checking if we got a successful response
      } catch (err) {
        console.log(`Health check failed at ${endpoint}: ${err.message}`);
        // Continue to next endpoint
      }
    }

    // If we found a working endpoint
    if (response && response.status >= 200 && response.status < 300) {
      const endTime = Date.now();
      return {
        isConnected: true,
        responseTime: endTime - startTime,
        status: response.data || "OK",
      };
    }

    // If all endpoints failed
    console.error("All health check endpoints failed");
    return {
      isConnected: false,
      error: "No health check endpoints available",
    };
  } catch (error) {
    console.error("Server connection test failed:", error.message);
    return {
      isConnected: false,
      error: error.message,
    };
  }
};

// Add a simple wrapper for checking if we should use real or mock data
api.shouldUseMockData = async () => {
  try {
    const health = await api.pingServer();
    return !health.isConnected;
  } catch (error) {
    return true; // Default to using mock data if health check fails
  }
};

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    // Log outgoing requests in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `API Request: ${config.method.toUpperCase()} ${config.baseURL}${
          config.url
        }`
      );
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `API Response: ${
          response.status
        } - ${response.config.method.toUpperCase()} ${response.config.url}`
      );
    }
    return response;
  },
  (error) => {
    // Detailed error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(
        `API Error: ${error.response.status} - ${
          error.response.data?.message || "Unknown error"
        } - ${error.config.method.toUpperCase()} ${error.config.url}`
      );

      if (error.response.status === 401) {
        // Handle unauthorized access (e.g., redirect to login)
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } else if (error.request) {
      // The request was made but no response was received
      // Network error or server not running
      console.error(
        `No response received: ${error.config.url}`,
        error.message || "Network Error"
      );

      // Log additional context about the error
      if (error.code === "ECONNABORTED") {
        console.error("Request timeout - the server took too long to respond");
      } else if (error.message.includes("Network Error")) {
        console.error(
          "Network error - please check if the backend server is running at:",
          API_URL
        );
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
