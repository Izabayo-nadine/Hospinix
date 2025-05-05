"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import PatientForm from "@/components/forms/PatientForm";
import { formatApiError } from "@/utils/errorHandler";
import { safeString, debugLog } from "@/utils/debugUtils";

export default function PatientRegistrationPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = (response) => {
    // Log response for debugging
    debugLog('Patient Registration Response', response);
    
    // Check if response is an object and has the expected properties
    if (response && typeof response === 'object') {
      const firstName = safeString(response.firstName, '');
      const lastName = safeString(response.lastName, '');
      const patientId = safeString(response.patientId, '');
      
      // Ensure we're setting a string message, not an object
      setSuccessMessage(`Patient ${firstName} ${lastName} registered successfully with ID: ${patientId}`);
    } else {
      // Fallback message if response is not as expected
      setSuccessMessage("Patient registered successfully");
    }
    
    setIsSubmitting(true);
    
    // Redirect after a short delay to show the success message
    setTimeout(() => {
      router.push("/receptionist/patients");
    }, 2000);
  };

  const handleError = (error) => {
    // Log error for debugging
    debugLog('Patient Registration Error', error);
    
    // Make sure the error message is a string
    const errorMsg = formatApiError(error, "Failed to register patient. Please try again.");
    setErrorMessage(safeString(errorMsg, "An error occurred"));
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    router.push("/receptionist/patients");
  };

  return (
    <DashboardLayout userType="receptionist" title="Register New Patient">
      <div className="bg-white shadow rounded-lg">
        {errorMessage && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="p-4 mb-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        
        <PatientForm 
          onSuccess={handleSuccess}
          onError={handleError}
          onCancel={handleCancel}
          serviceType="receptionist"
        />
      </div>
    </DashboardLayout>
  );
} 