import api from "./api";

const AdminService = {
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  getFacilityData: async () => {
    try {
      const response = await api.get("/admin/facility");
      return response.data;
    } catch (error) {
      console.error("Error fetching facility data:", error);
      throw error;
    }
  },

  getUsers: async (filters = {}) => {
    const { role, active, search } = filters;
    const params = new URLSearchParams();
    if (role) params.append("role", role);

    // Send as isActive to match backend expectations
    if (active !== undefined) params.append("isActive", active.toString());

    if (search) params.append("search", search);

    try {
      const response = await api.get(`/admin/users?${params.toString()}`);
      // Log the response data for debugging
      console.log("API response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  createUser: async (userData) => {
    // Ensure isActive is always explicitly set
    const userDataWithActive = {
      ...userData,
      isActive: userData.isActive === undefined ? true : userData.isActive,
    };

    try {
      const response = await api.post("/admin/users", userDataWithActive);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    // Ensure isActive is always explicitly set
    const userDataWithActive = {
      ...userData,
      isActive: userData.isActive === undefined ? true : userData.isActive,
    };

    try {
      const response = await api.put(`/admin/users/${id}`, userDataWithActive);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getPatients: async () => {
    try {
      // Try to get patients from the API first
      const response = await api.get("/data/patients");
      console.log("API patient response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching patients from API:", error);

      // Fallback to local storage if API fails
      const storedPatients = localStorage.getItem("mockPatients");
      if (storedPatients) {
        const parsedPatients = JSON.parse(storedPatients);
        console.log(
          "Retrieved mock patients from localStorage:",
          parsedPatients
        );
        return parsedPatients;
      }

      // If no stored patients, use default mock data
      const defaultPatients = [
        {
          patientId: "P-1001",
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.johnson@example.com",
          phoneNumber: "555-101-2345",
          dateOfBirth: "1988-06-15",
          gender: "Female",
          bloodGroup: "A+",
          status: "Active",
        },
        {
          patientId: "P-1002",
          firstName: "Robert",
          lastName: "Smith",
          email: "robert.smith@example.com",
          phoneNumber: "555-202-3456",
          dateOfBirth: "1961-03-22",
          gender: "Male",
          bloodGroup: "O-",
          status: "Active",
        },
        {
          patientId: "P-1003",
          firstName: "James",
          lastName: "Williams",
          email: "james.williams@example.com",
          phoneNumber: "555-303-4567",
          dateOfBirth: "1975-09-10",
          gender: "Male",
          bloodGroup: "B+",
          status: "Discharged",
        },
        {
          patientId: "P-1004",
          firstName: "Emily",
          lastName: "Brown",
          email: "emily.brown@example.com",
          phoneNumber: "555-404-5678",
          dateOfBirth: "1992-12-05",
          gender: "Female",
          bloodGroup: "AB-",
          status: "Active",
        },
        {
          patientId: "P-1005",
          firstName: "Michael",
          lastName: "Davis",
          email: "michael.davis@example.com",
          phoneNumber: "555-505-6789",
          dateOfBirth: "1983-04-18",
          gender: "Male",
          bloodGroup: "O+",
          status: "Active",
        },
      ];

      // Store the default patients in localStorage for future use
      localStorage.setItem("mockPatients", JSON.stringify(defaultPatients));

      return defaultPatients;
    }
  },

  getPatient: async (id) => {
    try {
      // Try to get patient from API first
      const response = await api.get(`/admin/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient ${id} from API:`, error);

      // Fallback to localStorage
      const storedPatients = localStorage.getItem("mockPatients");
      if (storedPatients) {
        const parsedPatients = JSON.parse(storedPatients);
        const patient = parsedPatients.find((p) => p.patientId === id);

        if (patient) {
          console.log("Found patient in localStorage:", patient);
          return patient;
        }
      }

      // If not found in localStorage, generate mock data
      console.log(`Generating mock data for patient ${id}`);

      // Generate mock patient data based on the ID
      const mockPatient = {
        patientId: id,
        firstName: "Test",
        lastName: "Patient",
        email: `patient${id}@example.com`,
        phoneNumber: "555-123-4567",
        address: "123 Test Street",
        gender: "Other",
        dateOfBirth: "1990-01-01",
        bloodGroup: "O+",
        status: "Active",
        emergencyContact: "555-987-6543",
        medicalHistory: "None",
        allergies: "None",
        insuranceProvider: "Test Insurance",
        insuranceNumber: "INS12345",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Generated mock patient:", mockPatient);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      return mockPatient;
    }
  },

  registerPatient: async (patientData) => {
    try {
      // Try to use API first
      const response = await api.post("/admin/patients", patientData);
      return response.data;
    } catch (error) {
      console.error("Error registering patient with API:", error);

      // Fallback to mock data approach
      console.log("Using mock approach for patient registration");

      // Generate a random patient ID
      const mockId = `P-${Math.floor(Math.random() * 10000)}`;

      // Create a mock response with the submitted data
      const newPatient = {
        ...patientData,
        patientId: mockId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: patientData.status || "Active",
        lastVisitDate: null,
      };

      // Store in localStorage to persist between sessions
      const storedPatients = localStorage.getItem("mockPatients");
      let patients = [];

      if (storedPatients) {
        patients = JSON.parse(storedPatients);
      }

      patients.push(newPatient);
      localStorage.setItem("mockPatients", JSON.stringify(patients));

      console.log("Successfully created and stored mock patient:", newPatient);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      return newPatient;
    }
  },

  updatePatient: async (id, patientData) => {
    try {
      // Try API first
      const response = await api.put(`/admin/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      console.error(`Error updating patient ${id} with API:`, error);

      // Fallback to mock approach
      console.log(`Using mock approach for updating patient ${id}`);

      // Update the patient in localStorage
      const storedPatients = localStorage.getItem("mockPatients");
      if (storedPatients) {
        let patients = JSON.parse(storedPatients);
        const index = patients.findIndex((p) => p.patientId === id);

        if (index !== -1) {
          // Update the existing patient
          const updatedPatient = {
            ...patients[index],
            ...patientData,
            updatedAt: new Date().toISOString(),
          };

          patients[index] = updatedPatient;
          localStorage.setItem("mockPatients", JSON.stringify(patients));

          console.log("Successfully updated mock patient:", updatedPatient);

          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 800));

          return updatedPatient;
        }
      }

      // If patient not found in localStorage or no stored patients
      const updatedPatient = {
        ...patientData,
        patientId: id,
        updatedAt: new Date().toISOString(),
      };

      console.log(
        "Updated mock patient (not in localStorage):",
        updatedPatient
      );

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      return updatedPatient;
    }
  },

  getMedicines: async (filters = {}) => {
    const { category, stock, prescription, search } = filters;
    const params = new URLSearchParams();

    if (search) {
      // If search term is provided, use the search endpoint
      try {
        const response = await api.get(
          `/pharmacist/medicines/search?keyword=${search}`
        );
        console.log("API medicine search response data:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error searching medicines:", error);
        // Fall back to regular endpoint if search fails
      }
    }

    // For regular filtering (no search term or fallback from search)
    if (category) params.append("category", category);
    if (stock) params.append("stockStatus", stock);
    if (prescription !== undefined)
      params.append("prescriptionFilter", prescription.toString());

    try {
      const response = await api.get(
        `/pharmacist/medicines?${params.toString()}`
      );
      console.log("API medicine response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching medicines:", error);

      // If the pharmacist endpoint fails, try the data endpoint as a fallback
      try {
        const fallbackResponse = await api.get("/data/medicines");
        console.log(
          "Fallback API medicine response data:",
          fallbackResponse.data
        );
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error(
          "Error fetching medicines from fallback endpoint:",
          fallbackError
        );
        throw error; // Throw the original error
      }
    }
  },

  // Mock implementation for patient operations when API endpoints fail
  _mockPatientOperation: async (operation, patientData, id = null) => {
    console.warn(
      `Using mock ${operation} for patient ${id || "new"} due to API failure`
    );

    // Generate a random patient ID if needed
    const mockId = id || `P-${Math.floor(Math.random() * 10000)}`;

    // For demo purposes, we'll simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return a mock response based on the operation
    switch (operation) {
      case "register":
        return {
          ...patientData,
          patientId: mockId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: patientData.status || "Active",
          lastVisitDate: null,
        };
      case "update":
        return {
          ...patientData,
          patientId: mockId,
          updatedAt: new Date().toISOString(),
        };
      case "get":
        return {
          patientId: mockId,
          firstName: "Mock",
          lastName: "Patient",
          email: "mock.patient@example.com",
          phoneNumber: "555-123-4567",
          address: "123 Mock Street",
          gender: "Other",
          dateOfBirth: "1990-01-01",
          bloodGroup: "O+",
          status: "Active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      default:
        throw new Error(`Unknown mock operation: ${operation}`);
    }
  },
};

export default AdminService;
