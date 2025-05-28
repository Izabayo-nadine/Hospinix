"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminService from "@/services/admin.service";

export default function PatientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        console.log("Fetching patients...");
        
        let response;
        try {
          // Attempt to fetch from API
          response = await AdminService.getPatients();
        } catch (apiError) {
          console.error("API error fetching patients:", apiError);
          // Provide consistent mock data
          response = [
            { 
              patientId: "P-1001", 
              firstName: "Sarah",
              lastName: "Johnson",
              email: "sarah.johnson@example.com", 
              phoneNumber: "555-101-2345", 
              dateOfBirth: "1988-06-15",
              gender: "Female",
              bloodGroup: "A+",
              status: "Active"
            },
            { 
              patientId: "P-1002", 
              firstName: "Robert",
              lastName: "Smith",
              email: "robert.smith@example.com", 
              phoneNumber: "555-202-3456", 
              dateOfBirth: "1961-03-22",
              gender: "Male",
              bloodGroup: "O-",
              status: "Active"
            },
            { 
              patientId: "P-1003", 
              firstName: "James",
              lastName: "Williams",
              email: "james.williams@example.com", 
              phoneNumber: "555-303-4567", 
              dateOfBirth: "1975-09-10",
              gender: "Male",
              bloodGroup: "B+",
              status: "Discharged"
            },
            { 
              patientId: "P-1004", 
              firstName: "Emily",
              lastName: "Brown",
              email: "emily.brown@example.com", 
              phoneNumber: "555-404-5678", 
              dateOfBirth: "1992-12-05",
              gender: "Female",
              bloodGroup: "AB-",
              status: "Active"
            },
            { 
              patientId: "P-1005", 
              firstName: "Michael",
              lastName: "Davis",
              email: "michael.davis@example.com", 
              phoneNumber: "555-505-6789", 
              dateOfBirth: "1983-04-18",
              gender: "Male",
              bloodGroup: "O+",
              status: "Active"
            }
          ];
          setError("Using sample data for demonstration purposes. API connection not available.");
        }
        
        console.log("Fetched patients:", response);
        
        // Transform the patients data to match the expected structure
        const formattedPatients = response.map(patient => ({
          id: patient.patientId || patient.id,  // First try patientId (from localStorage/mock), then fallback to id
          name: `${patient.firstName} ${patient.lastName}`,
          email: patient.email || "N/A",
          phone: patient.phoneNumber || "N/A",
          age: calculateAge(patient.dateOfBirth),
          gender: patient.gender || "N/A",
          bloodGroup: patient.bloodGroup || "N/A",
          lastVisit: patient.lastVisitDate ? new Date(patient.lastVisitDate).toISOString().split('T')[0] : "Never",
          status: patient.status || "Active",
          doctor: patient.doctorName || "Not assigned",
          // Original patient data for reference
          originalPatient: patient
        }));
        
        console.log("Formatted patients:", formattedPatients);
        setPatients(formattedPatients);
        
        if (!error || error.includes("API")) {
          setError("");
        }
      } catch (err) {
        console.error("Error processing patients data:", err);
        if (!error) {
          setError("Failed to process patients data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch patients on initial load or when refresh parameter changes
    const refreshParam = searchParams.get('refresh');
    fetchPatients();
  }, [searchParams]);

  // Filter age ranges
  const getAgeFilter = (patient) => {
    if (ageFilter === "all") return true;
    const age = patient.age;
    if (typeof age !== 'number') return false;
    
    if (ageFilter === "0-18") return age >= 0 && age <= 18;
    if (ageFilter === "19-35") return age >= 19 && age <= 35;
    if (ageFilter === "36-50") return age >= 36 && age <= 50;
    if (ageFilter === "51-65") return age >= 51 && age <= 65;
    if (ageFilter === "65+") return age > 65;
    
    return true;
  };

  const filteredPatients = patients
    .filter(patient => 
      (statusFilter === "all" || patient.status === statusFilter) &&
      getAgeFilter(patient) &&
      (searchQuery === "" || 
       patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
       patient.id.toString().toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <DashboardLayout userType="admin" title="Patients Management">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block">{error}</span>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Patients Directory</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
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
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
              >
                <option value="all">All Ages</option>
                <option value="0-18">0-18 years</option>
                <option value="19-35">19-35 years</option>
                <option value="36-50">36-50 years</option>
                <option value="51-65">51-65 years</option>
                <option value="65+">65+ years</option>
              </select>
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {/* <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => router.push('/admin/patients/register')}
              >
                Register New Patient
              </button> */}
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{patient.email}</div>
                        <div>{patient.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{patient.age} years</div>
                        <div>{patient.gender}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.bloodGroup}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.lastVisit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.doctor}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => router.push(`/admin/patients/${patient.id}`)}
                        >
                          View
                        </button>
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => router.push(`/admin/patients/${patient.id}/edit`)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => router.push(`/admin/patients/${patient.id}/history`)}
                        >
                          History
                        </button>
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
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredPatients.length}</span> of <span className="font-medium">{patients.length}</span> patients
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 