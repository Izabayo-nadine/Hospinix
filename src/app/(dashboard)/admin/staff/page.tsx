"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminService from "@/services/admin.service";
import AuthService from "@/services/auth.service";

export default function StaffListingPage() {
  const router = useRouter();
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    active: true,
    search: "",
  });

  useEffect(() => {
    // Check if user is authenticated as admin
    const user = AuthService.getCurrentUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      router.push('/login');
      return;
    }

    // Get URL parameters to see if a refresh was requested
    const urlParams = new URLSearchParams(window.location.search);
    const shouldRefresh = urlParams.get('refresh');
    
    if (shouldRefresh) {
      // Clear any URL parameters without triggering a page reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    fetchStaff();
  }, [router]);

  // Add a separate effect that only depends on filters to avoid issues with router dependency
  useEffect(() => {
    if (!isLoading) {
      fetchStaff();
    }
  }, [filters]);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const data = await AdminService.getUsers(filters);
      setStaff(data);
      setError("");
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError("Failed to load staff data. Please try again: " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActiveFilter = (value) => {
    setFilters((prev) => ({
      ...prev,
      active: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStaff();
  };

  const handleAddStaff = () => {
    router.push("/admin/staff/new");
  };

  const handleEditStaff = (id) => {
    router.push(`/admin/staff/${id}`);
  };

  const handleDeactivateStaff = async (id, currentActiveStatus) => {
    try {
      // Log what we're sending
      console.log(`Attempting to change status from ${currentActiveStatus} to ${!currentActiveStatus}`);
      
      // Use a clean object with explicit boolean conversion
      const updateData = { 
        isActive: Boolean(!currentActiveStatus) 
      };
      
      // Log the payload
      console.log('Update payload:', updateData);
      
      // Send the update
      await AdminService.updateUser(id, updateData);
      await fetchStaff(); // Refresh the staff list
      
      // Set a flag for dashboard to refresh
      localStorage.setItem('dashboard_refresh_needed', 'true');
      
      // Clear any existing errors
      setError("");
    } catch (err) {
      console.error("Error updating staff status:", err);
      setError("Failed to update staff status. Please try again: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteStaff = async (id) => {
    if (confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) {
      try {
        await AdminService.deleteUser(id);
        await fetchStaff(); // Refresh the staff list
        
        // Show success message
        setError(""); // Clear any existing errors
        
        // Force a refresh of the dashboard page if user returns to it
        localStorage.setItem('dashboard_refresh_needed', 'true');
      } catch (err) {
        console.error("Error deleting staff:", err);
        setError("Failed to delete staff. Please try again: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <DashboardLayout userType="admin" title="Staff Management">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Staff Management</h3>
          <button
            onClick={handleAddStaff}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Add New Staff
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">All Roles</option>
              <option value="DOCTOR">Doctor</option>
              <option value="PHARMACIST">Pharmacist</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="flex space-x-4 mt-2">
              <button
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.active === true
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => handleActiveFilter(true)}
              >
                Active
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.active === false
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => handleActiveFilter(false)}
              >
                Inactive
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.active === ""
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => handleActiveFilter("")}
              >
                All
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name, email, or specialization"
                className="flex-1 p-2 border border-gray-300 rounded-l-md"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No staff members found. Try adjusting your filters or add a new staff member.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {member.role === "DOCTOR" && "Doctor"}
                        {member.role === "PHARMACIST" && "Pharmacist"}
                        {member.role === "RECEPTIONIST" && "Receptionist"}
                        {member.role === "ADMIN" && "Administrator"}
                      </div>
                      {member.specialization && (
                        <div className="text-xs text-gray-400">
                          {member.specialization}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditStaff(member.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeactivateStaff(member.id, member.isActive)}
                        className={`${
                          member.isActive
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {member.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(member.id)}
                        className="text-red-600 hover:text-red-900 ml-3"
                      >
                        Delete
                      </button>
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