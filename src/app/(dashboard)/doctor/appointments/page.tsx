"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DoctorService from "@/services/doctor.service";
import { formatDate, formatTime } from "@/utils/dateUtils";
import { useRouter } from "next/navigation";

interface Appointment {
  id: any;
  appointmentId: any;
  patientName: string;
  patientId: any;
  date: string;
  time: string;
  status: string;
  reason: string;
  notes: string;
  originalAppointment: any;
}

export default function DoctorAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // Fetch appointments data from the API
        const appointmentsData = await DoctorService.getAppointments({
          status: statusFilter !== "all" ? statusFilter : undefined
        });
        
        console.log("Fetched appointments data:", appointmentsData);
        
        // Check the structure of the first appointment (if available)
        if (appointmentsData.length > 0) {
          console.log("First appointment example:", appointmentsData[0]);
          console.log("Patient data structure:", appointmentsData[0].patient);
        }
        
        // Transform the data for display
        const formattedAppointments = appointmentsData.map(appointment => ({
          id: appointment.id,
          appointmentId: appointment.appointmentId,
          patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          patientId: appointment.patient.patientId,
          date: formatDate(appointment.appointmentDateTime),
          time: formatTime(appointment.appointmentDateTime),
          status: appointment.status,
          reason: appointment.reasonForVisit || "Not specified",
          notes: appointment.notes || "",
          // Store the original data for reference
          originalAppointment: appointment
        }));
        
        setAppointments(formattedAppointments);
        setError("");
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [statusFilter]);

  const handleStatusChange = async (appointmentId: any, newStatus: string) => {
    try {
      await DoctorService.updateAppointment(appointmentId, { status: newStatus });
      
      // Update the local state to reflect the change
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status: newStatus } 
            : appointment
        )
      );
      
      // If the selected appointment was updated, update it too
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error("Error updating appointment status:", err);
      alert("Failed to update the appointment status. Please try again.");
    }
  };

  const handleCreatePrescription = (patientId: any) => {
    // Log the selected appointment data for debugging
    console.log("Selected appointment:", selectedAppointment);
    console.log("Original appointment data:", selectedAppointment?.originalAppointment);
    console.log("Patient data:", selectedAppointment?.originalAppointment?.patient);
    
    if (!patientId) {
      alert("No patient selected or patient ID not found");
      return;
    }

    // Get patient name for better UX
    const patientName = selectedAppointment?.patientName;
    
    console.log("Navigating to create prescription with patientId:", patientId);
    // Pass patient name and appointment ID as additional query parameters
    router.push(`/doctor/prescriptions/new?patientId=${patientId}&patientName=${encodeURIComponent(patientName || "")}&appointmentId=${selectedAppointment?.appointmentId}`);
  };

  const filteredAppointments = appointments.filter(appointment => {
    // Filter by status if not "all"
    if (statusFilter !== "all" && appointment.status !== statusFilter) {
      return false;
    }
    
    // Filter by search query if provided
    if (searchQuery && !appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <DashboardLayout userType="doctor" title="My Appointments">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              statusFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              statusFilter === "SCHEDULED"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setStatusFilter("SCHEDULED")}
          >
            Scheduled
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              statusFilter === "IN_PROGRESS"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setStatusFilter("IN_PROGRESS")}
          >
            In Progress
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              statusFilter === "COMPLETED"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setStatusFilter("COMPLETED")}
          >
            Completed
          </button>
        </div>
        <div className="relative max-w-sm">
          <input
            type="text"
            placeholder="Search patients..."
            className="border border-gray-300 rounded-md py-2 px-4 w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Appointment List</h2>
              {filteredAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No appointments found for your selected filters.</p>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-3 rounded-lg cursor-pointer ${
                        selectedAppointment?.id === appointment.id
                          ? "bg-indigo-50 border border-indigo-500"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{appointment.patientName}</h3>
                          <p className="text-sm text-gray-500">
                            {appointment.date} at {appointment.time}
                          </p>
                          <p className="text-sm text-gray-500">
                            Reason: {appointment.reason}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            appointment.status === "SCHEDULED"
                              ? "bg-blue-100 text-blue-800"
                              : appointment.status === "IN_PROGRESS"
                              ? "bg-yellow-100 text-yellow-800"
                              : appointment.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {appointment.status === "SCHEDULED"
                            ? "Scheduled"
                            : appointment.status === "IN_PROGRESS"
                            ? "In Progress"
                            : appointment.status === "COMPLETED"
                            ? "Completed"
                            : appointment.status === "CANCELLED"
                            ? "Cancelled"
                            : appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedAppointment ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">
                      {selectedAppointment.patientName}
                    </h2>
                    <p className="text-gray-500">
                      {selectedAppointment.date} at {selectedAppointment.time}
                    </p>
                    <p className="text-gray-500">
                      Patient ID: {selectedAppointment.patientId}
                    </p>
                    <p className="text-gray-500">
                      Appointment ID: {selectedAppointment.appointmentId}
                    </p>
                  </div>
                  {selectedAppointment.status !== "COMPLETED" && selectedAppointment.status !== "CANCELLED" && (
                    <div className="flex space-x-2">
                      {selectedAppointment.status === "SCHEDULED" && (
                        <button
                          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
                          onClick={() => handleStatusChange(selectedAppointment.id, "IN_PROGRESS")}
                        >
                          Start Appointment
                        </button>
                      )}
                      {selectedAppointment.status === "IN_PROGRESS" && (
                        <button
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                          onClick={() => handleStatusChange(selectedAppointment.id, "COMPLETED")}
                        >
                          Complete Appointment
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm ${
                      selectedAppointment.status === "SCHEDULED"
                        ? "bg-blue-100 text-blue-800"
                        : selectedAppointment.status === "IN_PROGRESS"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedAppointment.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : selectedAppointment.status === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Status: {selectedAppointment.status}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Reason for Visit</h3>
                    <p>{selectedAppointment.reason}</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Doctor's Notes</h3>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-3 min-h-[100px]"
                      value={selectedAppointment.notes}
                      onChange={(e) => {
                        setSelectedAppointment({
                          ...selectedAppointment,
                          notes: e.target.value,
                        });
                      }}
                      placeholder="Add notes about patient diagnosis, treatment, etc."
                    ></textarea>
                    <div className="flex justify-end mt-2">
                      <button
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
                        onClick={async () => {
                          try {
                            await DoctorService.updateAppointment(
                              selectedAppointment.id,
                              { notes: selectedAppointment.notes }
                            );
                            alert("Notes saved successfully!");
                          } catch (err) {
                            console.error("Error saving notes:", err);
                            alert("Failed to save notes. Please try again.");
                          }
                        }}
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Prescriptions</h3>
                    <div className="border border-gray-200 rounded-md p-4 flex items-center justify-center h-32">
                      <button 
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                        onClick={() => {
                          // Get patient ID from the original appointment data
                          const patientId = selectedAppointment?.originalAppointment?.patient?.id;
                          handleCreatePrescription(patientId);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Prescription
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 flex items-center justify-center h-full">
                <p className="text-gray-500">Select an appointment to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}