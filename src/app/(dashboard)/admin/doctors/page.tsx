"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminService from "@/services/admin.service";

export default function DoctorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        console.log("Fetching doctors...");
        const allUsers = await AdminService.getUsers({ role: "DOCTOR" });
        console.log("Fetched doctor users:", allUsers);
        
        // Transform the users data to match the doctor structure
        const formattedDoctors = allUsers.map(user => ({
          id: user.id,
          name: `Dr. ${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phoneNumber || "N/A",
          specialty: user.specialization || "General Medicine",
          specialization: user.specialization || "General Medicine",
          experience: user.experience || "Not specified",
          patients: user.patients || 0,
          availability: user.availability || "Mon-Fri",
          nextAvailable: user.nextAvailable || new Date().toISOString().split('T')[0],
          status: user.isActive ? "Active" : "Inactive",
          // Original user data for reference
          originalUser: user
        }));
        
        console.log("Formatted doctors:", formattedDoctors);
        setDoctors(formattedDoctors);
        setError("");
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch doctors on initial load or when refresh parameter changes
    const refreshParam = searchParams.get('refresh');
    fetchDoctors();
  }, [searchParams]);

  // Get all unique specialties for the filter
  const specialties = [...new Set(doctors.filter(d => d.specialization).map(d => d.specialization))];

  const filteredDoctors = doctors
    .filter(doctor => 
      (statusFilter === "all" || doctor.status === statusFilter) &&
      (specialtyFilter === "all" || doctor.specialization === specialtyFilter) &&
      (searchQuery === "" || 
       doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       doctor.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const handleToggleStatus = async (doctor) => {
    try {
      if (!doctor.originalUser) return;
      
      // Toggle the active status
      const newStatus = !doctor.originalUser.isActive;
      await AdminService.updateUser(doctor.originalUser.id, { isActive: newStatus });
      
      // Refresh the doctors list
      router.push(`/admin/doctors?refresh=${Date.now()}`);
    } catch (err) {
      console.error("Error updating doctor status:", err);
      alert("Failed to update doctor status. Please try again.");
    }
  };

  return (
    <DashboardLayout userType="admin" title="Doctors Management">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block">{error}</span>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Doctors Directory</h2>
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
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              >
                <option value="all">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => router.push('/admin/doctors/new')}
              >
                Add New Doctor
              </button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center group relative">
                        <span>Patients</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-black text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          Patient count is automatically updated based on assigned appointments and cannot be manually edited.
                        </div>
                      </div>
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{doctor.email}</div>
                        <div>{doctor.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialization}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.experience}</td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.patients}</td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{doctor.availability}</div>
                        <div className="text-xs text-gray-400">Next: {doctor.nextAvailable}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          doctor.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          doctor.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {doctor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => router.push(`/admin/doctors/${doctor.id}`)}
                        >
                          Edit
                        </button>
                        <button 
                          className={`${doctor.status === 'Active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                          onClick={() => handleToggleStatus(doctor)}
                        >
                          {doctor.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredDoctors.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No doctors found matching your criteria.
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredDoctors.length}</span> of <span className="font-medium">{doctors.length}</span> doctors
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 