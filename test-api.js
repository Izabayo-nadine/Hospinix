const axios = require("axios");

// Test the backend connection
async function testBackend() {
  try {
    console.log(
      "Testing connection to backend at http://localhost:8080/auth/login..."
    );

    const response = await axios.post(
      "http://localhost:8080/auth/login",
      {
        email: "admin@hospital.com",
        password: "admin123",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Connection successful!");
    console.log("Response:", response.data);
    return true;
  } catch (error) {
    console.error("Connection failed:");
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server");
      console.error(error.message);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message);
    }
    return false;
  }
}

testBackend();
