// Simple test script to check the API endpoints
const axios = require("axios");

const API_URL = "http://localhost:8081";
let token = null;

// Login to get a token
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@hospital.com",
      password: "admin123",
    });

    token = response.data.token;
    console.log("Login successful, token:", token);
    return token;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
}

// Test the admin/users endpoint
async function testGetUsers() {
  try {
    if (!token) {
      await login();
    }

    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Users API success:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get users failed:", error.response?.data || error.message);
    throw error;
  }
}

// Test the admin/test-auth endpoint
async function testAuth() {
  try {
    if (!token) {
      await login();
    }

    const response = await axios.get(`${API_URL}/admin/test-auth`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Auth test success:", response.data);
    return response.data;
  } catch (error) {
    console.error("Auth test failed:", error.response?.data || error.message);
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    await login();
    await testAuth();
    await testGetUsers();
  } catch (error) {
    console.error("Tests failed");
  }
}

runTests();
