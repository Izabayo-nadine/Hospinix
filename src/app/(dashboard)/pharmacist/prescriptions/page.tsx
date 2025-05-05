"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PharmacistService from "@/services/pharmacist.service";

export default function PrescriptionsPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const data = await PharmacistService.getPrescriptions({ 
          status: activeTab.toUpperCase() 
        });
        console.log("Fetched prescriptions:", data);
        setPrescriptions(data || []);
        setError("");
      } catch (err) {
        console.error("Failed to load prescriptions:", err);
        setError("Failed to load prescriptions. Please try again.");
        setPrescriptions([
          {
            id: 1,
            prescriptionId: "RX-00123",
            patientName: "John Smith",
            doctorName: "Dr. Sarah Wilson",
            createdAt: "2023-11-15",
            status: "ACTIVE",
            medications: [
              { name: "Amoxicillin 500mg", dosage: "1 tablet", frequency: "3 times daily", duration: "7 days" },
              { name: "Ibuprofen 400mg", dosage: "1 tablet", frequency: "as needed", duration: "3 days" }
            ]
          },
          {
            id: 2,
            prescriptionId: "RX-00124",
            patientName: "Emma Johnson",
            doctorName: "Dr. Michael Brown",
            createdAt: "2023-11-14",
            status: "ACTIVE",
            medications: [
              { name: "Lisinopril 10mg", dosage: "1 tablet", frequency: "once daily", duration: "30 days" }
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [activeTab]);

  const handleFillPrescription = async (id) => {
    try {
      setLoading(true);
      await PharmacistService.fillPrescription(id);
      // Refresh prescription list
      setPrescriptions(prescriptions.filter(p => p.id !== id));
      // Success message could be added here
    } catch (err) {
      console.error("Failed to fill prescription:", err);
      setError("Failed to fill prescription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id) => {
    router.push(`/pharmacist/prescriptions/${id}`);
  };

  return (
    <DashboardLayout userType="pharmacist" title="Manage Prescriptions">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Prescriptions</h1>
          
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
                {prescriptions.map((prescription) => (
                  <tr key={prescription.id || prescription.prescriptionId}>
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
                        onClick={() => handleViewDetails(prescription.id || prescription.prescriptionId)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View
                      </button>
                      
                      {prescription.status === "ACTIVE" && (
                        <button
                          onClick={() => handleFillPrescription(prescription.id || prescription.prescriptionId)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Fill
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 