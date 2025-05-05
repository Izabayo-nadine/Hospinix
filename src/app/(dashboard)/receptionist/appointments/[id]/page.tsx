"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ReceptionistService from "@/services/receptionist.service";

export default function EditAppointmentPage({ params }) {
  const router = useRouter();
  const appointmentId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  
  const [formData, setFormData] = useState({
    doctorId: "",
    appointmentDateTime: "",
    status: "",
    type: "",
    duration: "",
    notes: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch appointment details
        const appointmentData = await ReceptionistService.getAppointmentById(appointmentId);
        setAppointment(appointmentData);
        
        // Format appointment date and time for form
        const appointmentDate = new Date(appointmentData.appointmentDateTime);
        const dateString = appointmentDate.toISOString().split('T')[0];
        const timeString = appointmentDate.toTimeString().substring(0, 5);
        
        // Fetch available doctors
        const doctorsData = await ReceptionistService.getAvailableDoctors();
        setDoctors(doctorsData);
        
        // Set form data
        setFormData({
          doctorId: appointmentData.doctor.id,
          appointmentDate: dateString,
          appointmentTime: timeString,
          status: appointmentData.status,
          type: appointmentData.type,
          duration: appointmentData.duration,
          notes: appointmentData.notes || ""
        });
        
      } catch (err) {
        console.error("Error loading appointment data:", err);
        setErrorMessage("Failed to load appointment data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [appointmentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setErrorMessage("");
      
      // Format appointment date and time
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      
      // Prepare appointment data
      const appointmentData = {
        doctorId: formData.doctorId,
        appointmentDateTime: appointmentDateTime.toISOString(),
        status: formData.status,
        type: formData.type,
        duration: parseInt(formData.duration),
        notes: formData.notes
      };
      
      console.log("Updating appointment with data:", appointmentData);
      
      // Update appointment
      await ReceptionistService.updateAppointment(appointmentId, appointmentData);
      
      setSuccessMessage("Appointment updated successfully");
      
      // Redirect back to appointments list after a short delay
      setTimeout(() => {
        router.push("/receptionist/appointments");
      }, 2000);
      
    } catch (err) {
      console.error("Error updating appointment:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to update appointment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    try {
      setSubmitting(true);
      setErrorMessage("");
      
      console.log(`Cancelling appointment ${appointmentId}`);
      
      // Cancel appointment using status-only update
      await ReceptionistService.updateAppointment(appointmentId, { status: "CANCELLED" });
      
      setSuccessMessage("Appointment cancelled successfully");
      
      // Redirect back to appointments list after a short delay
      setTimeout(() => {
        router.push("/receptionist/appointments");
      }, 2000);
      
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to cancel appointment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout userType="receptionist" title="Edit Appointment">
      <div className="bg-white shadow rounded-lg p-6">
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
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : appointment ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Patient</label>
                <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-50">
                  {appointment.patient.firstName} {appointment.patient.lastName} ({appointment.patient.patientId})
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {appointment.patient.phoneNumber} • {appointment.patient.email}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Doctor</label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName} ({doctor.department || "General"})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Appointment Date</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Appointment Time</label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CHECKED_IN">Checked In</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Appointment Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="REGULAR">Regular Check-up</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="CONSULTATION">Consultation</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
              
              <div className="mb-4 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Additional notes or reason for appointment"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => router.push("/receptionist/appointments")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
              {formData.status !== "CANCELLED" && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  Cancel Appointment
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Appointment not found.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 