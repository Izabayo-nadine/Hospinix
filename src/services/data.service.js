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

  getAllPharmacists: async () => {
    const response = await api.get("/data/pharmacists");
    return response.data;
  },

  getAllReceptionists: async () => {
    const response = await api.get("/data/receptionists");
    return response.data;
  },

  getAllMedicines: async () => {
    const response = await api.get("/data/medicines");
    return response.data;
  },

  getAccountTypes: async () => {
    const response = await api.get("/data/account-types");
    return response.data;
  },

  getAllAppointments: async () => {
    const response = await api.get("/data/appointments");
    return response.data;
  },
};

export default DataService;
