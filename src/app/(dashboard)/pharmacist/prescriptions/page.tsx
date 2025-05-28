"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PharmacistService from "@/services/pharmacist.service";

interface Patient {
  id?: string | number;
  name: string;
  firstName?: string;
  lastName?: string;
}

interface Doctor {
  id?: string | number;
  name: string;
  firstName?: string;
  lastName?: string;
}

interface Prescription {
  id: string | number;
  prescriptionId?: string;
  patient?: Patient;
  patientName?: string;
  doctor?: Doctor;
  doctorName?: string;
  createdAt: string;
  status: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
}

export default function PrescriptionsPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        console.log(`Fetching ${activeTab} prescriptions...`);
        const response = await PharmacistService.getPrescriptions({ 
          status: activeTab.toUpperCase() 
        });
        console.log("Raw API response:", JSON.stringify(response, null, 2));

        // Handle different response structures
        let prescriptionData: Prescription[] = [];
        if (Array.isArray(response)) {
          prescriptionData = response;
        } else if (response && typeof response === 'object') {
          if (Array.isArray(response.data)) {
            prescriptionData = response.data;
          } else if (response.prescriptions && Array.isArray(response.prescriptions)) {
            prescriptionData = response.prescriptions;
          } else {
            console.warn("Unexpected response structure:", response);
            prescriptionData = [];
          }
        }

        // Log the first prescription to see its structure
        if (prescriptionData.length > 0) {
          console.log("Sample prescription data structure:", JSON.stringify(prescriptionData[0], null, 2));
        }

        // Transform the data to ensure consistent structure
        prescriptionData = prescriptionData.map(prescription => {
          // Extract patient and doctor names, combining first and last names
          const patientName = prescription.patient?.firstName && prescription.patient?.lastName 
            ? `${prescription.patient.firstName} ${prescription.patient.lastName}` 
            : prescription.patientName || "N/A";
            
          const doctorName = prescription.doctor?.firstName && prescription.doctor?.lastName
            ? `${prescription.doctor.firstName} ${prescription.doctor.lastName}`
            : prescription.doctorName || "N/A";

          return {
            ...prescription,
            patientName,
            doctorName,
            // Keep the nested objects if they exist
            patient: prescription.patient,
            doctor: prescription.doctor
          };
        });

        console.log("Transformed prescription data:", JSON.stringify(prescriptionData[0], null, 2));
        setPrescriptions(prescriptionData);
        setError("");
      } catch (err) {
        console.error("Failed to load prescriptions:", err);
        setError("Failed to load prescriptions. Please try again.");
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [activeTab]);

  const handleFillPrescription = async (id: string | number) => {
    if (!id) {
      setError("Invalid prescription ID");
      return;
    }
    try {
      setLoading(true);
      console.log(`Filling prescription ${id}...`);
      await PharmacistService.fillPrescription(id);
      console.log("Prescription filled successfully, refreshing list...");
      
      // Refresh the prescription list
      const response = await PharmacistService.getPrescriptions({ 
        status: activeTab.toUpperCase() 
      });
      
      // Handle different response structures
      let prescriptionData: Prescription[] = [];
      if (Array.isArray(response)) {
        prescriptionData = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          prescriptionData = response.data;
        } else if (response.prescriptions && Array.isArray(response.prescriptions)) {
          prescriptionData = response.prescriptions;
        }
      }
      
      setPrescriptions(prescriptionData);
      setError("");
    } catch (err) {
      console.error("Failed to fill prescription:", err);
      setError("Failed to fill prescription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: string | number) => {
    if (!id) {
      setError("Invalid prescription ID");
      return;
    }
    console.log(`Navigating to prescription details for ID: ${id}`);
    router.push(`/pharmacist/prescriptions/${id}`);
  };

  return (
    <DashboardLayout userType="pharmacist" title="Manage Prescriptions">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-black ">Prescriptions</h1>
          
          {/* Tabs */}
          <div className="flex space-x-4 border-b">
            <button
              className={`pb-2 px-1 ${activeTab === 'active' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </button>
            <button
              className={`pb-2 px-1 ${activeTab === 'completed' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <p className="text-gray-500">No {activeTab} prescriptions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prescriptions.map((prescription) => {
                  const prescriptionId = prescription.id || prescription.prescriptionId;
                  if (!prescriptionId) return null;
                  
                  // Log each prescription being rendered
                  console.log("Rendering prescription:", {
                    id: prescriptionId,
                    patient: prescription.patient,
                    patientName: prescription.patientName,
                    doctor: prescription.doctor,
                    doctorName: prescription.doctorName
                  });
                  
                  return (
                    <tr key={prescriptionId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {prescription.prescriptionId || `RX-${prescription.id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {prescription.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {prescription.doctorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          prescription.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {prescription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleViewDetails(prescriptionId)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          View
                        </button>
                        
                        {prescription.status === "ACTIVE" && (
                          <button
                            onClick={() => handleFillPrescription(prescriptionId)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Fill
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 