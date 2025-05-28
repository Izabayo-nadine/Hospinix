"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import PharmacistService from "@/services/pharmacist.service";

interface Patient {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
}

interface Doctor {
  id: string | number;
  name: string;
  specialization?: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface Prescription {
  id: string | number;
  prescriptionId?: string;
  patient?: Patient;
  patientName?: string;
  doctor?: Doctor;
  doctorName?: string;
  createdAt: string;
  status: string;
  medications?: Medication[];
  notes?: string;
  diagnosis?: string;
}

export default function PrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filling, setFilling] = useState(false);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setLoading(true);
        const data = await PharmacistService.getPrescriptionById(resolvedParams.id);
        console.log("Fetched prescription details:", data);
        setPrescription(data as Prescription);
        setError("");
      } catch (err) {
        console.error("Failed to load prescription details:", err);
        setError("Failed to load prescription details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id) {
      fetchPrescription();
    }
  }, [resolvedParams.id]);

  const handleFillPrescription = async () => {
    if (!prescription?.id) {
      setError("Invalid prescription ID");
      return;
    }
    try {
      setFilling(true);
      await PharmacistService.fillPrescription(prescription.id);
      // Refresh prescription data
      const updatedData = await PharmacistService.getPrescriptionById(prescription.id);
      setPrescription(updatedData as Prescription);
      setError("");
      // Show success message
      alert("Prescription filled successfully!");
    } catch (err) {
      console.error("Failed to fill prescription:", err);
      setError("Failed to fill prescription. Please try again.");
    } finally {
      setFilling(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <DashboardLayout userType="pharmacist" title="Prescription Details">
        <div className="text-center py-4">
          <p className="text-gray-500">Loading prescription details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="pharmacist" title="Prescription Details">
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
        <button
          onClick={handleBack}
          className="text-indigo-600 hover:text-indigo-900"
        >
          ← Back to Prescriptions
        </button>
      </DashboardLayout>
    );
  }

  if (!prescription) {
    return (
      <DashboardLayout userType="pharmacist" title="Prescription Details">
        <div className="text-center py-8">
          <p className="text-gray-500">Prescription not found.</p>
          <button
            onClick={handleBack}
            className="mt-4 text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Prescriptions
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="pharmacist" title="Prescription Details">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Prescription Details</h1>
          <div className="flex space-x-4">
            <button
              onClick={handleBack}
              className="text-indigo-600 hover:text-indigo-900"
            >
              ← Back
            </button>
            {prescription.status === "ACTIVE" && (
              <button
                onClick={handleFillPrescription}
                disabled={filling}
                className={`px-4 py-2 rounded-md text-white ${
                  filling
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {filling ? "Filling..." : "Fill Prescription"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Prescription Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-4">Prescription Information</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Prescription ID</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {prescription.prescriptionId || `RX-${prescription.id}`}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    prescription.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {prescription.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(prescription.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Patient Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-4">Patient Information</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {prescription.patient?.name || prescription.patientName || "N/A"}
                </dd>
              </div>
              {prescription.patient?.email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {prescription.patient.email}
                  </dd>
                </div>
              )}
              {prescription.patient?.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {prescription.patient.phone}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Doctor Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-4">Doctor Information</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {prescription.doctor?.name || prescription.doctorName || "N/A"}
                </dd>
              </div>
              {prescription.doctor?.specialization && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Specialization</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {prescription.doctor.specialization}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-medium mb-4">Diagnosis</h2>
              <p className="text-sm text-gray-900">{prescription.diagnosis}</p>
            </div>
          )}
        </div>

        {/* Medications */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-medium mb-4">Medications</h2>
          {prescription.medications && prescription.medications.length > 0 ? (
            <div className="space-y-4">
              {prescription.medications.map((medication, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <h3 className="font-medium text-gray-900">{medication.name}</h3>
                  <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Dosage</dt>
                      <dd className="mt-1 text-sm text-gray-900">{medication.dosage}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Frequency</dt>
                      <dd className="mt-1 text-sm text-gray-900">{medication.frequency}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Duration</dt>
                      <dd className="mt-1 text-sm text-gray-900">{medication.duration}</dd>
                    </div>
                    {medication.instructions && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Instructions</dt>
                        <dd className="mt-1 text-sm text-gray-900">{medication.instructions}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No medications prescribed.</p>
          )}
        </div>

        {/* Notes */}
        {prescription.notes && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-medium mb-4">Additional Notes</h2>
            <p className="text-sm text-gray-900">{prescription.notes}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 