# Frontend Integration Guide

This document provides instructions for integrating the frontend with the backend API.

## Prerequisites

1. Backend server running on `http://localhost:8080`
2. Frontend running on `http://localhost:3000`

## Setup API Communication

### 1. Create API Service

Create an `api.js` file in your services folder:

```javascript
import axios from "axios";

const API_URL = "http://localhost:8080";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Create Authentication Service

Create an `auth.service.js` file:

```javascript
import api from "./api";

const AuthService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
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
};

export default AuthService;
```

### 3. Create Role-Based Services

#### Admin Service

```javascript
import api from "./api";

const AdminService = {
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  getUsers: async (filters = {}) => {
    const { role, active, search } = filters;
    const params = new URLSearchParams();
    if (role) params.append("role", role);
    if (active !== undefined) params.append("active", active);
    if (search) params.append("search", search);

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post("/admin/users", userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};

export default AdminService;
```

#### Doctor Service

```javascript
import api from "./api";

const DoctorService = {
  getDashboardStats: async () => {
    const response = await api.get("/doctor/dashboard");
    return response.data;
  },

  getPatients: async (filters = {}) => {
    const { status, search } = filters;
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (search) params.append("search", search);

    const response = await api.get(`/doctor/patients?${params.toString()}`);
    return response.data;
  },

  getAppointments: async (filters = {}) => {
    const { status, patientId, startDate, endDate } = filters;
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (patientId) params.append("patientId", patientId);
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    const response = await api.get(`/doctor/appointments?${params.toString()}`);
    return response.data;
  },

  completeAppointment: async (id, notes) => {
    const response = await api.put(`/doctor/appointments/${id}/complete`, {
      notes,
    });
    return response.data;
  },

  createPrescription: async (prescriptionData) => {
    const response = await api.post("/doctor/prescriptions", prescriptionData);
    return response.data;
  },

  getPrescriptions: async (filters = {}) => {
    const { status, patientId, startDate, endDate } = filters;
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (patientId) params.append("patientId", patientId);
    if (startDate)
      params.append("startDate", startDate.toISOString().split("T")[0]);
    if (endDate) params.append("endDate", endDate.toISOString().split("T")[0]);

    const response = await api.get(
      `/doctor/prescriptions?${params.toString()}`
    );
    return response.data;
  },
};

export default DoctorService;
```

#### Similarly create services for Pharmacist and Receptionist

### 4. Create Dashboard Data Service

```javascript
import api from "./api";

const DataService = {
  getDashboardStats: async () => {
    const response = await api.get("/data/dashboard-stats");
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get("/data/users");
    return response.data;
  },

  getAllPatients: async () => {
    const response = await api.get("/data/patients");
    return response.data;
  },

  getAllDoctors: async () => {
    const response = await api.get("/data/doctors");
    return response.data;
  },

  getAccountTypes: async () => {
    const response = await api.get("/data/account-types");
    return response.data;
  },
};

export default DataService;
```

## Implement Authentication

### Login Component Example

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await AuthService.login(email, password);
      // Redirect based on role
      switch (data.role) {
        case "ADMIN":
          navigate("/admin/dashboard");
          break;
        case "DOCTOR":
          navigate("/doctor/dashboard");
          break;
        case "PHARMACIST":
          navigate("/pharmacist/dashboard");
          break;
        case "RECEPTIONIST":
          navigate("/receptionist/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h1>Login</h1>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
```

## Route Protection

Create a protected route component:

```jsx
import { Navigate, Outlet } from "react-router-dom";
import AuthService from "../services/auth.service";

const ProtectedRoute = ({ allowedRoles }) => {
  const user = AuthService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard based on role
    switch (user.role) {
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "DOCTOR":
        return <Navigate to="/doctor/dashboard" replace />;
      case "PHARMACIST":
        return <Navigate to="/pharmacist/dashboard" replace />;
      case "RECEPTIONIST":
        return <Navigate to="/receptionist/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
```

## Routes Configuration

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import DoctorDashboard from "./pages/doctor/Dashboard";
import PharmacistDashboard from "./pages/pharmacist/Dashboard";
import ReceptionistDashboard from "./pages/receptionist/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        {/* Add other admin routes */}
      </Route>

      {/* Doctor Routes */}
      <Route element={<ProtectedRoute allowedRoles={["DOCTOR"]} />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        {/* Add other doctor routes */}
      </Route>

      {/* Pharmacist Routes */}
      <Route element={<ProtectedRoute allowedRoles={["PHARMACIST"]} />}>
        <Route path="/pharmacist/dashboard" element={<PharmacistDashboard />} />
        {/* Add other pharmacist routes */}
      </Route>

      {/* Receptionist Routes */}
      <Route element={<ProtectedRoute allowedRoles={["RECEPTIONIST"]} />}>
        <Route
          path="/receptionist/dashboard"
          element={<ReceptionistDashboard />}
        />
        {/* Add other receptionist routes */}
      </Route>

      {/* Redirect to login if no match */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
```

## Sample Dashboard Implementation

```jsx
import { useEffect, useState } from "react";
import AdminService from "../../services/admin.service";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await AdminService.getDashboardStats();
        setStats(response);
      } catch (err) {
        setError("Failed to load dashboard statistics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!stats) return null;

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Doctors</h3>
          <p className="stat-value">{stats.totalDoctors}</p>
        </div>

        <div className="stat-card">
          <h3>Pharmacists</h3>
          <p className="stat-value">{stats.totalPharmacists}</p>
        </div>

        <div className="stat-card">
          <h3>Receptionists</h3>
          <p className="stat-value">{stats.totalReceptionists}</p>
        </div>

        <div className="stat-card">
          <h3>Patients</h3>
          <p className="stat-value">{stats.totalPatients}</p>
        </div>

        <div className="stat-card">
          <h3>Appointments</h3>
          <p className="stat-value">{stats.totalAppointments}</p>
        </div>

        <div className="stat-card">
          <h3>Medicines</h3>
          <p className="stat-value">{stats.totalMedicines}</p>
        </div>
      </div>

      {/* Add more dashboard elements as needed */}
    </div>
  );
};

export default AdminDashboard;
```

## Default Login Credentials

After starting the application for the first time, the following accounts are available for login:

1. **Admin**

   - Email: admin@hospital.com
   - Password: admin123

2. **Doctor**

   - Email: doctor@hospital.com
   - Password: doctor123

3. **Pharmacist**

   - Email: pharmacist@hospital.com
   - Password: pharmacist123

4. **Receptionist**
   - Email: receptionist@hospital.com
   - Password: receptionist123

## Integration Tips

1. Always check for authentication before making API calls
2. Handle errors gracefully with appropriate user feedback
3. Use loading states to enhance user experience
4. Implement logout functionality to clear the token and user data
5. Validate forms before submission to reduce backend validation errors
6. Use proper error handling for all API calls
7. Implement token refresh mechanism for long sessions
