"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReceptionistService from "@/services/receptionist.service";
import { calculateAge, formatDateForDisplay } from "@/utils/dateUtils";
import { formatApiError } from "@/utils/errorHandler";

export default function PatientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        
        // Create filters object
        const filters = {
          search: searchQuery,
          status: selectedStatus !== "all" ? selectedStatus : null
        };
        
        console.log("Fetching patients with filters:", filters);
        const data = await ReceptionistService.getPatients(
          searchQuery, 
          selectedStatus !== "all" ? selectedStatus : null
        );
        console.log("Patients data received:", data);
        
        // Transform the data to match UI expectations if needed
        const formattedPatients = data.map(patient => ({
          id: patient.id,
          patientId: patient.patientId,
          name: `${patient.firstName} ${patient.lastName}`,
          email: patient.email || "",
          phone: patient.phoneNumber || "",
          age: calculateAge(patient.dateOfBirth),
          gender: patient.gender,
          lastVisit: patient.lastVisitDate ? formatDateForDisplay(patient.lastVisitDate) : "No visits yet",
          status: patient.status,
        }));
        
        setPatients(formattedPatients);
        setError("");
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError(formatApiError(err, "Failed to load patients. Please try again later."));
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, [searchQuery, selectedStatus]); // Refetch when search query or status filter changes
  
  const filteredPatients = patients
    .filter(patient => 
      (selectedStatus === "all" || patient.status === selectedStatus)
    );

  const handleRegisterPatient = () => {
    router.push("/receptionist/patients/register");
  };
  
  const handleViewPatient = (patientId) => {
    router.push(`/receptionist/patients/${patientId}`);
  };
  
  const handleEditPatient = (patientId) => {
    router.push(`/receptionist/patients/${patientId}/edit`);
  };
  
  const handleCreateAppointment = (patientId) => {
    router.push(`/receptionist/appointments/new?patientId=${patientId}`);
  };

  return (
    <DashboardLayout userType="receptionist" title="Patient Management">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Patients Directory</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients..."
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
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Patients</option>
                <option value="Active">Active</option>
                <option value="Discharged">Discharged</option>
                <option value="Deceased">Deceased</option>
              </select>
              <button 
                onClick={handleRegisterPatient}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Register New Patient
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Loading patients...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age / Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.patientId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{patient.email}</div>
                        <div>{patient.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.age} / {patient.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.lastVisit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button 
                          onClick={() => handleViewPatient(patient.patientId)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >View</button>
                        <button 
                          onClick={() => handleEditPatient(patient.patientId)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >Edit</button>
                        <button 
                          onClick={() => handleCreateAppointment(patient.patientId)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >Create Appointment</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredPatients.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No patients found matching your criteria.
              </div>
            )}
          </>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredPatients.length}</span> {filteredPatients.length === 1 ? "patient" : "patients"}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 