"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthService from "@/services/auth.service";
import AdminService from "@/services/admin.service";
import dynamic from "next/dynamic";

// Dynamically import the DoctorForm component with SSR disabled
const DoctorForm = dynamic(() => import("@/components/forms/DoctorForm"), {
  ssr: false,
});

export default function EditDoctorPage() {
  const router = useRouter();
  const params = useParams();
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is authenticated as admin
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser || currentUser.role.toLowerCase() !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchDoctorData = async () => {
      try {
        if (!params.id) {
          setError("Doctor ID is required");
          setIsLoading(false);
          return;
        }

        // Get user details
        const userData = await AdminService.getUsers({ role: "DOCTOR" });
        const doctor = userData.find(u => u.id == params.id);
        
        if (!doctor) {
          setError("Doctor not found");
          setIsLoading(false);
          return;
        }

        // Ensure specialization field exists
        if (doctor.specialty && !doctor.specialization) {
          doctor.specialization = doctor.specialty;
        }
        
        console.log("Fetched doctor data:", doctor);
        setDoctor(doctor);
      } catch (err) {
        console.error("Error fetching doctor:", err);
        setError("Failed to load doctor data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorData();
  }, [router, params.id]);

  const handleSuccess = (doctorData) => {
    // Show success message
    alert(`Dr. ${doctorData.firstName} ${doctorData.lastName} has been updated successfully!`);
    
    // Navigate back to the doctors list with refresh parameter
    router.push('/admin/doctors?refresh=' + new Date().getTime());
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="admin" title="Edit Doctor">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="admin" title="Edit Doctor">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block">{error}</span>
          <button
            onClick={() => router.push('/admin/doctors')}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Back to Doctors List
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin" title={`Edit ${doctor?.firstName} ${doctor?.lastName}`}>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Edit Doctor Information</h3>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
        
        {doctor && <DoctorForm doctor={doctor} onSuccess={handleSuccess} onCancel={handleCancel} />}
      </div>
    </DashboardLayout>
  );
} 