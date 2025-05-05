"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReceptionistService from "@/services/receptionist.service";

export default function AppointmentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uniqueDates, setUniqueDates] = useState([]);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        // Fetch all appointments without date parameters to avoid JDBC issues
        const queryParams = {
          status: statusFilter !== "all" ? statusFilter : null
        };
        
        const appointmentsData = await ReceptionistService.getAppointments(queryParams);
        
        // Format appointments for display
        const formattedAppointments = appointmentsData.map(apt => ({
          id: apt.id,
          appointmentId: apt.appointmentId,
          patient: `${apt.patient.firstName} ${apt.patient.lastName}`,
          patientId: apt.patient.patientId,
          doctor: `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`,
          department: apt.doctor.department || "General",
          date: new Date(apt.appointmentDateTime).toISOString().split('T')[0],
          time: new Date(apt.appointmentDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          status: apt.status,
          reason: apt.notes || "Not specified",
          contact: apt.patient.phoneNumber || "Not available"
        }));
        
        setAppointments(formattedAppointments);
        
        // Extract unique dates for filter
        const dates = [...new Set(formattedAppointments.map(a => a.date))].sort();
        setUniqueDates(dates);
        
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
  
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      console.log(`Updating appointment ${appointmentId} status to ${newStatus}`);
      
      // Update the appointment status
      await ReceptionistService.updateAppointment(appointmentId, { status: newStatus });
      
      // Update the local state
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: newStatus } 
            : apt
        )
      );
      
      // Show success message
      setError("");
    } catch (err) {
      console.error("Error updating appointment status:", err);
      setError(`Failed to update appointment status to ${newStatus}. ${err.response?.data?.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredAppointments = appointments
    .filter(appointment => 
      (statusFilter === "all" || appointment.status === statusFilter) &&
      (dateFilter === "" || appointment.date === dateFilter) &&
      (searchQuery === "" || 
       appointment.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
       appointment.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
       appointment.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
       appointment.appointmentId.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <DashboardLayout userType="receptionist" title="Appointment Management">
      <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Appointments</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search appointments..."
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full"
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
            <div className="flex space-x-2">
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="">All Dates</option>
                {uniqueDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => router.push("/receptionist/appointments/new")}
              >
                New Appointment
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.appointmentId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium">{appointment.patient}</div>
                        <div className="text-xs">{appointment.patientId}</div>
                        <div className="text-xs">{appointment.contact}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.doctor}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{appointment.date}</div>
                        <div>{appointment.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        {appointment.status === 'SCHEDULED' && (
                          <button 
                            onClick={() => handleStatusUpdate(appointment.id, 'CHECKED_IN')}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Check In
                          </button>
                        )}
                        {appointment.status === 'CHECKED_IN' && (
                          <button 
                            onClick={() => handleStatusUpdate(appointment.id, 'COMPLETED')}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Complete
                          </button>
                        )}
                        {appointment.status === 'COMPLETED' && (
                          <button 
                            onClick={() => router.push(`/receptionist/billing/new?appointmentId=${appointment.id}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Generate Bill
                          </button>
                        )}
                        <button 
                          onClick={() => router.push(`/receptionist/appointments/${appointment.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        {(appointment.status === 'SCHEDULED' || appointment.status === 'CHECKED_IN') && (
                          <button 
                            onClick={() => handleStatusUpdate(appointment.id, 'CANCELLED')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredAppointments.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No appointments found matching your criteria.
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredAppointments.length}</span> of <span className="font-medium">{appointments.length}</span> appointments
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 