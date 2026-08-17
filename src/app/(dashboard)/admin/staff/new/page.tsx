"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import AuthService from "@/services/auth.service";
import dynamic from "next/dynamic";

// Dynamically import the UserForm component with SSR disabled
const UserForm = dynamic(() => import("@/components/forms/UserForm"), {
  ssr: false,
});

function AddStaffPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roleFromUrl, setRoleFromUrl] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated as admin
    const user = AuthService.getCurrentUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      router.push('/login');
      return;
    }

    // Get role from URL if present
    const role = searchParams.get('role');
    if (role) {
      setRoleFromUrl({ role });
    }
  }, [router, searchParams]);

  const handleSuccess = (userData: any) => {
    // Show success message
    alert(`${userData.firstName} ${userData.lastName} has been added successfully!`);
    
    // Navigate back with a query parameter to force refresh
    router.push('/admin/staff?refresh=' + new Date().getTime());
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <DashboardLayout userType="admin" title="Add New Staff Member">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {roleFromUrl ? `Add New ${roleFromUrl.role.charAt(0) + roleFromUrl.role.slice(1).toLowerCase()}` : 'Add New Staff Member'}
          </h3>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
        
        <UserForm 
          onSuccess={handleSuccess} 
          onCancel={handleCancel}
          {...roleFromUrl} 
        />
      </div>
    </DashboardLayout>
  );
}

export default function AddStaffPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <AddStaffPageContent />
    </Suspense>
  );
} 