"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthService from "@/services/auth.service";
import dynamic from "next/dynamic";

// Dynamically import the DoctorForm component with SSR disabled
const DoctorForm = dynamic(() => import("@/components/forms/DoctorForm"), {
  ssr: false,
});

export default function NewDoctorPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated as admin
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || currentUser.role.toLowerCase() !== 'admin') {
      router.push('/login');
    }
  }, [router]);

  const handleSuccess = (doctorData) => {
    // Show success message
    alert(`Dr. ${doctorData.firstName} ${doctorData.lastName} has been added successfully!`);
    
    // Navigate back to the doctors list with refresh parameter
    router.push('/admin/doctors?refresh=' + new Date().getTime());
  };

  const handleCancel = () => {
    router.back();
  };

  // Initialize a new doctor with patients count set to 0
  const newDoctor = {
    patients: 0
  };

  return (
    <DashboardLayout userType="admin" title="Add New Doctor">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Add New Doctor</h3>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
        
        <DoctorForm doctor={newDoctor} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  );
} 