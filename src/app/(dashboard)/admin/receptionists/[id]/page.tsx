"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthService from "@/services/auth.service";
import AdminService from "@/services/admin.service";
import dynamic from "next/dynamic";

// Dynamically import the ReceptionistForm component with SSR disabled
const ReceptionistForm = dynamic(() => import("@/components/forms/ReceptionistForm"), {
    ssr: false,
});

export default function EditReceptionistPage() {
    const router = useRouter();
    const params = useParams();
    const [receptionist, setReceptionist] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Check if user is authenticated as admin
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || currentUser.role.toLowerCase() !== 'admin') {
            router.push('/login');
            return;
        }

        const fetchReceptionistData = async () => {
            try {
                if (!params.id) {
                    setError("Receptionist ID is required");
                    setIsLoading(false);
                    return;
                }

                // Get user details
                const userData = await AdminService.getUsers({ role: "RECEPTIONIST" });
                // params.id is likely a string, compare loosely or convert
                const foundReceptionist = userData.find(u => u.id == params.id);

                if (!foundReceptionist) {
                    // Fallback: Try fetching all users if role filter failed to capture specific id (edge case)
                    // Or just show error
                    setError("Receptionist not found");
                    setIsLoading(false);
                    return;
                }

                console.log("Fetched receptionist data:", foundReceptionist);
                setReceptionist(foundReceptionist);
            } catch (err) {
                console.error("Error fetching receptionist:", err);
                setError("Failed to load receptionist data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchReceptionistData();
    }, [router, params.id]);

    const handleSuccess = (data) => {
        // Show success message
        alert(`Receptionist ${data.firstName} ${data.lastName} has been updated successfully!`);

        // Navigate back with refresh parameter
        router.push('/admin/receptionists?refresh=' + new Date().getTime());
    };

    const handleCancel = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <DashboardLayout userType="admin" title="Edit Receptionist">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout userType="admin" title="Edit Receptionist">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block">{error}</span>
                    <button
                        onClick={() => router.push('/admin/receptionists')}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        Back to Receptionists List
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userType="admin" title={`Edit ${receptionist?.firstName} ${receptionist?.lastName}`}>
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Edit Receptionist Information</h3>
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                </div>

                {receptionist && <ReceptionistForm receptionist={receptionist} onSuccess={handleSuccess} onCancel={handleCancel} />}
            </div>
        </DashboardLayout>
    );
}
