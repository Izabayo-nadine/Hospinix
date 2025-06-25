"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DoctorService from "@/services/doctor.service";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function DoctorBeds() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [wardFilter, setWardFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingMockData, setUsingMockData] = useState(false);
  const [apiHealth, setApiHealth] = useState({ isConnected: true, responseTime: 0 });
  const [apiStatus, setApiStatus] = useState("Checking connection...");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Add this effect to check backend API connectivity
  useEffect(() => {
    // Test API connectivity using the pingServer method
    const testApi = async () => {
      try {
        // Use the pingServer method instead of calling root directly
        const health = await api.pingServer();
        if (health.isConnected) {
          setApiStatus("API connected");
        } else {
          setApiStatus(`API not connected: ${health.error || "Unknown error"}`);
        }
      } catch (err) {
        console.warn("API connectivity test failed:", err.message);
        setApiStatus(`API not connected: ${err.message}`);
      }
    };
    
    testApi();
  }, []);

  useEffect(() => {
    const checkApiAndFetchBeds = async () => {
      try {
        setLoading(true);
        
        // Check API health first
        const health = await api.pingServer();
        setApiHealth(health);
        
        if (!health.isConnected) {
          console.warn("API connection failed, will use mock data:", health);
          setUsingMockData(true);
        }
        
        // Fetch beds
        const bedsData = await DoctorService.getBeds();
        
        // Check if the returned data is mock based on the first item
        if (bedsData.length > 0 && bedsData[0].mock) {
          setUsingMockData(true);
        }
        
        setBeds(bedsData);
        setError("");
      } catch (err) {
        console.error("Error in initialization:", err);
        setError("Failed to load bed data. Please try again later.");
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    checkApiAndFetchBeds();
  }, []);

  // Get unique ward names for filter options
  const wardOptions = ["all", ...new Set(beds.map(bed => bed.wardName))];

  // Get filtered beds based on search and filters
  const getFilteredBeds = () => {
    return beds.filter(bed => 
      (wardFilter === "all" || bed.wardName === wardFilter) &&
      (statusFilter === "all" || bed.status === statusFilter) &&
      (searchQuery === "" || 
        bed.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bed.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bed.patient && bed.patient.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (bed.patient && bed.patient.id.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  };

  const filteredBeds = getFilteredBeds();

  // Handle updating bed status
  const handleUpdateStatus = async (bedId, newStatus) => {
    try {
      await DoctorService.updateBedStatus(bedId, newStatus);
      
      // Refresh beds data
      const bedsData = await DoctorService.getBeds();
      setBeds(bedsData);
    } catch (err) {
      console.error("Error updating bed status:", err);
      setError("Failed to update bed status. Please try again.");
    }
  };

  // Handle patient discharge
  const handleDischargePatient = async (bedId) => {
    try {
      await DoctorService.dischargePatient(bedId);
      
      // Refresh beds data
      const bedsData = await DoctorService.getBeds();
      setBeds(bedsData);
    } catch (err) {
      console.error("Error discharging patient:", err);
      setError("Failed to discharge patient. Please try again.");
    }
  };

  // Open assign modal with selected bed
  const handleOpenAssignModal = async (bed) => {
    setSelectedBed(bed);
    setShowAssignModal(true);
    
    // Fetch available patients
    try {
      setLoadingPatients(true);
      setError(""); // Clear any previous errors
      
      // const patientsData = await DoctorService.getPatients();
      const patientsData = await DoctorService.getPatientsFromAppointments();

      
      if (patientsData.length === 0) {
        console.warn("No patients returned from API");
      }
      
      // Filter out patients who are already assigned to beds
      const occupiedBedPatientIds = beds
        .filter(bed => bed.patient)
        .map(bed => bed.patient.id);
      
      // Filter patients not already assigned to beds
      // Account for different ID formats (id or patientId)
      const availablePatients = patientsData.filter(patient => {
        const patientId = patient.id || patient.patientId;
        return !occupiedBedPatientIds.includes(patientId);
      });
      
      console.log("Available patients for assignment:", availablePatients);
      setPatients(availablePatients);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load patient data. Please try again.");
      // Don't close the modal, but show the error
    } finally {
      setLoadingPatients(false);
    }
  };

  // Handle assigning patient to bed
  const handleAssignPatient = async () => {
    if (!selectedPatient || !selectedBed) return;
    
    try {
      setError(""); // Clear any previous errors
      
      // Show loading state
      const assigningButton = document.getElementById('assign-patient-button');
      if (assigningButton) {
        assigningButton.textContent = "Assigning...";
        assigningButton.disabled = true;
      }
      
      const result = await DoctorService.assignPatientToBed(selectedBed.id, selectedPatient);
      
      if (result.mock) {
        console.warn("Using mock data for patient assignment");
      }
      
      // Close modal and reset selection
      setShowAssignModal(false);
      setSelectedBed(null);
      setSelectedPatient("");
      
      // Refresh beds data
      const bedsData = await DoctorService.getBeds();
      setBeds(bedsData);
    } catch (err) {
      console.error("Error assigning patient:", err);
      setError(`Failed to assign patient: ${err.message || "Unknown error"}`);
      
      // We don't close the modal on error, so the user can try again
    } finally {
      // Reset button state
      const assigningButton = document.getElementById('assign-patient-button');
      if (assigningButton) {
        assigningButton.textContent = "Assign";
        assigningButton.disabled = false;
      }
    }
  };

  // Get status color class based on bed status
  const getStatusColorClass = (status) => {
    switch (status) {
      case "Occupied":
        return "bg-red-100 text-red-800";
      case "Available":
        return "bg-green-100 text-green-800";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "Reserved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to handle view patient button click
  const handleViewPatient = (patientId) => {
    if (!patientId) return;
    router.push(`/doctor/patients/${patientId}`);
  };

  // Add a function to test the API connection
  const testApiConnection = async () => {
    setApiStatus("Testing connection...");
    try {
      // Use pingServer instead of direct root call
      const healthCheck = await api.pingServer();
      setApiHealth(healthCheck);
      
      if (healthCheck.isConnected) {
        setApiStatus("API connected");
        
        // Try getting actual beds data from the API
        const freshData = await DoctorService.getBeds();
        if (freshData.length > 0 && !freshData[0].mock) {
          setUsingMockData(false);
          setBeds(freshData);
          setError("");
        } else {
          setUsingMockData(true);
        }
      } else {
        setApiStatus(`API not connected: ${healthCheck.error || "Unknown error"}`);
        setUsingMockData(true);
      }
    } catch (err) {
      console.warn("API connectivity test failed:", err.message);
      setApiStatus(`API not connected: ${err.message}`);
      setUsingMockData(true);
    }
  };

  return (
    <DashboardLayout userType="doctor" title="Bed Management">
      <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {/* Show warning if using mock data */}
        {usingMockData && (
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md mb-6">
            <p className="font-medium">Using sample data</p>
            <p className="text-sm">
              {!apiHealth.isConnected 
                ? `The API connection failed (${apiHealth.error || 'Connection error'}). Sample data is being displayed for demonstration.` 
                : 'The bed data being displayed is sample data for demonstration purposes.'}
            </p>
          </div>
        )}
        
        {/* Show API status with test button */}
        <div className="flex justify-between items-center mb-4">
          <div className={`text-xs ${apiStatus.includes("not") ? "text-red-600" : "text-green-600"}`}>
            {apiStatus}
          </div>
          <button 
            onClick={testApiConnection}
            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            Test Connection
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Hospital Beds</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search beds or patients..."
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
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
              >
                <option value="all">All Wards</option>
                {wardOptions.filter(ward => ward !== "all").map(ward => (
                  <option key={ward} value={ward}>{ward}</option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Reserved">Reserved</option>
              </select>
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => {
                  // Find first available bed and open assign modal for it
                  const availableBed = beds.find(bed => bed.status === "Available");
                  if (availableBed) {
                    handleOpenAssignModal(availableBed);
                  } else {
                    setError("No available beds found for assignment");
                    setTimeout(() => setError(""), 3000);
                  }
                }}
              >
                Assign Patient to Bed
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Loading bed data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBeds.map((bed) => (
                    <tr key={bed.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bed.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bed.wardName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bed.roomNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bed.bedNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(bed.status)}`}>
                          {bed.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bed.patient ? (
                          <div>
                            <div>{bed.patient.name}</div>
                            <div className="text-xs text-gray-500">{bed.patient.id} • {bed.patient.age}, {bed.patient.gender}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bed.patient ? bed.patient.admissionDate : "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bed.patient ? bed.patient.diagnosis : "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        {bed.patient ? (
                          <>
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => handleViewPatient(bed.patient.id)}
                            >
                              View Patient
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDischargePatient(bed.id)}
                            >
                              Discharge
                            </button>
                          </>
                        ) : bed.status === "Available" ? (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleOpenAssignModal(bed)}
                          >
                            Assign Patient
                          </button>
                        ) : bed.status === "Maintenance" ? (
                          <button 
                            className="text-yellow-600 hover:text-yellow-900"
                            onClick={() => handleUpdateStatus(bed.id, "Available")}
                          >
                            Set Available
                          </button>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredBeds.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No beds found matching your criteria.
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredBeds.length}</span> of <span className="font-medium">{beds.length}</span> beds
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-gray-50">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Bed Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Patient to Bed</h3>
            
            {selectedBed?.mock && (
              <div className="bg-yellow-50 text-yellow-700 p-2 rounded-md mb-4 text-xs">
                Working with sample data — changes will not be saved to the database
              </div>
            )}
            
            <p className="mb-4 text-black">
              Bed: <span className="font-medium">{selectedBed?.id}</span> ({selectedBed?.wardName}, Room {selectedBed?.roomNumber})
            </p>
            
            {loadingPatients ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-500">Loading patients...</p>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Patient
                </label>
                <select 
                  className="border border-gray-300 rounded-md py-2 px-4 w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                >
                  <option value="">-- Select a patient --</option>
                  {patients.map(patient => {
                    const id = patient.id || patient.patientId;
                    const firstName = patient.firstName || '';
                    const lastName = patient.lastName || '';
                    const displayName = `${firstName} ${lastName}`.trim();
                    const isMock = patient.mock ? ' (Sample)' : '';
                    
                    return (
                      <option key={id} value={id}>
                        {displayName} ({id}){isMock}
                      </option>
                    );
                  })}
                </select>
                {patients.length === 0 && (
                  <p className="mt-2 text-sm text-red-500">No patients available for assignment.</p>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignPatient}
                disabled={!selectedPatient || loadingPatients}
                id="assign-patient-button"
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  !selectedPatient || loadingPatients 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 