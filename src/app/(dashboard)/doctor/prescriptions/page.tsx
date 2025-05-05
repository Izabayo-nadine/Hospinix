"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DoctorService from "@/services/doctor.service";
import { formatDateForDisplay } from "@/utils/dateUtils";

export default function DoctorPrescriptions() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [showPatientReminder, setShowPatientReminder] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);
  
  // Fetch prescriptions from the API
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      
      // Build filters based on the current date filter and status filter
      const filters = {};
      if (dateFilter) {
        filters.startDate = new Date(dateFilter);
        const endDate = new Date(dateFilter);
        endDate.setDate(endDate.getDate() + 1);
        filters.endDate = endDate;
      }
      
      if (statusFilter !== "all") {
        filters.status = statusFilter.toUpperCase();
      }
      
      console.log("Fetching prescriptions with filters:", filters);
      
      // Call the API
      const data = await DoctorService.getPrescriptions(filters);
      console.log("Received prescriptions:", data);
      
      // Debug logging to inspect the exact structure of the received data
      if (data.length > 0) {
        console.log("First prescription details:");
        console.log("- ID:", data[0].id);
        console.log("- PrescriptionId:", data[0].prescriptionId);
        console.log("- Medication:", data[0].medication);
        console.log("- Dosage:", data[0].dosage);
        console.log("- Frequency:", data[0].frequency);
        console.log("- Duration:", data[0].duration);
        console.log("- Patient:", data[0].patient);
        
        // Get all property names to see what's available
        console.log("All properties:", Object.keys(data[0]));
      }
      
      // Transform prescription data for display
      const formattedPrescriptions = data.map(prescription => {
        // Debug each item as we process it
        console.log(`Processing prescription ${prescription.id || 'unknown'}:`, prescription);
        
        return {
          id: prescription.prescriptionId || `RX-${prescription.id}`,
          patient: prescription.patient ? `${prescription.patient.firstName} ${prescription.patient.lastName}` : "Unknown",
          patientId: prescription.patient ? prescription.patient.patientId : "Unknown",
          date: prescription.prescriptionDate ? formatDateForDisplay(prescription.prescriptionDate) : "N/A",
          // Handle the medication and related fields carefully, with fallbacks
          medication: prescription.medication || "N/A",
          dosage: prescription.dosage || "N/A",
          frequency: prescription.frequency || "N/A", 
          duration: prescription.duration || "N/A",
          status: prescription.status || "Unknown",
          notes: prescription.notes || "",
          rawId: prescription.id,
          // Capture the raw object for debugging
          raw: prescription
        };
      });
      
      console.log("Formatted prescriptions for display:", formattedPrescriptions);
      setPrescriptions(formattedPrescriptions);
      setError("");
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError("Failed to load prescriptions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchPrescriptions();
  }, [statusFilter, dateFilter]);

  const getFilteredPrescriptions = () => {
    return prescriptions.filter(prescription => 
      (searchQuery === "" || 
        prescription.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prescription.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prescription.medication.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const filteredPrescriptions = getFilteredPrescriptions();

  const handleCreatePrescription = () => {
    router.push("/doctor/prescriptions/new");
  };

  return (
    <DashboardLayout userType="doctor" title="Prescriptions Management">
      <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      
        {showPatientReminder && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Important Reminder</h3>
                <p>Patients must be assigned to your account by the receptionist before you can create prescriptions for them.</p>
                <p className="mt-1 text-sm">If you don't see any patients in the dropdown when creating a prescription, please contact the reception desk.</p>
              </div>
              <button 
                onClick={() => setShowPatientReminder(false)} 
                className="text-blue-700 hover:text-blue-900"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Patient Prescriptions</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by patient or medication..."
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex space-x-2">
              <input
                type="date"
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={handleCreatePrescription}
              >
                Create Prescription
              </button>
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                onClick={fetchPrescriptions}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refreshing...
                  </span>
                ) : "Refresh"}
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Loading prescriptions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rx ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrescriptions.map((prescription) => (
                  <tr key={prescription.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prescription.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{prescription.patient}</div>
                      <div className="text-xs text-gray-500">{prescription.patientId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prescription.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prescription.medication !== "N/A" ? prescription.medication : (
                        <span className="text-amber-500">Not specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prescription.dosage !== "N/A" ? prescription.dosage : (
                        <span className="text-amber-500">Not specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prescription.frequency !== "N/A" ? prescription.frequency : (
                        <span className="text-amber-500">Not specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prescription.duration !== "N/A" ? prescription.duration : (
                        <span className="text-amber-500">Not specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prescription.notes || <span className="text-gray-400">No notes</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        prescription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        prescription.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {prescription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => router.push(`/doctor/prescriptions/${prescription.id || prescription.prescriptionId}`)}
                      >
                        View
                      </button>
                      {prescription.status === 'ACTIVE' && (
                        <>
                          <button 
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => router.push(`/doctor/prescriptions/${prescription.id || prescription.prescriptionId}?edit=true`)}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={async () => {
                              if (confirm('Are you sure you want to discontinue this prescription?')) {
                                try {
                                  await DoctorService.discontinuePrescription(prescription.rawId);
                                  // Refresh the list
                                  fetchPrescriptions();
                                } catch (err) {
                                  console.error("Error discontinuing prescription:", err);
                                  alert("Failed to discontinue prescription");
                                }
                              }
                            }}
                          >
                            Discontinue
                          </button>
                        </>
                      )}
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => {
                          // Store the prescription data in session storage for printing
                          sessionStorage.setItem('printPrescription', JSON.stringify(prescription));
                          
                          // Open print view in new tab
                          window.open(`/doctor/prescriptions/${prescription.id || prescription.prescriptionId}/print`, '_blank');
                        }}
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && filteredPrescriptions.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No prescriptions found matching your criteria.
          </div>
        )}
        
        {!loading && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredPrescriptions.length}</span> of <span className="font-medium">{prescriptions.length}</span> prescriptions
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 