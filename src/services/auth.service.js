import api from "./api";

const AuthService = {
  login: async (email, password) => {
    try {
      console.log("Attempting login with:", { email, password });
      const response = await api.post("/auth/login", { email, password });
      console.log("Login response:", response.data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error("Login error details:", error);
      throw error;
    }
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  validateToken: async () => {
    try {
      const response = await api.get("/auth/validate");
      return response.data;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  },

  createAdmin: async () => {
    const response = await api.post("/auth/create-admin");
    return response.data;
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  },
};

export default AuthService;
