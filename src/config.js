// API configuration
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// API endpoints
export const API_ENDPOINTS = {
  COMPANIES: "/api/companies",
  MEDICINES: "/pharmacist/medicines",
  PRESCRIPTIONS: "/pharmacist/prescriptions",
  ORDERS: "/pharmacist/orders",
  DASHBOARD: "/pharmacist/dashboard",
  DISTRIBUTORS: "/pharmacist/distributors",
  MEDICINE_CATEGORIES: "/pharmacist/medicine-categories",
  INVENTORY: "/pharmacist/inventory",
  REPORTS: "/pharmacist/reports",
  LOW_STOCK: "/pharmacist/medicines/low-stock",
  EXPIRED: "/pharmacist/medicines/expired",
  USERS: "/admin/users",
};

// Other configuration constants
export const APP_NAME = "Pharmacy Management System";
export const APP_VERSION = "1.0.0";

// UI configuration
export const UI_CONFIG = {
  ITEMS_PER_PAGE: 10,
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
};
