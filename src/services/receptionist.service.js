import api from "./api";

const ReceptionistService = {
  
  getDashboardStats: async () => {
    const response = await api.get("/receptionist/dashboard");
    return response.data;
  },

  getTodayAppointments: async () => {
    const response = await api.get("/receptionist/between");
    console.log("data from  reception/appointments: "+response.data)
    return response.data;
  },

  getAppointments: async (filters = {}) => {
    try {
      const { status, doctorId, patientId, startDate, endDate } = filters;
      const params = new URLSearchParams();

      // Add non-date parameters
      if (status) params.append("status", status);
      if (doctorId) params.append("doctorId", doctorId);
      if (patientId) params.append("patientId", patientId);

      // Format dates properly if provided
      if (startDate) {
        // Format date to ISO string without milliseconds and timezone
        const formattedStartDate = new Date(startDate)
          .toISOString()
          .replace(/\.\d+Z$/, "");
        params.append("startDate", formattedStartDate);
      }

      if (endDate) {
        const formattedEndDate = new Date(endDate)
          .toISOString()
          .replace(/\.\d+Z$/, "");
        params.append("endDate", formattedEndDate);
      }

      console.log(
        `Fetching appointments with params: ${
          params.toString() || "no parameters"
        }`
      );

      const response = await api.get(
        `/receptionist/appointments?${params.toString()}`
      );
    console.log("data from  reception/appointments: "+response.data)
      return response.data;
    } catch (error) {
      console.error("Error in getAppointments API call:", error);
      throw error;
    }
  },

  scheduleAppointment: async (appointmentData) => {
    const response = await api.post(
      "/receptionist/appointments",
      appointmentData
    );
    return response.data;
  },

  updateAppointment: async (id, appointmentData) => {
    try {
      console.log(`Updating appointment ${id} with data:`, appointmentData);

      // Special handling for status-only updates
      if (Object.keys(appointmentData).length === 1 && appointmentData.status) {
        console.log(
          `Performing status-only update to ${appointmentData.status}`
        );
        return await api.put(`/receptionist/appointments/${id}/status`, {
          status: appointmentData.status,
        });
      }

      // Regular update for multiple fields
      const response = await api.put(
        `/receptionist/appointments/${id}`,
        appointmentData
      );

      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  },

  cancelAppointment: async (id) => {
    const response = await api.put(`/receptionist/appointments/${id}/cancel`);
    return response.data;
  },

  registerPatient: async (patientData) => {
    try {
      // Log the data being sent to the API for debugging
      console.log("Sending patient data to API:", patientData);

      const response = await api.post("/receptionist/patients", patientData);
      console.log("API response:", response.data);

      return response.data;
    } catch (error) {
      console.error("Error in registerPatient API call:", error);
      throw error;
    }
  },

  updatePatient: async (id, patientData) => {
    try {
      console.log(`Updating patient with ID: ${id}`, patientData);

      // Check if id is a string starting with 'PAT-' - it's a patient ID string
      let response;
      if (typeof id === "string" && id.startsWith("PAT-")) {
        console.log(`Using patientId endpoint for patient ID: ${id}`);
        response = await api.put(
          `/receptionist/patients/patientId/${id}`,
          patientData
        );
      } else {
        // Otherwise assume it's a numeric database ID
        response = await api.put(`/receptionist/patients/${id}`, patientData);
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating patient ${id}:`, error);
      throw error;
    }
  },

  getPatients: async (search = "", status = null) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status) params.append("status", status);

      console.log(`Fetching patients with params: ${params.toString()}`);
      const response = await api.get(
        `/receptionist/patients?${params.toString()}`
      );
      console.log("Patients API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getPatients API call:", error);
      throw error;
    }
  },

  getAvailableDoctors: async () => {
    const response = await api.get("/receptionist/doctors");
    return response.data;
  },

  getPatientById: async (id) => {
    // Check if id is a string starting with 'PAT-' - it's a patient ID string
    if (typeof id === "string" && id.startsWith("PAT-")) {
      return await ReceptionistService.getPatientByPatientId(id);
    }
    // Otherwise assume it's a numeric database ID
    const response = await api.get(`/receptionist/patients/${id}`);
    return response.data;
  },

  getPatientByPatientId: async (patientId) => {
    const response = await api.get(
      `/receptionist/patients/patientId/${patientId}`
    );
    return response.data;
  },

  getDoctorById: async (id) => {
    const response = await api.get(`/receptionist/doctors/${id}`);
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await api.get(`/receptionist/appointments/${id}`);
    return response.data;
  },

  createBilling: async (billingData) => {
    const response = await api.post("/receptionist/billings", billingData);
    return response.data;
  },

  getBillings: async (filters = {}) => {
    const { patientId, status, startDate, endDate } = filters;
    const params = new URLSearchParams();

    // Only add non-date parameters
    if (patientId) params.append("patientId", patientId);
    if (status) params.append("status", status);

    // Log what we're doing
    console.log(
      `Fetching billings with limited params: ${
        params.toString() || "no parameters"
      }`
    );
    console.log(
      "Note: Date parameters temporarily disabled to avoid JDBC errors"
    );

    // Make the request without date parameters
    const response = await api.get(
      `/receptionist/billings?${params.toString()}`
    );

    let billings = response.data;

    // If we need date filtering, do it client-side for now
    if (startDate || endDate) {
      console.log("Performing client-side date filtering for billings");
      billings = billings.filter((billing) => {
        const billingDate = new Date(
          billing.createdAt || billing.date || billing.billingDate
        );
        let includeBilling = true;

        if (startDate) {
          const startDateObj = new Date(startDate);
          includeBilling = includeBilling && billingDate >= startDateObj;
        }

        if (endDate) {
          const endDateObj = new Date(endDate);
          includeBilling = includeBilling && billingDate <= endDateObj;
        }

        return includeBilling;
      });

      console.log(`After date filtering: ${billings.length} billings`);
    }

    return billings;
  },

  getBillingById: async (id) => {
    // Check if id is a string starting with 'BILL-', it's a bill number
    if (typeof id === "string" && id.startsWith("BILL-")) {
      const response = await api.get(`/receptionist/billings/by-number/${id}`);
      return response.data;
    }
    // Otherwise assume it's a numeric ID
    const response = await api.get(`/receptionist/billings/${id}`);
    return response.data;
  },

  processBillingPayment: async (id, paymentData) => {
    // Check if id is a string starting with 'BILL-', it's a bill number
    if (typeof id === "string" && id.startsWith("BILL-")) {
      const response = await api.put(
        `/receptionist/billings/by-number/${id}/payment`,
        paymentData
      );
      return response.data;
    }
    // Otherwise assume it's a numeric ID
    const response = await api.put(
      `/receptionist/billings/${id}/payment`,
      paymentData
    );
    return response.data;
  },

  // Get appointments for a specific doctor on a specific date
  // Using path variables to avoid JDBC parameter type issues
  getDoctorAppointmentsByDate: async (doctorId, date) => {
    try {
      console.log(
        `Fetching appointments for doctor ${doctorId} on date ${date}`
      );

      const response = await api.get(
        `/receptionist/doctors/${doctorId}/appointments/${date}`
      );

      console.log("Doctor appointments response status:", response.status);
      console.log("Doctor appointments data:", response.data);

      // Validate appointment data structure and datetime format
      if (Array.isArray(response.data)) {
        console.log(
          `Found ${response.data.length} appointments for the selected date`
        );

        // Log each appointment for debugging
        response.data.forEach((appointment, index) => {
          console.log(`Appointment ${index + 1}:`, {
            id: appointment.id,
            appointmentId: appointment.appointmentId,
            datetime: appointment.appointmentDateTime,
            duration: appointment.duration,
            status: appointment.status,
          });
        });

        // Clean and normalize the appointment data to ensure consistent format
        return response.data.map((appointment) => {
          // Ensure all expected fields exist and have valid values
          return {
            id: appointment.id || 0,
            appointmentId: appointment.appointmentId || "",
            appointmentDateTime: appointment.appointmentDateTime || "",
            duration: appointment.duration || 30,
            status: appointment.status || "SCHEDULED",
            notes: appointment.notes || "",
            patient: appointment.patient || {
              id: 0,
              firstName: "",
              lastName: "",
            },
            doctor: appointment.doctor || {
              id: 0,
              firstName: "",
              lastName: "",
            },
          };
        });
      } else {
        console.warn(
          "Unexpected response format - expected an array of appointments"
        );
        // Return empty array to avoid breaking the UI
        return [];
      }
    } catch (error) {
      console.error("Error in getDoctorAppointmentsByDate API call:", error);
      // Return empty array on error to avoid breaking the UI
      return [];
    }
  },
};

export default ReceptionistService;
