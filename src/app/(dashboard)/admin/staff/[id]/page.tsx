"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthService from "@/services/auth.service";
import AdminService from "@/services/admin.service";
import dynamic from "next/dynamic";

// Dynamically import the UserForm component with SSR disabled
const UserForm = dynamic(() => import("@/components/forms/UserForm"), {
  ssr: false,
});

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is authenticated as admin
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || currentUser.role.toLowerCase() !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        if (!params.id) {
          setError("User ID is required");
          setIsLoading(false);
          return;
        }

        // Get user details
        const userData = await AdminService.getUsers();
        const user = userData.find(u => u.id == params.id);
        
        if (!user) {
          setError("User not found");
          setIsLoading(false);
          return;
        }

        setUser(user);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, params.id]);

  const handleSuccess = (userData) => {
    // Show success message
    alert(`${userData.firstName} ${userData.lastName} has been updated successfully!`);
    
    // Navigate back with a query parameter to force refresh
    router.push('/admin/staff?refresh=' + new Date().getTime());
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="admin" title="Edit Staff Member">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="admin" title="Edit Staff Member">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block">{error}</span>
          <button
            onClick={() => router.push('/admin/staff')}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to Staff List
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin" title={`Edit ${user?.firstName} ${user?.lastName}`}>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Edit Staff Member</h3>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
        
        {user && <UserForm user={user} onSuccess={handleSuccess} onCancel={handleCancel} />}
      </div>
    </DashboardLayout>
  );
} 