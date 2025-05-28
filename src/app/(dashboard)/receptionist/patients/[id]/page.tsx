"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ReceptionistService from "@/services/receptionist.service";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { formatApiError } from "@/utils/errorHandler";
import Link from "next/link";

export default function ViewPatientPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  const patientId = params.id;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const data = await ReceptionistService.getPatientById(patientId);
        console.log("Fetched patient data:", data);
        setPatient(data);
        setError("");
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError(formatApiError(err, "Failed to load patient information"));
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const handleEditPatient = (patientId) => {
    router.push(`/receptionist/patients/${patientId}/edit`);
  };

  const handleBackToList = () => {
    router.push("/receptionist/patients");
  };

  const handleCreateAppointment = (patientId) => {
    router.push(`/receptionist/appointments/new?patientId=${patientId}`);
  };

  return (
    <DashboardLayout userType="receptionist" title="Patient Details">
      <div className="bg-white shadow rounded-lg">
        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Loading patient information...</p>
          </div>
        ) : patient ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditPatient(patientId)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Edit Patient
                </button>
                <button
                  onClick={() => handleCreateAppointment(patientId)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Create Appointment
                </button>
                <button
                  onClick={handleBackToList}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Back to List
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className=" text-gray-900 font-medium">Patient ID</p>
                    <p className="text-sm font-medium text-gray-700">{patient.patientId}</p>
                  </div>
                  <div>
                    <p className=" text-gray-700 font-medium">Status</p>
                    <p className="text-sm font-medium">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${patient.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : patient.status === "Discharged"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {patient.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className=" text-gray-900 font-medium">Date of Birth</p>
                    <p className="text-sm font-medium text-gray-700">
                      {patient.dateOfBirth ? formatDateForDisplay(patient.dateOfBirth) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className=" text-gray-900 font-medium">Gender</p>
                    <p className="text-sm font-medium text-gray-700">{patient.gender || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Blood Group</p>
                    <p className="font-medium text-gray-700">{patient.bloodGroup || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Registration Date</p>
                    <p className="text-sm font-medium text-gray-700">
                      {patient.registrationDate
                        ? formatDateForDisplay(patient.registrationDate)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className=" text-gray-900 font-medium">Email</p>
                    <p className="text-sm font-medium text-gray-700">{patient.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className=" text-gray-900 font-medium">Phone</p>
                    <p className="text-sm font-medium text-gray-700">{patient.phoneNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className=" text-gray-900 font-medium">Address</p>
                    <p className="text-sm font-medium text-gray-700">{patient.address || "N/A"}</p>
                  </div>
                  <div>
                    <p className=" text-gray-900 font-medium">Emergency Contact</p>
                    <p className=" text-sm font-medium text-gray-700">
                      {patient.emergencyContactName
                        ? `${patient.emergencyContactName} (${patient.emergencyContactRelation || "Not specified"}) - ${patient.emergencyContactPhone || "No phone"
                        }`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Medical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className=" text-gray-900 font-medium">Medical History</p>
                    <p className=" text-sm font-medium text-gray-700 whitespace-pre-line">
                      {patient.medicalHistory || "No medical history recorded"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Allergies</p>
                    <p className="text-sm font-medium text-gray-700 whitespace-pre-line">
                      {patient.allergies || "No allergies recorded"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className=" text-gray-900 font-medium">Insurance Provider</p>
                    <p className="text-sm font-medium text-gray-700">
                      {patient.insuranceProvider || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Policy Number</p>
                    <p className=" text-sm font-medium text-gray-700">
                      {patient.insurancePolicyNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className=" text-gray-900 font-medium">Expiry Date</p>
                    <p className="text-sm font-medium text-gray-700">
                      {patient.insuranceExpiryDate || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">Patient not found</p>
            <button
              onClick={handleBackToList}
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