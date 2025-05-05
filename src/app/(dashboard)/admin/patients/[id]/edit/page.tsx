"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import PatientForm from "@/components/forms/PatientForm";
import AdminService from "@/services/admin.service";

export default function EditPatientPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const patientId = params.id;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const data = await AdminService.getPatient(patientId);
        setPatient(data);
        setErrorMessage("");
      } catch (err) {
        console.error("Error fetching patient data:", err);
        if (err.response && err.response.status === 403) {
          setErrorMessage("Access denied. You don't have permission to access this patient's data as an admin.");
        } else {
          setErrorMessage("Failed to load patient data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const handleSuccess = (response) => {
    // Show success message
    console.log("Patient updated successfully:", response);
    setIsSuccess(true);
    
    // Clear any previous errors
    setErrorMessage("");
    
    // Redirect after a short delay to show success state
    setTimeout(() => {
      router.push("/admin/patients?refresh=true");
    }, 1500);
  };

  const handleCancel = () => {
    router.push("/admin/patients");
  };

  const handleError = (error) => {
    console.error("Error updating patient:", error);
    if (error.response && error.response.status === 403) {
      setErrorMessage("Access denied. You don't have permission to update patients as an admin. Please use the receptionist dashboard instead.");
    } else {
      setErrorMessage(error.message || "An error occurred while updating the patient. Please try again.");
    }
  };

  return (
    <DashboardLayout userType="admin" title="Edit Patient">
      <div className="bg-white shadow rounded-lg">
        {isSuccess && (
          <div className="p-4 mb-4 bg-green-100 text-green-700 rounded-lg">
            Patient updated successfully! Redirecting to patients list...
          </div>
        )}
        
        {errorMessage && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
            {errorMessage.includes("permission") && (
              <div className="mt-2">
                <button 
                  onClick={() => router.push(`/receptionist/patients/${patientId}/edit`)}
                  className="text-red-700 underline"
                >
                  Go to Receptionist Dashboard
                </button>
              </div>
            )}
          </div>
        )}
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
            <p>Loading patient data...</p>
          </div>
        ) : (
          patient && (
            <PatientForm 
              patient={patient}
              onSuccess={handleSuccess} 
              onCancel={handleCancel}
              onError={handleError}
              serviceType="admin"
            />
          )
        )}
      </div>
    </DashboardLayout>
  );
} 