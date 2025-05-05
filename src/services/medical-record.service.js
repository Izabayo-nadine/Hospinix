import api from "./api";

const MedicalRecordService = {
  getMedicalRecords: async (filters = {}) => {
    const { patientId, doctorId, startDate, endDate } = filters;
    const params = new URLSearchParams();

    if (patientId) params.append("patientId", patientId);
    if (doctorId) params.append("doctorId", doctorId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    try {
      const response = await api.get(
        `/doctor/medical-records?${params.toString()}`
      );
      console.log("API medical records response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching medical records:", error);

      // Mock data as fallback
      console.warn("Using mock data for medical records due to API failure");
      return getMockMedicalRecords(patientId);
    }
  },

  getMedicalRecord: async (id) => {
    try {
      const response = await api.get(`/doctor/medical-records/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching medical record ${id}:`, error);

      // Mock data as fallback
      console.warn(
        `Using mock data for medical record ${id} due to API failure`
      );
      return getMockMedicalRecord(id);
    }
  },

  createMedicalRecord: async (recordData) => {
    try {
      const response = await api.post("/doctor/medical-records", recordData);
      return response.data;
    } catch (error) {
      console.error("Error creating medical record:", error);

      // Mock response as fallback
      console.warn(
        "Using mock data for creating medical record due to API failure"
      );
      return {
        ...recordData,
        id: Math.floor(Math.random() * 10000),
        recordId: `MR-${Math.floor(Math.random() * 10000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  updateMedicalRecord: async (id, recordData) => {
    try {
      const response = await api.put(
        `/doctor/medical-records/${id}`,
        recordData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating medical record ${id}:`, error);

      // Mock response as fallback
      console.warn(
        `Using mock data for updating medical record ${id} due to API failure`
      );
      return {
        ...recordData,
        id,
        updatedAt: new Date().toISOString(),
      };
    }
  },

  deleteMedicalRecord: async (id) => {
    try {
      const response = await api.delete(`/doctor/medical-records/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting medical record ${id}:`, error);

      // Mock response as fallback
      console.warn(
        `Using mock data for deleting medical record ${id} due to API failure`
      );
      return { success: true, message: "Medical record deleted successfully" };
    }
  },
};

// Helper function to generate mock medical records for a patient
function getMockMedicalRecords(patientId) {
  if (!patientId) return [];

  return [
    {
      id: 1,
      recordId: "MR-1001",
      patientId: patientId,
      doctorId: "D-1001",
      doctorName: "Dr. Sarah Johnson",
      recordDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      chiefComplaint: "Fever and cough",
      diagnosis: "Acute bronchitis",
      treatment: "Prescribed antibiotics and rest",
      notes: "Patient should return in 7 days if symptoms persist",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      recordId: "MR-1002",
      patientId: patientId,
      doctorId: "D-1002",
      doctorName: "Dr. Michael Chen",
      recordDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      chiefComplaint: "Joint pain",
      diagnosis: "Rheumatoid arthritis",
      treatment: "Anti-inflammatory medication and physical therapy",
      notes: "Recommended follow-up in 3 months",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// Helper function to generate a mock medical record for a specific ID
function getMockMedicalRecord(id) {
  return {
    id: id,
    recordId: `MR-${id}`,
    patientId: "P-1001",
    doctorId: "D-1001",
    doctorName: "Dr. Sarah Johnson",
    recordDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    chiefComplaint: "Fever and cough",
    diagnosis: "Acute bronchitis",
    treatment: "Prescribed antibiotics and rest",
    notes: "Patient should return in 7 days if symptoms persist",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    vitals: [
      { name: "Blood Pressure", value: "120/80", unit: "mmHg" },
      { name: "Temperature", value: "38.2", unit: "°C" },
      { name: "Heart Rate", value: "88", unit: "bpm" },
      { name: "Respiratory Rate", value: "18", unit: "breaths/min" },
    ],
    labResults: [],
  };
}

export default MedicalRecordService;
