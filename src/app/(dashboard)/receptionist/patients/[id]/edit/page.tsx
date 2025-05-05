"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import PatientForm from "@/components/forms/PatientForm";
import ReceptionistService from "@/services/receptionist.service";
import { formatApiError } from "@/utils/errorHandler";

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
        const data = await ReceptionistService.getPatientById(patientId);
        setPatient(data);
        setErrorMessage("");
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setErrorMessage(formatApiError(err, "Failed to load patient data"));
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const handleSuccess = (response) => {
    console.log("Patient updated successfully:", response);
    setIsSuccess(true);
    setErrorMessage("");

    // Redirect after a short delay to show success state
    setTimeout(() => {
      router.push(`/receptionist/patients/${patientId}`);
    }, 1500);
  };

  const handleCancel = () => {
    router.push(`/receptionist/patients/${patientId}`);
  };

  const handleError = (err) => {
    console.error("Error updating patient:", err);
    setErrorMessage(formatApiError(err, "Failed to update patient information"));
  };

  return (
    <DashboardLayout userType="receptionist" title="Edit Patient">
      <div className="bg-white shadow rounded-lg">
        {isSuccess && (
          <div className="p-4 mb-4 bg-green-100 text-green-700 rounded-lg">
            <p>Patient updated successfully! Redirecting...</p>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Loading patient information...</p>
          </div>
        ) : patient ? (
          <PatientForm
            patient={patient}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            onError={handleError}
            serviceType="receptionist"
          />
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">Patient not found</p>
            <button
              onClick={() => router.push("/receptionist/patients")}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Back to Patient List
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 