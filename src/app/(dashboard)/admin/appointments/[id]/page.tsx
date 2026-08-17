"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthService from "@/services/auth.service";
import ReceptionistService from "@/services/receptionist.service";
import dynamic from "next/dynamic";

// Dynamically import the AppointmentForm component with SSR disabled
const AppointmentForm = dynamic(() => import("@/components/forms/AppointmentForm"), {
    ssr: false,
});

export default function EditAppointmentPage() {
    const router = useRouter();
    const params = useParams();
    const [appointment, setAppointment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Check if user is authenticated as admin
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || currentUser.role.toLowerCase() !== 'admin') {
            router.push('/login');
            return;
        }

        const fetchAppointmentData = async () => {
            try {
                if (!params.id) {
                    setError("Appointment ID is required");
                    setIsLoading(false);
                    return;
                }

                const data = await ReceptionistService.getAppointmentById(params.id);

                if (!data) {
                    setError("Appointment not found");
                    setIsLoading(false);
                    return;
                }

                console.log("Fetched appointment data:", data);
                setAppointment(data);
            } catch (err) {
                console.error("Error fetching appointment:", err);
                setError("Failed to load appointment data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointmentData();
    }, [router, params.id]);

    const handleSuccess = (data) => {
        // Show success message
        alert("Appointment updated successfully!");

        // Navigate back
        router.push('/admin');
    };

    const handleCancel = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <DashboardLayout userType="admin" title="Edit Appointment">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout userType="admin" title="Edit Appointment">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block">{error}</span>
                    <button
                        onClick={() => router.push('/admin')}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userType="admin" title="Edit Appointment">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Edit Appointment</h3>
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                </div>

                {appointment && <AppointmentForm appointment={appointment} onSuccess={handleSuccess} onCancel={handleCancel} />}
            </div>
        </DashboardLayout>
    );
}
