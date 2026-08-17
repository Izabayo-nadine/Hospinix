import axios from "axios";
 
// Configure API URL based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
 
console.log("API URL:", API_URL);
 
// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});
 
// Add ping function to test server connectivity
api.pingServer = async () => {
  try {
    const possibleEndpoints = [
      `${API_URL}/actuator/health`,
      `${API_URL}/health`,
      `${API_URL}/doctor/dashboard`,
      `${API_URL}/doctor/rooms`,
      `${API_URL}/login`,
    ];
 
    const startTime = Date.now();
    let response;
 
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying health check at ${endpoint}...`);
        response = await axios.get(endpoint, { timeout: 3000 });
        console.log(`Health check successful at ${endpoint}`);
        break;
      } catch (err) {
        console.log(`Health check failed at ${endpoint}: ${err.message}`);
      }
    }
 
    if (response && response.status >= 200 && response.status < 300) {
      const endTime = Date.now();
      return {
        isConnected: true,
        responseTime: endTime - startTime,
        status: response.data || "OK",
      };
    }
 
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
 
// Check whether to use real or mock data
api.shouldUseMockData = async () => {
  try {
    const health = await api.pingServer();
    return !health.isConnected;
  } catch (error) {
    return true;
  }
};
 
// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    if (process.env.NODE_ENV === "development") {
      console.log(
        `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
      );
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);
 
// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `API Response: ${response.status} - ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
    }
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `API Error: ${error.response.status} - ${
          error.response.data?.message || "Unknown error"
        } - ${error.config?.method?.toUpperCase()} ${error.config?.url}`
      );
 
      if (error.response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } else if (error.request) {
      console.error(
        `No response received: ${error.config?.url}`,
        error.message || "Network Error"
      );
      if (error.code === "ECONNABORTED") {
        console.error("Request timeout - the server took too long to respond");
      } else if (error.message?.includes("Network Error")) {
        console.error(
          "Network error - please check if the backend server is running at:",
          API_URL
        );
      }
    } else {
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);
 
export default api;