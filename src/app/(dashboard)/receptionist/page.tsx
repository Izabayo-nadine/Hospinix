"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReceptionistService from "@/services/receptionist.service";
import { formatDateForBackend, formatTimeForDisplay } from "@/utils/dateUtils";
import { formatApiError } from "@/utils/errorHandler";

export default function ReceptionistDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState([
    { name: "Today's Appointments", value: "0" },
    { name: "Registered Patients", value: "0" },
    { name: "Available Doctors", value: "0" },
  ]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get dashboard statistics
        const statsData = await ReceptionistService.getDashboardStats();
        setStats([
          { name: "Today's Appointments", value: statsData.todayAppointments.toString() },
          { name: "Registered Patients", value: statsData.totalPatients.toString() },
          { name: "Available Doctors", value: statsData.availableDoctors.toString() },
        ]);

        // Get today's appointments
        const appointmentsData = await ReceptionistService.getTodayAppointments();
        
        // Transform the appointments data to match our UI format
        const formattedAppointments = appointmentsData.map((apt: any) => ({
          id: apt.id,
          patient: `${apt.patient.firstName} ${apt.patient.lastName}`,
          doctor: `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`,
          time: new Date(apt.appointmentDateTime).toLocaleTimeString(),
          status: apt.status,
          appointmentId: apt.appointmentId
        }));
        
        setAppointments(formattedAppointments);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(formatApiError(err, "Failed to load dashboard data. Please try again later."));
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const filteredAppointments = searchQuery 
    ? appointments.filter((app: any) => 
        app.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.status.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : appointments;
    
  const handleRegisterPatient = () => {
    router.push("/receptionist/patients/register");
  };
  
  const handleCreateAppointment = () => {
    router.push("/receptionist/appointments/new");
  };
  
  const handleManageBilling = () => {
    router.push("/receptionist/billing");
  };

  return (
    <DashboardLayout userType="receptionist" title="Receptionist Dashboard">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Today's Appointments</h2>
              <div className="flex space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search appointments..."
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
                  onClick={handleRegisterPatient}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Register New Patient
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No appointments scheduled for today.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment: any) => (
                      <tr key={appointment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.patient}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.doctor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            appointment.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.status === 'COMPLETED' ? (
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => router.push(`/receptionist/billing/new?appointmentId=${appointment.id}`)}
                            >
                              Generate Bill
                            </button>
                          ) : appointment.status === 'SCHEDULED' ? (
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => {
                                ReceptionistService.updateAppointment(appointment.id, { 
                                  status: 'CHECKED_IN' 
                                }).then(() => {
                                  window.location.reload();
                                }).catch(err => {
                                  console.error("Error updating appointment:", err);
                                });
                              }}
                            >
                              Check In
                            </button>
                          ) : (
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => router.push(`/receptionist/appointments/${appointment.id}`)}
                            >
                              Update Status
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={handleCreateAppointment}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <h3 className="font-medium">Create Appointment</h3>
                <p className="text-sm text-gray-500">Schedule a new appointment for a patient</p>
              </button>
              <button 
                onClick={handleRegisterPatient}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <h3 className="font-medium">Register Patient</h3>
                <p className="text-sm text-gray-500">Add a new patient to the system</p>
              </button>
              <button 
                onClick={handleManageBilling}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <h3 className="font-medium">Generate Bills</h3>
                <p className="text-sm text-gray-500">Create and manage patient bills</p>
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}