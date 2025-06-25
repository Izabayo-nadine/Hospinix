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
  
  // Add new state for sorting and pagination
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Add sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort and filter patients
  const sortedAndFilteredPatients = patients
    .filter(patient => 
      (selectedStatus === "all" || patient.status === selectedStatus) &&
      (searchQuery === "" || 
       patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
       patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
       patient.phone.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      // For name sorting, use simple alphabetical comparison
      if (sortField === "name") {
        const aName = (a.name || "").toLowerCase();
        const bName = (b.name || "").toLowerCase();
        return sortDirection === "asc" 
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }
      
      // For other fields, use the standard comparison
      let aValue = (a[sortField] || "").toString().toLowerCase();
      let bValue = (b[sortField] || "").toString().toLowerCase();
      
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  // Calculate pagination
  const totalPages = Math.ceil(sortedAndFilteredPatients.length / itemsPerPage);
  const paginatedPatients = sortedAndFilteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full text-gray-700"
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
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
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
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("patientId")}
                    >
                      Patient ID {sortField === "patientId" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("name")}
                    >
                      Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("phoneNumber")}
                    >
                      Contact {sortField === "phoneNumber" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("status")}
                    >
                      Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.patientId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{patient.email}</div>
                        <div>{patient.phone}</div>
                      </td>
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
            
            {paginatedPatients.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No patients found matching your criteria.
              </div>
            )}
          </>
        )}
        
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, sortedAndFilteredPatients.length)}
                  </span>{" "}
                  of <span className="font-medium">{sortedAndFilteredPatients.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 