"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import PatientForm from "@/components/forms/PatientForm";

export default function AdminPatientRegistrationPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [patientResponse, setPatientResponse] = useState(null);

  const handleSuccess = (response) => {
    // Show success message
    console.log("Patient registered successfully:", response);
    setIsSuccess(true);
    setPatientResponse(response);
    
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
    console.error("Error registering patient:", error);
    if (error.response && error.response.status === 403) {
      setErrorMessage("Access denied. You don't have permission to register patients as an admin. Please use the receptionist dashboard instead.");
    } else {
      setErrorMessage(error.message || "An error occurred while registering the patient. Please try again.");
    }
  };

  return (
    <DashboardLayout userType="admin" title="Register New Patient">
      <div className="bg-white shadow rounded-lg">
        {isSuccess && (
          <div className="p-4 mb-4 bg-green-100 text-green-700 rounded-lg">
            <p>Patient registered successfully! Redirecting to patients list...</p>
            {patientResponse && (
              <p className="mt-2 font-medium">Patient ID: {patientResponse.patientId}</p>
            )}
          </div>
        )}
        
        {errorMessage && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
            {errorMessage.includes("permission") && (
              <div className="mt-2">
                <button 
                  onClick={() => router.push('/receptionist/patients/register')}
                  className="text-red-700 underline"
                >
                  Go to Receptionist Dashboard
                </button>
              </div>
            )}
          </div>
        )}
        
        <PatientForm 
          onSuccess={handleSuccess} 
          onCancel={handleCancel}
          onError={handleError}
          serviceType="admin"
        />
      </div>
    </DashboardLayout>
  );
} 