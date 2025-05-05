import api from "./api";

// Create a local beds state to persist changes
const localBedsState = [
  {
    id: "BED-001",
    wardName: "General Ward",
    roomNumber: "101",
    bedNumber: "A",
    status: "Occupied",
    patient: {
      id: "P-10032",
      name: "John Doe",
      age: 45,
      gender: "Male",
      admissionDate: "2023-11-25",
      diagnosis: "Pneumonia",
      doctor: "Dr. Sarah Mitchell",
    },
  },
  {
    id: "BED-002",
    wardName: "General Ward",
    roomNumber: "101",
    bedNumber: "B",
    status: "Occupied",
    patient: {
      id: "P-10045",
      name: "Mary Johnson",
      age: 32,
      gender: "Female",
      admissionDate: "2023-11-26",
      diagnosis: "Gastroenteritis",
      doctor: "Dr. Sarah Mitchell",
    },
  },
  {
    id: "BED-003",
    wardName: "General Ward",
    roomNumber: "102",
    bedNumber: "A",
    status: "Available",
    patient: null,
  },
  {
    id: "BED-004",
    wardName: "General Ward",
    roomNumber: "102",
    bedNumber: "B",
    status: "Maintenance",
    patient: null,
  },
  {
    id: "BED-005",
    wardName: "ICU",
    roomNumber: "201",
    bedNumber: "A",
    status: "Occupied",
    patient: {
      id: "P-10067",
      name: "Robert Williams",
      age: 58,
      gender: "Male",
      admissionDate: "2023-11-24",
      diagnosis: "Myocardial Infarction",
      doctor: "Dr. Sarah Mitchell",
    },
  },
  {
    id: "BED-006",
    wardName: "ICU",
    roomNumber: "201",
    bedNumber: "B",
    status: "Occupied",
    patient: {
      id: "P-10089",
      name: "Jennifer Brown",
      age: 27,
      gender: "Female",
      admissionDate: "2023-11-27",
      diagnosis: "Severe Asthma Attack",
      doctor: "Dr. James Wilson",
    },
  },
  {
    id: "BED-007",
    wardName: "ICU",
    roomNumber: "202",
    bedNumber: "A",
    status: "Available",
    patient: null,
  },
  {
    id: "BED-008",
    wardName: "Pediatric Ward",
    roomNumber: "301",
    bedNumber: "A",
    status: "Occupied",
    patient: {
      id: "P-10102",
      name: "Michael Davis",
      age: 9,
      gender: "Male",
      admissionDate: "2023-11-26",
      diagnosis: "Appendicitis",
      doctor: "Dr. Emily Rodriguez",
    },
  },
  {
    id: "BED-009",
    wardName: "Pediatric Ward",
    roomNumber: "301",
    bedNumber: "B",
    status: "Available",
    patient: null,
  },
  {
    id: "BED-010",
    wardName: "Maternity Ward",
    roomNumber: "401",
    bedNumber: "A",
    status: "Occupied",
    patient: {
      id: "P-10113",
      name: "Emily Wilson",
      age: 31,
      gender: "Female",
      admissionDate: "2023-11-27",
      diagnosis: "Labor & Delivery",
      doctor: "Dr. Lisa Johnson",
    },
  },
];

const DoctorService = {

  getDashboardStats: async () => {
    try {
      console.log("Fetching doctor dashboard stats");
      const response = await api.get("/doctor/dashboard");
      console.log("Dashboard stats received:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  getPatients: async (filters = {}) => {
    try {
      console.log("Fetching patients for doctor with filters:", filters);

      const { status, search } = filters;
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (search) params.append("search", search);

      const url = `/doctor/patients${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      console.log(`Making request to: ${url}`);

      try {
        const response = await api.get(url);
        console.log(
          `Received ${response.data.length} patients from the server`
        );

        // Ensure all returned patients have required fields
        const formattedPatients = response.data.map((patient) => ({
          ...patient,
          patientId:
            patient.patientId || `P-${Math.floor(Math.random() * 10000)}`,
          id:
            patient.id ||
            patient.patientId ||
            `P-${Math.floor(Math.random() * 10000)}`,
          mock: false,
        }));

        return formattedPatients;
      } catch (apiError) {
        console.warn(
          `API error when fetching patients: ${apiError.message}. Using mock data.`
        );

        // Create mock patients list
        const mockPatients = [
          {
            id: "P-10001",
            patientId: "P-10001",
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1985-05-15",
            gender: "Male",
            email: "john.doe@example.com",
            phoneNumber: "123-456-7890",
            address: "123 Main St",
            bloodGroup: "O+",
            mock: true,
          },
          {
            id: "P-10002",
            patientId: "P-10002",
            firstName: "Jane",
            lastName: "Smith",
            dateOfBirth: "1990-08-21",
            gender: "Female",
            email: "jane.smith@example.com",
            phoneNumber: "234-567-8901",
            address: "456 Elm St",
            bloodGroup: "A-",
            mock: true,
          },
          {
            id: "P-10003",
            patientId: "P-10003",
            firstName: "Michael",
            lastName: "Johnson",
            dateOfBirth: "1978-12-03",
            gender: "Male",
            email: "michael.j@example.com",
            phoneNumber: "345-678-9012",
            address: "789 Oak St",
            bloodGroup: "B+",
            mock: true,
          },
        ];

        console.log(`Returning ${mockPatients.length} mock patients`);
        return mockPatients;
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      if (error.response) {
        console.error("Server response error:", error.response.data);
      }
      throw error;
    }
  },
  getTodayAppointments: async (doctorId) => {
    const response = await api.get("/doctor/appointments/today", {
      params: { doctorId },
    });
    return response.data;
  },

  getAppointments: async (filters = {}) => {
    try {
      const { status, patientId, startDate, endDate } = filters;
      const params = new URLSearchParams();

      // Add non-date parameters
      if (status) params.append("status", status);
      if (patientId) params.append("patientId", patientId);

      // Format dates properly if provided
      if (startDate) {
        params.append("startDate", startDate);
      }

      if (endDate) {
        params.append("endDate", endDate);
      }

      console.log(
        `Fetching appointments with params: ${
          params.toString() || "no parameters"
        }`
      );

      const response = await api.get(
        `/doctor/appointments?${params.toString()}`
      );

      console.log("Appointments API response:", response.data);

      if (!Array.isArray(response.data)) {
        console.error("Expected array of appointments but got:", response.data);
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      if (error.response) {
        console.error("Server response error:", error.response.data);
      }
      throw error;
    }
  },

  completeAppointment: async (id, notes) => {
    const response = await api.put(`/doctor/appointments/${id}/complete`, {
      notes,
    });
    return response.data;
  },


  getPatientsFromAppointments: async () => {
    const res = await api.get("/doctor/patients/with-appointments");
    return res.data;
  },
  


  createPrescription: async (prescriptionData) => {
    try {
      console.log("Original prescription data:", prescriptionData);

      // Ensure patientId is correctly formatted for the backend
      // The backend expects a Patient entity, not just an ID
      if (prescriptionData.patientId && !prescriptionData.patient) {
        prescriptionData.patient = { id: prescriptionData.patientId };
        console.log(
          "Added patient object with ID:",
          prescriptionData.patientId
        );
      }

      // Check if we have an appointmentId and add the appointment reference if needed
      if (prescriptionData.appointmentId && !prescriptionData.appointment) {
        prescriptionData.appointment = { id: prescriptionData.appointmentId };
        console.log(
          "Added appointment reference with ID:",
          prescriptionData.appointmentId
        );
      }

      // Make sure these fields are explicitly included
      const dataToSend = {
        ...prescriptionData,
        medication: prescriptionData.medication || "",
        dosage: prescriptionData.dosage || "",
        frequency: prescriptionData.frequency || "",
        duration: prescriptionData.duration || "",
        instructions: prescriptionData.instructions || "",
        notes: prescriptionData.notes || "",
      };

      console.log("Formatted prescription data for API:", dataToSend);

      const response = await api.post("/doctor/prescriptions", dataToSend);
      console.log("API response for create prescription:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in createPrescription API call:", error);
      if (error.response) {
        console.error("Server error response:", error.response.data);
        console.error("Status code:", error.response.status);
        console.error("Headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  },

  getPrescriptions: async (filters = {}) => {
    try {
      const { status, patientId, startDate, endDate } = filters;
      const params = new URLSearchParams();

      if (status) params.append("status", status);
      if (patientId) params.append("patientId", patientId);

      // Format dates properly for the backend
      if (startDate) {
        if (startDate instanceof Date) {
          params.append("startDate", startDate.toISOString().split("T")[0]);
        } else {
          params.append("startDate", startDate);
        }
      }

      if (endDate) {
        if (endDate instanceof Date) {
          params.append("endDate", endDate.toISOString().split("T")[0]);
        } else {
          params.append("endDate", endDate);
        }
      }

      console.log(
        `Fetching prescriptions with params: ${
          params.toString() || "no params"
        }`
      );

      const response = await api.get(
        `/doctor/prescriptions?${params.toString()}`
      );

      console.log(
        `Received ${response.data.length} prescriptions:`,
        response.data
      );

      // Make sure we're handling the data correctly by logging the first item
      if (response.data.length > 0) {
        console.log("Sample prescription data:", response.data[0]);
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      throw error;
    }
  },

  // New method to update an existing prescription
  updatePrescription: async (id, prescriptionData) => {
    try {
      console.log(
        `Updating prescription ID ${id} with data:`,
        prescriptionData
      );

      // Ensure patient object is properly formatted if needed
      if (prescriptionData.patientId && !prescriptionData.patient) {
        prescriptionData.patient = { id: prescriptionData.patientId };
      }

      // Make sure all required fields are included
      const dataToSend = {
        ...prescriptionData,
        medication: prescriptionData.medication || "",
        dosage: prescriptionData.dosage || "",
        frequency: prescriptionData.frequency || "",
        status: prescriptionData.status || "ACTIVE",
      };

      const response = await api.put(`/doctor/prescriptions/${id}`, dataToSend);
      console.log("Update prescription response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating prescription ${id}:`, error);
      throw error;
    }
  },

  // New method to get a single prescription by ID
  getPrescriptionById: async (id) => {
    try {
      console.log(`Fetching prescription with ID ${id}`);
      const response = await api.get(`/doctor/prescriptions/${id}`);
      console.log("Prescription details response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching prescription ${id}:`, error);
      throw error;
    }
  },

  // Method to discontinue a prescription
  discontinuePrescription: async (id) => {
    try {
      console.log(`Discontinuing prescription ID ${id}`);
      const response = await api.put(`/doctor/prescriptions/${id}/discontinue`);
      console.log("Discontinue prescription response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error discontinuing prescription ${id}:`, error);
      throw error;
    }
  },

  // Method to get hospital beds
  getBeds: async (filters = {}) => {
    try {
      const { ward, status, search } = filters;
      const params = new URLSearchParams();

      if (ward) params.append("ward", ward);
      if (status) params.append("status", status);
      if (search) params.append("search", search);

      console.log(
        `Fetching beds with params: ${params.toString() || "no params"}`
      );

      // Send request to the backend API
      const response = await api.get(`/doctor/beds?${params.toString()}`);

      // Format the response data to match the expected structure in the frontend
      const formattedBeds = response.data.map((bed) => ({
        id: bed.bedId,
        wardName: bed.wardName,
        roomNumber: bed.roomNumber,
        bedNumber: bed.bedNumber,
        status: bed.status,
        patient: bed.patient
          ? {
              id: bed.patient.patientId,
              name: `${bed.patient.firstName} ${bed.patient.lastName}`,
              age: calculateAge(bed.patient.dateOfBirth),
              gender: bed.patient.gender,
              admissionDate: bed.admissionDate,
              diagnosis: bed.diagnosis,
              doctor: bed.doctor
                ? `Dr. ${bed.doctor.firstName} ${bed.doctor.lastName}`
                : "Not assigned",
            }
          : null,
      }));

      console.log(
        `Successfully loaded ${formattedBeds.length} beds from database`
      );
      return formattedBeds;
    } catch (error) {
      console.error("Error fetching beds from database:", error);
      throw error; // Rethrow to handle in the component
    }
  },

  // Method to update bed status
  updateBedStatus: async (bedId, status) => {
    try {
      console.log(`Updating bed ${bedId} to status: ${status}`);

      const response = await api.put(`/doctor/beds/${bedId}/status`, {
        status,
      });
      console.log(`Bed status updated successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating bed status:`, error);
      throw error; // Rethrow to handle in the component
    }
  },

  // Method to assign patient to bed
  assignPatientToBed: async (bedId, patientId) => {
    try {
      console.log(`Assigning patient ${patientId} to bed: ${bedId}`);

      // Check if we should use mock data first
      const useMockData = await api.shouldUseMockData();
      if (useMockData) {
        console.warn("API health check indicates we should use mock data");

        // Get patient data
        let patientData;
        try {
          // Call our own service method for patient data (which handles mock fallback)
          patientData = await DoctorService.getPatientById(patientId);
          console.log(
            "Retrieved patient data for bed assignment:",
            patientData
          );
        } catch (err) {
          console.warn(
            "Failed to get patient data, using basic mock data:",
            err
          );
          // Create mock patient if we can't get real data
          patientData = {
            patientId: patientId,
            firstName: "Mock",
            lastName: "Patient",
            dateOfBirth: "1990-01-01",
            gender: "Not Specified",
            mock: true,
          };
        }

        // Find the bed in local state and update it
        const bedIndex = localBedsState.findIndex((bed) => bed.id === bedId);
        if (bedIndex >= 0) {
          localBedsState[bedIndex].status = "Occupied";
          localBedsState[bedIndex].patient = {
            id: patientData.patientId || patientId,
            name: `${patientData.firstName || "Unknown"} ${
              patientData.lastName || "Patient"
            }`,
            age: calculateAge(patientData.dateOfBirth) || 30,
            gender: patientData.gender || "Not Specified",
            admissionDate: new Date().toISOString().split("T")[0],
            diagnosis: "Under evaluation",
            doctor: "Dr. Mock Doctor",
          };
          localBedsState[bedIndex].mock = true;

          console.log(
            `Patient ${patientId} assigned to bed ${bedId} in mock data (health check)`
          );
          return {
            success: true,
            message: `Patient assigned to bed ${bedId} (mock)`,
            mock: true,
          };
        } else {
          throw new Error(`Bed ${bedId} not found in mock data`);
        }
      }

      try {
        const response = await api.put(`/doctor/beds/${bedId}/assign`, {
          patientId,
        });
        console.log(
          `Patient assigned to bed successfully via API:`,
          response.data
        );
        return response.data;
      } catch (apiError) {
        console.warn(
          `API error when assigning patient: ${apiError.message}. Using mock data.`
        );

        // Get patient data
        let patientData;
        try {
          // Call our own service method for patient data (which handles mock fallback)
          patientData = await DoctorService.getPatientById(patientId);
          console.log(
            "Retrieved patient data for bed assignment:",
            patientData
          );
        } catch (err) {
          console.warn(
            "Failed to get patient data, using basic mock data:",
            err
          );
          // Create mock patient if we can't get real data
          patientData = {
            patientId: patientId,
            firstName: "Mock",
            lastName: "Patient",
            dateOfBirth: "1990-01-01",
            gender: "Not Specified",
            mock: true,
          };
        }

        // Find the bed in local state and update it
        const bedIndex = localBedsState.findIndex((bed) => bed.id === bedId);
        if (bedIndex >= 0) {
          localBedsState[bedIndex].status = "Occupied";
          localBedsState[bedIndex].patient = {
            id: patientData.patientId || patientId,
            name: `${patientData.firstName || "Unknown"} ${
              patientData.lastName || "Patient"
            }`,
            age: calculateAge(patientData.dateOfBirth) || 30,
            gender: patientData.gender || "Not Specified",
            admissionDate: new Date().toISOString().split("T")[0],
            diagnosis: "Under evaluation",
            doctor: "Dr. Mock Doctor",
          };
          localBedsState[bedIndex].mock = true;

          console.log(
            `Patient ${patientId} assigned to bed ${bedId} in mock data`
          );
          return {
            success: true,
            message: `Patient assigned to bed ${bedId} (mock)`,
            mock: true,
          };
        } else {
          throw new Error(`Bed ${bedId} not found in mock data`);
        }
      }
    } catch (error) {
      console.error(`Error assigning patient to bed:`, error);
      throw error;
    }
  },

  // Method to discharge patient from bed
  dischargePatient: async (bedId) => {
    try {
      console.log(`Discharging patient from bed: ${bedId}`);

      const response = await api.put(`/doctor/beds/${bedId}/discharge`);
      console.log(`Patient discharged successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error discharging patient:`, error);
      throw error; // Rethrow to handle in the component
    }
  },

  // Method to get rooms data
  getRooms: async (filters = {}) => {
    try {
      const { ward, type, status, search } = filters;
      const params = new URLSearchParams();

      if (ward) params.append("ward", ward);
      if (type) params.append("type", type);
      if (status) params.append("status", status);
      if (search) params.append("search", search);

      console.log(
        `Fetching rooms with params: ${params.toString() || "no params"}`
      );

      try {
        // First attempt to get from backend API
        const response = await api.get(`/doctor/rooms?${params.toString()}`);
        console.log("Room data from API:", response.data);
        return response.data;
      } catch (error) {
        // If backend API fails, use local mock data
        console.warn(
          "Failed to fetch from API, using mock room data instead",
          error
        );

        // Return hardcoded rooms (same as in the page component)
        return [
          {
            id: "RM-101",
            number: "101",
            name: "General Ward Room 1",
            ward: "General Ward",
            type: "Standard",
            capacity: 2,
            occupancy: 2,
            status: "Full",
            features: ["Oxygen Supply", "Call Button", "Television"],
            notes: "Regular cleaning scheduled for Friday",
          },
          {
            id: "RM-102",
            number: "102",
            name: "General Ward Room 2",
            ward: "General Ward",
            type: "Standard",
            capacity: 2,
            occupancy: 1,
            status: "Partially Occupied",
            features: ["Oxygen Supply", "Call Button", "Television"],
            notes: "",
          },
          // ... more room data ...
        ];
      }
    } catch (error) {
      console.error("Error in getRooms:", error);
      throw error;
    }
  },

  // Method to add a new room
  addRoom: async (roomData) => {
    try {
      console.log("Adding new room:", roomData);

      // Make sure features is always an array
      if (!roomData.features) {
        roomData.features = [];
      }

      try {
        const response = await api.post("/doctor/rooms", roomData);
        console.log("Successfully added new room:", response.data);
        return response.data;
      } catch (apiError) {
        console.warn(`API error when adding room: ${apiError.message}`);

        // If the real API fails, create a mock response
        // Generate a room ID if one doesn't exist
        if (!roomData.number) {
          roomData.number = Math.floor(Math.random() * 1000).toString();
        }

        return {
          ...roomData,
          roomId: `RM-${roomData.number}`,
          id: `RM-${roomData.number}`,
          occupancy: 0,
          status: "Available",
          mock: true,
        };
      }
    } catch (error) {
      console.error("Error adding room:", error);
      throw error;
    }
  },

  // Method to update room details
  updateRoom: async (roomId, roomData) => {
    try {
      console.log(`Updating room ${roomId}:`, roomData);

      // Make sure features is always an array
      if (!roomData.features) {
        roomData.features = [];
      }

      try {
        const response = await api.put(`/doctor/rooms/${roomId}`, roomData);
        console.log(`Successfully updated room ${roomId}:`, response.data);
        return response.data;
      } catch (apiError) {
        console.warn(`API error when updating room: ${apiError.message}`);
        throw apiError; // Let the component handle the error
      }
    } catch (error) {
      console.error(`Error updating room ${roomId}:`, error);
      throw error;
    }
  },

  // Method to update room status
  updateRoomStatus: async (roomId, status) => {
    try {
      console.log(`Updating room ${roomId} to status: ${status}`);
      const response = await api.put(`/doctor/rooms/${roomId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating room status:`, error);
      throw error; // Let the component handle the error
    }
  },

  // Method to get a single room by ID
  getRoomById: async (roomId) => {
    try {
      console.log(`Fetching room with ID ${roomId}`);

      // Send the roomId as is - the backend now handles both formats
      try {
        // Attempt to fetch data from the server
        const response = await api.get(`/doctor/rooms/${roomId}`);
        console.log("Room details response:", response.data);

        // Ensure features is always at least an empty array
        if (!response.data.features) {
          response.data.features = [];
        }
        return response.data;
      } catch (apiError) {
        console.warn(`API error when fetching room: ${apiError.message}`);
        throw apiError; // Throw the error to let the component handle it
      }
    } catch (error) {
      console.error(`Error in getRoomById for ${roomId}:`, error);

      // Create fallback room as last resort - only for development
      if (process.env.NODE_ENV === "development") {
        console.warn("Using mock data as fallback in development mode");
        const roomNumber = roomId.replace("RM-", "");
        const fallbackRoom = {
          id: `RM-${roomNumber}`,
          roomId: `RM-${roomNumber}`,
          number: roomNumber,
          name: `Room ${roomNumber}`,
          ward: "General Ward",
          type: "Standard",
          capacity: 2,
          occupancy: 0,
          status: "Available",
          features: ["Oxygen Supply", "Call Button"],
          notes: "Auto-generated room due to API error",
          mock: true, // Flag to indicate this is mock data
        };
        console.log("Returning fallback room:", fallbackRoom);
        return fallbackRoom;
      }

      throw error; // In production, propagate the error
    }
  },

  // Method to assign a patient to a room
  assignPatientToRoom: async (patientId, roomId) => {
    try {
      console.log(`Assigning patient ${patientId} to room ${roomId}`);

      // Use numeric ID for API call (remove "RM-" prefix if present)
      const numericRoomId = roomId.toString().replace("RM-", "");

      const response = await api.post(`/doctor/rooms/${numericRoomId}/assign`, {
        patientId,
      });

      console.log(`Patient assigned successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error assigning patient to room:`, error);
      throw error; // Rethrow to handle in the component
    }
  },

  getPatientById: async (id) => {
    try {
      console.log(`Fetching patient with ID ${id}`);

      // Format ID properly if needed
      const formattedId = id.toString().startsWith("P-") ? id : `P-${id}`;

      try {
        // Try to get patient from API
        const response = await api.get(`/doctor/patients/${formattedId}`);
        console.log("Patient details response:", response.data);
        return response.data;
      } catch (apiError) {
        console.warn(
          `API error when fetching patient: ${apiError.message}. Using mock data.`
        );

        // Create mock patient
        const mockPatient = {
          id: formattedId,
          patientId: formattedId,
          firstName: "Mock",
          lastName: "Patient",
          dateOfBirth: "1990-01-01",
          gender: "Not Specified",
          email: "mock@example.com",
          phoneNumber: "123-456-7890",
          address: "123 Mock St",
          bloodGroup: "O+",
          mock: true,
        };

        console.log("Using mock patient data:", mockPatient);
        return mockPatient;
      }
    } catch (error) {
      console.error(`Error in getPatientById for ${id}:`, error);
      throw error;
    }
  },

  // Method to discharge patient from room
  dischargePatientFromRoom: async (roomId) => {
    try {
      console.log(`Discharging patient from room: ${roomId}`);

      // Ensure roomId is numeric
      const numericRoomId =
        typeof roomId === "string"
          ? parseInt(roomId.replace("room-", ""), 10)
          : roomId;

      const response = await api.put(
        `/doctor/rooms/${numericRoomId}/discharge`
      );
      console.log(`Patient discharged from room successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error discharging patient from room:`, error);
      throw error; // Rethrow to handle in the component
    }
  },

  // Add the updateAppointment method
  updateAppointment: async (id, appointmentData) => {
    try {
      console.log(`Updating appointment ${id} with data:`, appointmentData);
      const response = await api.put(
        `/doctor/appointments/${id}`,
        appointmentData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);

      // Throw a more descriptive error for better debugging
      if (error.response) {
        const message =
          error.response.data?.message || error.response.statusText;
        throw new Error(`Failed to update appointment: ${message}`);
      }
      throw error;
    }
  },
};

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};

export default DoctorService;
