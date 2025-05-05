"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminService from "@/services/admin.service";

export default function ReceptionistsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchReceptionists = async () => {
      try {
        setLoading(true);
        console.log("Fetching receptionists...");
        const allUsers = await AdminService.getUsers({ role: "RECEPTIONIST" });
        console.log("Fetched receptionist users:", allUsers);
        
        // Transform the users data to match the receptionist structure
        const formattedReceptionists = allUsers.map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phoneNumber || "N/A",
          shift: user.shift || "Not specified",
          joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : "Unknown",
          status: user.isActive ? "Active" : "Inactive",
          // Original user data for reference
          originalUser: user
        }));
        
        console.log("Formatted receptionists:", formattedReceptionists);
        setReceptionists(formattedReceptionists);
        setError("");
      } catch (err) {
        console.error("Error fetching receptionists:", err);
        setError("Failed to load receptionists data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch receptionists on initial load or when refresh parameter changes
    const refreshParam = searchParams.get('refresh');
    fetchReceptionists();
  }, [searchParams]);

  // Get unique shifts for filter - only using shifts from actual data
  const shifts = [...new Set(receptionists
    .filter(receptionist => receptionist.shift && receptionist.shift !== "Not specified")
    .map(receptionist => receptionist.shift))];

  const filteredReceptionists = receptionists
    .filter(receptionist => 
      (statusFilter === "all" || receptionist.status === statusFilter) &&
      (shiftFilter === "all" || receptionist.shift === shiftFilter) &&
      (searchQuery === "" || 
       receptionist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       receptionist.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
  const handleToggleStatus = async (receptionist) => {
    try {
      if (!receptionist.originalUser) return;
      
      // Toggle the active status
      const newStatus = !receptionist.originalUser.isActive;
      await AdminService.updateUser(receptionist.originalUser.id, { isActive: newStatus });
      
      // Refresh the receptionists list
      router.push(`/admin/receptionists?refresh=${Date.now()}`);
    } catch (err) {
      console.error("Error updating receptionist status:", err);
      alert("Failed to update receptionist status. Please try again.");
    }
  };

  return (
    <DashboardLayout userType="admin" title="Receptionists Management">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block">{error}</span>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Receptionists Directory</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search receptionists..."
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
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
              >
                <option value="all">All Shifts</option>
                {shifts.map(shift => (
                  <option key={shift} value={shift}>{shift}</option>
                ))}
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
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => router.push('/admin/staff/new?role=RECEPTIONIST')}
              >
                Add New Receptionist
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReceptionists.map((receptionist) => (
                    <tr key={receptionist.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{receptionist.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{receptionist.email}</div>
                        <div>{receptionist.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{receptionist.shift}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{receptionist.joinDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          receptionist.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {receptionist.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => router.push(`/admin/staff/${receptionist.id}`)}
                        >
                          Edit
                        </button>
                        <button 
                          className={`${receptionist.status === 'Active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                          onClick={() => handleToggleStatus(receptionist)}
                        >
                          {receptionist.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredReceptionists.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No receptionists found matching your criteria.
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredReceptionists.length}</span> of <span className="font-medium">{receptionists.length}</span> receptionists
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 