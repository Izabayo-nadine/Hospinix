import api from "./api";
import { API_ENDPOINTS } from "../config"; // Make sure this file exists and is correctly exported

class PharmacistService {
  // Dashboard related methods
  async getDashboardStats() {
    try {
      const response = await api.get("/pharmacist/dashboard");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  // Company related methods
  async getCompanies(params = {}, retryCount = 0) {
    try {
      // Try the API first
      const response = await api.get(API_ENDPOINTS.COMPANIES, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching companies:", error);

      // Check if this is the PostgreSQL lower(bytea) error
      const isPostgresTypeError =
        error.message?.includes("function lower(bytea) does not exist") ||
        error.response?.data?.message?.includes(
          "function lower(bytea) does not exist"
        );

      // If it's the specific Postgres error, try a fallback approach without using search parameters
      if (isPostgresTypeError && params.name) {
        try {
          console.log(
            "Detected PostgreSQL type error, trying fallback approach"
          );
          // Get all companies without search parameters
          const allCompaniesResponse = await api.get(API_ENDPOINTS.COMPANIES, {
            params: { ...params, name: undefined },
          });

          // If successful, manually filter the results
          if (allCompaniesResponse && Array.isArray(allCompaniesResponse)) {
            const searchTerm = params.name.toLowerCase();
            return allCompaniesResponse.filter(
              (company) =>
                company.name && company.name.toLowerCase().includes(searchTerm)
            );
          }
          return allCompaniesResponse;
        } catch (fallbackError) {
          console.error("Fallback approach failed:", fallbackError);
          // Continue to retry logic
        }
      }

      // Handle network errors with retry logic
      if (
        (!error.response || error.code === "ECONNABORTED") &&
        retryCount < 3
      ) {
        console.log(`Retrying getCompanies (attempt ${retryCount + 1})...`);
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        );
        return this.getCompanies(params, retryCount + 1);
      }

      if (!error.response) {
        error.isNetworkError = true;
        error.message =
          "Unable to connect to the server. Please check your internet connection or try again later.";
      }
      throw error;
    }
  }

  async addCompany(companyData) {
    try {
      if (!companyData.name || !companyData.address || !companyData.phone) {
        throw new Error("Name, address, and phone are required fields");
      }
      const formattedData = {
        ...companyData,
        companyId:
          companyData.companyId || `COMP-${Date.now().toString().slice(-6)}`,
        registrationDate:
          companyData.registrationDate ||
          new Date().toISOString().split("T")[0],
      };
      const response = await api.post(API_ENDPOINTS.COMPANIES, formattedData);
      return response;
    } catch (error) {
      console.error("Error adding company:", error);
      if (!error.response) {
        error.isNetworkError = true;
        error.message =
          "Unable to connect to the server. Please check your internet connection or try again later.";
      }
      throw error;
    }
  }


  async updateCompany(companyId, companyData) {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.COMPANIES}/${companyId}`,
        companyData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating company:", error);
      throw error;
    }
  }

  async getCompanyById(companyId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.COMPANIES}/${companyId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching company details:", error);
      throw error;
    }
  }

  // Distributor related methods
  async getDistributors(params = {}, retryCount = 0) {
    try {
      // Try the API first
      const response = await api.get(API_ENDPOINTS.DISTRIBUTORS, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching distributors:", error);

      // Check if this is the PostgreSQL lower(bytea) error
      const isPostgresTypeError =
        error.message?.includes("function lower(bytea) does not exist") ||
        error.response?.data?.message?.includes(
          "function lower(bytea) does not exist"
        );

      // If it's the specific Postgres error, try a fallback approach without using search parameters
      if (isPostgresTypeError && params.name) {
        try {
          console.log(
            "Detected PostgreSQL type error, trying fallback approach"
          );
          // Get all distributors without search parameters
          const allDistributorsResponse = await api.get(
            API_ENDPOINTS.DISTRIBUTORS,
            {
              params: { ...params, name: undefined },
            }
          );

          // If successful, manually filter the results
          if (
            allDistributorsResponse &&
            Array.isArray(allDistributorsResponse)
          ) {
            const searchTerm = params.name.toLowerCase();
            return allDistributorsResponse.filter(
              (distributor) =>
                distributor.name &&
                distributor.name.toLowerCase().includes(searchTerm)
            );
          }
          return allDistributorsResponse;
        } catch (fallbackError) {
          console.error("Fallback approach failed:", fallbackError);
          // Continue to retry logic
        }
      }

      // Handle network errors with retry logic
      if (
        (!error.response || error.code === "ECONNABORTED") &&
        retryCount < 3
      ) {
        console.log(`Retrying getDistributors (attempt ${retryCount + 1})...`);
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        );
        return this.getDistributors(params, retryCount + 1);
      }

      if (!error.response) {
        error.isNetworkError = true;
        error.message =
          "Unable to connect to the server. Please check your internet connection or try again later.";
      }
      throw error;
    }
  }

  async addDistributor(distributorData) {
    try {
      if (
        !distributorData.name ||
        !distributorData.phone ||
        !distributorData.region
      ) {
        throw new Error("Name, phone, and region are required fields");
      }
      const formattedData = {
        ...distributorData,
        distributorId:
          distributorData.distributorId ||
          `DIST-${Date.now().toString().slice(-6)}`,
        relationshipSince:
          distributorData.relationshipSince ||
          new Date().toISOString().split("T")[0],
      };
      const response = await api.post(
        API_ENDPOINTS.DISTRIBUTORS,
        formattedData
      );
      return response.data;
    } catch (error) {
      console.error("Error adding distributor:", error);
      if (!error.response) {
        error.isNetworkError = true;
        error.message =
          "Unable to connect to the server. Please check your internet connection or try again later.";
      }
      throw error;
    }
  }

  async updateDistributor(distributorId, distributorData) {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.DISTRIBUTORS}/${distributorId}`,
        distributorData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating distributor:", error);
      throw error;
    }
  }

  async getDistributorById(distributorId) {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.DISTRIBUTORS}/${distributorId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching distributor details:", error);
      throw error;
    }
  }

  // Medicine related methods
  async getMedicines(params = {}, retryCount = 0) {
    try {
      // Try the API first
      const response = await api.get(API_ENDPOINTS.MEDICINES, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching medicines:", error);

      // Check if this is the PostgreSQL lower(bytea) error
      const isPostgresTypeError =
        error.message?.includes("function lower(bytea) does not exist") ||
        error.response?.data?.message?.includes(
          "function lower(bytea) does not exist"
        );

      // If it's the specific Postgres error, try a fallback approach without using search parameters
      if (isPostgresTypeError) {
        try {
          console.log(
            "Detected PostgreSQL type error, trying fallback approach"
          );
          // Keep essential parameters like companyId and distributorId but remove text search parameters
          const safeParams = {
            companyId: params.companyId,
            distributorId: params.distributorId,
            stockStatus: params.stockStatus,
          };

          // Get medicines without potentially problematic search parameters
          const allMedicinesResponse = await api.get(API_ENDPOINTS.MEDICINES, {
            params: safeParams,
          });

          // If we have a name search, manually filter the results
          if (
            params.name &&
            allMedicinesResponse &&
            Array.isArray(allMedicinesResponse)
          ) {
            const searchTerm = params.name.toLowerCase();
            return allMedicinesResponse.filter(
              (medicine) =>
                medicine.name &&
                medicine.name.toLowerCase().includes(searchTerm)
            );
          }

          return allMedicinesResponse;
        } catch (fallbackError) {
          console.error("Fallback approach failed:", fallbackError);
          // Continue to retry logic
        }
      }

      // Handle network errors with retry logic
      if (
        (!error.response || error.code === "ECONNABORTED") &&
        retryCount < 3
      ) {
        console.log(`Retrying getMedicines (attempt ${retryCount + 1})...`);
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        );
        return this.getMedicines(params, retryCount + 1);
      }

      if (!error.response) {
        error.isNetworkError = true;
        error.message =
          "Unable to connect to the server. Please check your internet connection or try again later.";
      }
      throw error;
    }
  }

  async addMedicine(medicineData) {
    try {
      const response = await api.post(API_ENDPOINTS.MEDICINES, medicineData);
      return response.data;
    } catch (error) {
      console.error("Error adding medicine:", error);
      throw error;
    }
  }

  async updateMedicine(medicineId, medicineData) {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.MEDICINES}/${medicineId}`,
        medicineData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating medicine:", error);
      throw error;
    }
  }

  async getMedicineById(medicineId) {
    try {
      const response = await api.get(
        `${API_ENDPOINTS.MEDICINES}/${medicineId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching medicine details:", error);
      throw error;
    }
  }

  // Prescription related methods
  async getPrescriptions(params = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.PRESCRIPTIONS, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      throw error;
    }
  }

  async fillPrescription(prescriptionId) {
    try {
      const response = await api.post(
        `/pharmacist/prescriptions/${prescriptionId}/fill`
      );
      return response;
    } catch (error) {
      console.error("Error filling prescription:", error);
      throw error;
    }
  }

  async getPrescriptionById(prescriptionId) {
    try {
      const response = await api.get(
        `/pharmacist/prescriptions/${prescriptionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching prescription details:", error);
      throw error;
    }
  }

  async getPendingPrescriptions() {
    try {
      const response = await api.get(API_ENDPOINTS.PRESCRIPTIONS, {
        params: { status: "ACTIVE" },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching pending prescriptions:", error);
      throw error;
    }
  }

  async getLowStockMedicines() {
    try {
      const response = await api.get(API_ENDPOINTS.LOW_STOCK || API_ENDPOINTS.CRITICAL);
      return response.data;
    } catch (error) {
      console.error("Error fetching low stock medicines:", error);
      throw error;
    }
  }

  async placeOrder(orderData) {
    try {
      const response = await api.post(API_ENDPOINTS.ORDERS, orderData);
      return response.data;
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  }

  async getOrders() {
    try {
      const response = await api.get(API_ENDPOINTS.ORDERS);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.ORDERS}/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  }
}

export default new PharmacistService();
