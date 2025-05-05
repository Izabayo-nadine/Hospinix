"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import DoctorService from "@/services/doctor.service";

export default function CreatePrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patientId");
  const patientNameParam = searchParams.get("patientName");
  const appointmentIdParam = searchParams.get("appointmentId");
  
  // Track whether this is coming from an appointment
  const isFromAppointment = Boolean(appointmentIdParam);
  
  const [loading, setLoading] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [formData, setFormData] = useState({
    patientId: patientIdParam || "",
    medication: "",
    dosage: "",
    frequency: "Once daily",
    duration: "",
    instructions: "",
    notes: "",
    appointmentId: appointmentIdParam || ""
  });
  
  // Load patients for dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setPatientLoading(true);
        // const patientsData = await DoctorService.getPatients();
        const patientsData = await DoctorService.getPatientsFromAppointments();

        setPatients(patientsData);
        
        console.log("Fetched patients:", patientsData);
        console.log("Patient ID from URL:", patientIdParam);
        console.log("Patient Name from URL:", patientNameParam);
        console.log("Appointment ID from URL:", appointmentIdParam);
        
        // If we have the patientId from URL, try to find the patient
        if (patientIdParam && patientsData.length > 0) {
          const patient = patientsData.find(p => p.id.toString() === patientIdParam);
          if (patient) {
            console.log("Found patient from URL parameter:", patient);
            setFormData(prev => ({
              ...prev,
              patientId: patient.id.toString()
            }));
          } else {
            console.log("Patient not found with ID:", patientIdParam);
          }
        }
        
        if (patientsData.length === 0) {
          setErrorMessage("You don't have any patients assigned to you. Please contact the receptionist to assign patients to your account.");
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
        setErrorMessage("Failed to load patients: " + (error.response?.data?.message || error.message || "Unknown error"));
      } finally {
        setPatientLoading(false);
      }
    };

    fetchPatients();
  }, [patientIdParam, patientNameParam, appointmentIdParam]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patientId) {
      setErrorMessage("Please select a patient");
      return;
    }
    
    if (!formData.medication) {
      setErrorMessage("Please enter medication name");
      return;
    }
    
    if (!formData.dosage) {
      setErrorMessage("Please enter dosage information");
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage("");
      
      // Create the prescription data object with the required fields
      const prescriptionData = {
        patientId: formData.patientId,
        patient: { id: formData.patientId }, // Add the patient object with ID for proper JPA mapping
        medication: formData.medication,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        instructions: formData.instructions,
        notes: formData.notes,
        // Include the appointment ID if available
        appointmentId: formData.appointmentId 
      };
      
      // More detailed console logging to debug the issue
      console.log("=== PRESCRIPTION DEBUG INFO ===");
      console.log("Form data:", formData);
      console.log("Sending prescription data:", prescriptionData);
      
      const response = await DoctorService.createPrescription(prescriptionData);
      console.log("Prescription created successfully with response:", response);
      
      setSuccessMessage("Prescription created successfully!");
      
      // Redirect back to prescriptions list after a longer delay to allow the backend to process
      setTimeout(() => {
        if (isFromAppointment) {
          router.push("/doctor/appointments");
        } else {
          router.push("/doctor/prescriptions");
        }
      }, 3000);  // Increased from 2000ms to 3000ms
      
    } catch (error) {
      console.error("Error creating prescription:", error);
      setErrorMessage(error.response?.data?.message || "Failed to create prescription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userType="doctor" title="Create New Prescription">
      <div className="bg-white shadow rounded-lg p-6">
        {isFromAppointment && patientNameParam && (
          <div className="p-4 mb-4 bg-blue-50 text-blue-700 rounded-lg">
            <h3 className="font-medium">Creating prescription for appointment</h3>
            <p>Patient: {patientNameParam}</p>
            <p>Appointment ID: {appointmentIdParam}</p>
          </div>
        )}
        
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
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                Patient *
              </label>
              <select
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={patientLoading || Boolean(patientIdParam)}
                required
              >
                <option value="">Select a patient</option>
                {patients.length > 0 ? (
                  patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} ({patient.patientId})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No patients assigned to you</option>
                )}
              </select>
              {patientLoading ? (
                <p className="text-sm text-gray-500 mt-1">Loading patients...</p>
              ) : patients.length === 0 && !patientLoading ? (
                <p className="text-sm text-yellow-500 mt-1">No patients are currently assigned to you. Contact the receptionist.</p>
              ) : null}
            </div>
            
            <div>
              <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-1">
                Medication *
              </label>
              <input
                type="text"
                id="medication"
                name="medication"
                value={formData.medication}
                onChange={handleChange}
                placeholder="e.g., Amoxicillin 500mg"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">
                Dosage *
              </label>
              <input
                type="text"
                id="dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                placeholder="e.g., 1 tablet"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Frequency *
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="Four times daily">Four times daily</option>
                <option value="Every 4 hours">Every 4 hours</option>
                <option value="Every 6 hours">Every 6 hours</option>
                <option value="Every 8 hours">Every 8 hours</option>
                <option value="Every 12 hours">Every 12 hours</option>
                <option value="As needed (PRN)">As needed (PRN)</option>
                <option value="Once weekly">Once weekly</option>
                <option value="Before meals">Before meals</option>
                <option value="After meals">After meals</option>
                <option value="At bedtime">At bedtime</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 10 days, 30 days, etc."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                rows={3}
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Special instructions for taking the medication, e.g., Take with food, Take on an empty stomach, etc."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional notes for the patient or pharmacy"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                if (isFromAppointment) {
                  router.push("/doctor/appointments");
                } else {
                  router.push("/doctor/prescriptions");
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Prescription"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
} 