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

  // New method to upload profile image
  async uploadProfileImage(userId, imageFile) {
    try {
      const formData = new FormData();
      formData.append("imageFile", imageFile);

      // Note: The backend endpoint is under /admin.
      // In a real app, you might have a more general /users endpoint
      // or handle this based on user role.
      const response = await api.post(
        `/admin/users/${userId}/profile-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Assuming the backend returns the updated user or image URL
      const updatedUser = response.data; // Assuming response.data contains the user object or at least imageUrl

      // Update user data in localStorage with the new profile image URL
      const currentUserStr = localStorage.getItem("user");
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        const updatedCurrentUser = {
          ...currentUser,
          profileImage: updatedUser.imageUrl,
        };
        localStorage.setItem("user", JSON.stringify(updatedCurrentUser));
        console.log(
          "localStorage user profileImage updated:",
          updatedUser.imageUrl
        );
      }

      return updatedUser;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw error;
    }
  },
};

export default AuthService;
