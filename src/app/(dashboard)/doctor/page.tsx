"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DoctorService from "@/services/doctor.service";
import { formatDateForDisplay } from "@/utils/dateUtils";

export default function DoctorDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState([
    { name: "Today's Appointments", value: "0" },
    { name: "Active Patients", value: "0" },
    { name: "Total Prescriptions", value: "0" },
  ]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const statsData = await DoctorService.getDashboardStats();
        console.log("Dashboard stats response:", statsData);
        
        // Transform the stats for UI
        const formattedStats = [
          { name: "Today's Appointments", value: statsData.todayAppointments?.toString() || "0" },
          { name: "Active Patients", value: statsData.totalPatients?.toString() || "0" },
          { name: "Total Prescriptions", value: statsData.totalPrescriptions?.toString() || "0" },
        ];
        
        setStats(formattedStats);
        
        // Fetch today's appointments
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Format dates in ISO format with 'T' separator
        const formattedToday = today.toISOString().split('.')[0];
        const formattedTomorrow = tomorrow.toISOString().split('.')[0];
        
        console.log('Fetching appointments with dates:', {
          startDate: formattedToday,
          endDate: formattedTomorrow
        });

        const user = localStorage.getItem('user');
        const doctorId = JSON.parse(user || '{}').id;
        console.log("this is the doctorId: "+doctorId);
        const appointmentsData = await DoctorService.getTodayAppointments(doctorId);
        
        console.log('Received appointments data:', appointmentsData);
        
        // Transform the appointments for UI
        const formattedAppointments = appointmentsData.map((appointment: any) => ({
          id: appointment.id,
          patient: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          age: appointment.patient.dateOfBirth ? calculateAge(appointment.patient.dateOfBirth) : "--",
          time: formatTime(appointment.appointmentDateTime),
          status: getDisplayStatus(appointment.status),
          issue: appointment.notes || "Not specified",
          rawStatus: appointment.status,
          patientId: appointment.patient.id
        }));
        
        setAppointments(formattedAppointments);
        setError("");
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string | number | Date) => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Helper function to format time
  const formatTime = (dateTime: string | number | Date) => {
    if (!dateTime) return "--";
    const date = new Date(dateTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Helper function to get display status
  const getDisplayStatus = (status: any) => {
    switch (status) {
      case "SCHEDULED": return "Waiting";
      case "IN_PROGRESS": return "In Consultation";
      case "COMPLETED": return "Completed";
      case "CANCELLED": return "Cancelled";
      default: return status;
    }
  };

  const handleStartConsultation = async (appointmentId: any) => {
    try {
      await DoctorService.completeAppointment(appointmentId, "Started consultation");
      // Refresh the appointments
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Format dates in ISO format with 'T' separator
      const formattedToday = today.toISOString().split('.')[0];
      const formattedTomorrow = tomorrow.toISOString().split('.')[0];
      
      const appointmentsData = await DoctorService.getAppointments({
        startDate: formattedToday,
        endDate: formattedTomorrow,
      });
      
      // Transform the appointments for UI
      const formattedAppointments = appointmentsData.map((appointment: any) => ({
        id: appointment.id,
        patient: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        age: appointment.patient.dateOfBirth ? calculateAge(appointment.patient.dateOfBirth) : "--",
        time: formatTime(appointment.appointmentDateTime),
        status: getDisplayStatus(appointment.status),
        issue: appointment.notes || "Not specified",
        rawStatus: appointment.status,
        patientId: appointment.patient.id
      }));
      
     setAppointments(formattedAppointments);
    } catch (err) {
      console.error("Error updating appointment:", err);
      alert("Failed to update appointment status.");
    }
  };
  
  const handleEndConsultation = async (appointmentId: any) => {
    try {
      await DoctorService.completeAppointment(appointmentId, "Consultation completed");
      // Refresh the appointments
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Format dates in ISO format with 'T' separator
      const formattedToday = today.toISOString().split('.')[0];
      const formattedTomorrow = tomorrow.toISOString().split('.')[0];
      const user = localStorage.getItem('user');
      const doctorId = JSON.parse(user || '{}').id;
      console.log(doctorId);
      const appointmentsData = await DoctorService.getTodayAppointments(doctorId);
      
      // Transform the appointments for UI
      const formattedAppointments = appointmentsData.map((appointment: any) => ({
        id: appointment.id,
        patient: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        age: appointment.patient.dateOfBirth ? calculateAge(appointment.patient.dateOfBirth) : "--",
        time: formatTime(appointment.appointmentDateTime),
        status: getDisplayStatus(appointment.status),
        issue: appointment.notes || "Not specified",
        rawStatus: appointment.status,
        patientId: appointment.patient.id
      }));
      
      setAppointments(formattedAppointments);
    } catch (err) {
      console.error("Error updating appointment:", err);
      alert("Failed to update appointment status.");
    }
  };
  
  const handleViewSummary = (appointmentId: any) => {
    router.push(`/doctor/appointments/${appointmentId}`);
  };
  
  const handleCreatePrescription = (patientId: any) => {
    router.push(`/doctor/prescriptions/new?patientId=${patientId}`);
  };

  const filteredAppointments = searchQuery 
    ? appointments.filter((app: any) => 
        app.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : appointments;

  return (
    <DashboardLayout userType="doctor" title="Doctor Dashboard">
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
              {loading ? (
                <dd className="mt-1 text-3xl font-semibold text-gray-400">...</dd>
              ) : (
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Today's Patient Schedule</h2>
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients..."
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
            <button 
              onClick={() => router.push('/doctor/prescriptions/new')}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create Prescription
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Loading appointments...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chief Complaint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment: any) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.patient}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.issue}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'In Consultation' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'Waiting' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.status === 'Completed' ? (
                          <button 
                            onClick={() => handleViewSummary(appointment.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Summary
                          </button>
                        ) : appointment.status === 'Waiting' ? (
                          <button 
                            onClick={() => handleStartConsultation(appointment.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Start Consultation
                          </button>
                        ) : appointment.status === 'In Consultation' ? (
                          <button 
                            onClick={() => handleEndConsultation(appointment.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            End Consultation
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleCreatePrescription(appointment.patientId)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Create Prescription
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No appointments scheduled for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => router.push('/doctor/prescriptions/new')}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <h3 className="font-medium">Create Prescription</h3>
            <p className="text-sm text-gray-500">Write a new prescription for a patient</p>
          </button>
          <button 
            onClick={() => router.push('/doctor/patients')}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <h3 className="font-medium">View Patient History</h3>
            <p className="text-sm text-gray-500">Access patient medical records and history</p>
          </button>
          <button 
            onClick={() => router.push('/doctor/appointments')}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <h3 className="font-medium">Manage Appointments</h3>
            <p className="text-sm text-gray-500">View and manage your appointment schedule</p>
          </button>
          <button 
            onClick={() => router.push('/doctor/beds')}
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
          >
            <h3 className="font-medium">Bed Management</h3>
            <p className="text-sm text-gray-500">View and manage hospital beds and patient assignments</p>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
} 