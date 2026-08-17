"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import AdminService from "@/services/admin.service";
import DataService from "@/services/data.service";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import PieChart from "@/components/PieChart";

export default function AdminDashboard() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalDoctors: number;
    totalPharmacists: number;
    totalReceptionists: number;
    totalPatients: number;
    activePatients: number;
    dischargedPatients: number;
    totalAppointments: number;
    scheduledAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalMedicines: number;
    totalCompanies: number;
    totalPrescriptions: number;
    // Facility data from backend
    totalDepartments: number;
    hospitalBeds: number;
    monthlySurgeries: number;
    patientSatisfaction: string;
  }>({
    totalDoctors: 0,
    totalPharmacists: 0,
    totalReceptionists: 0,
    totalPatients: 0,
    activePatients: 0,
    dischargedPatients: 0,
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalMedicines: 0,
    totalCompanies: 0,
    totalPrescriptions: 0,
    totalDepartments: 0,
    hospitalBeds: 0,
    monthlySurgeries: 0,
    patientSatisfaction: '',
  });
  const [recentStaff, setRecentStaff] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Check if user is authenticated
    const user = AuthService.getCurrentUser();
    if (!user || user.role.toLowerCase() !== 'admin') {
      router.push('/login');
      return;
    }

    // Check if a refresh is needed from localStorage flag
    const refreshNeeded = localStorage.getItem('dashboard_refresh_needed');
    if (refreshNeeded === 'true') {
      // Clear the flag
      localStorage.removeItem('dashboard_refresh_needed');
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch dashboard statistics from DataService instead of AdminService
        const dashboardStats = await DataService.getDashboardStats();

        // Ensure numeric values for key stats
        const safeStats = {
          ...dashboardStats,
          totalDoctors: Number(dashboardStats.totalDoctors) || 0,
          totalPharmacists: Number(dashboardStats.totalPharmacists) || 0,
          totalReceptionists: Number(dashboardStats.totalReceptionists) || 0,
          totalPatients: Number(dashboardStats.totalPatients) || 0,
          totalAppointments: Number(dashboardStats.totalAppointments) || 0,
          totalMedicines: Number(dashboardStats.totalMedicines) || 0,
        };
        setStats(safeStats);

        // Fetch staff for "Recent Staff" widget
        const staffData = await AdminService.getUsers({ active: true });
        setRecentStaff(staffData.slice(0, 5)); // Just take the first 5

        // Fetch appointments data
        try {
          const appointmentsData = await DataService.getAllAppointments();
          console.log("Raw appointments data:", appointmentsData);
          setAppointments(appointmentsData);
        } catch (err) {
          console.error('Error loading appointments data:', err);
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please refresh to try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Fallback data if API fails
  const fallbackStats = [
    { name: "Total Patients", value: stats.totalPatients || "0", bg: "bg-blue-50", text: "text-blue-700" },
    { name: "Total Doctors", value: stats.totalDoctors || "0", bg: "bg-indigo-50", text: "text-indigo-700" },
    { name: "Total Staff", value: (stats.totalPharmacists + stats.totalReceptionists + stats.totalDoctors) || "0", bg: "bg-purple-50", text: "text-purple-700" },
    { name: "Total Medicines", value: stats.totalMedicines || "0", bg: "bg-green-50", text: "text-green-700" },
  ];

  const fallbackRecentStaff = [
    { id: 1, name: "Dr. Sarah Johnson", role: "Cardiologist", status: "Active", joined: "2023-08-15" },
    { id: 2, name: "Dr. Michael Chen", role: "Neurologist", status: "Active", joined: "2023-09-01" },
    { id: 3, name: "Emily Rodriguez", role: "Receptionist", status: "Active", joined: "2023-10-12" },
    { id: 4, name: "Robert Williams", role: "Pharmacist", status: "On Leave", joined: "2023-07-22" },
    { id: 5, name: "Lisa Thompson", role: "Nurse", status: "Active", joined: "2023-11-05" },
  ];

  const displayStaff = recentStaff.length > 0 ? recentStaff : fallbackRecentStaff;

  // Filter appointments to only show future or today's appointments
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today

  const filteredAppointments = appointments.length > 0
    ? appointments.filter((app: any) => {
      const appDate = app.appointmentDateTime ? new Date(app.appointmentDateTime) : new Date(app.appointmentDate);
      return appDate >= now;
    }).sort((a: any, b: any) => {
      const dateA = a.appointmentDateTime ? new Date(a.appointmentDateTime) : new Date(a.appointmentDate);
      const dateB = b.appointmentDateTime ? new Date(b.appointmentDateTime) : new Date(b.appointmentDate);
      return dateA.getTime() - dateB.getTime();
    })
    : [];

  // Only show real appointments - no fallback data
  const displayAppointments = filteredAppointments;

  const handleDeleteStaff = async (id) => {
    if (confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) {
      try {
        await AdminService.deleteUser(id);

        // Refresh both staff data and dashboard statistics
        const staffData = await AdminService.getUsers({ active: true });
        setRecentStaff(staffData.slice(0, 5)); // Just take the first 5

        // Refresh dashboard statistics
        const dashboardStats = await AdminService.getDashboardStats();
        setStats(dashboardStats);
      } catch (err) {
        console.error("Error deleting staff:", err);
        setError("Failed to delete staff. Please try again.");
      }
    }
  };

  const handleToggleStaffActivation = async (id, currentActiveStatus) => {
    try {
      // Log the current status and what we're changing it to
      console.log(`Toggling staff activation - Current status: ${currentActiveStatus}, changing to: ${!currentActiveStatus}`);

      // Use explicit Boolean conversion to avoid any type issues
      const updateData = {
        isActive: Boolean(!currentActiveStatus)
      };

      console.log('Update payload:', updateData);

      await AdminService.updateUser(id, updateData);

      // Refresh both staff data and dashboard statistics
      const staffData = await AdminService.getUsers({ active: true });
      setRecentStaff(staffData.slice(0, 5)); // Just take the first 5

      // Refresh dashboard statistics
      const dashboardStats = await AdminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      console.error("Error updating staff status:", err);
      setError("Failed to update staff status. Please try again.");
    }
  };

  const handleGenerateReport = () => {
    // Added meaningful columns based on user request (e.g. Payment Status)
    const headers = ["Appointment ID", "Patient", "Doctor", "Department", "Date", "Time", "Status", "Payment Status", "Notes"];
    const rows = displayAppointments.map(app => {
      const patientName = app.patient ? `${app.patient.firstName || ''} ${app.patient.lastName || ''}`.trim() : (app.patientName || "Unknown");
      const doctorName = app.doctor ? `Dr. ${app.doctor.firstName || ''} ${app.doctor.lastName || ''}`.trim() : (app.doctorName || "Unknown");
      const department = app.department || (app.doctor?.specialization) || "General";
      const date = app.appointmentDateTime ? new Date(app.appointmentDateTime).toLocaleDateString() : (app.appointmentDate || "N/A");
      const time = app.appointmentDateTime ? new Date(app.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (app.appointmentTime || "N/A");
      const status = app.status || "Scheduled";

      // Mock data for columns that might not exist in the basic API response yet
      const paymentStatus = "Pending";
      const notes = app.notes || "No additional notes";

      return [app.id || app.appointmentId || "N/A", patientName, doctorName, department, date, time, status, paymentStatus, notes];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `financial_appointment_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to format currency
  const formatCurrency = (amount: any) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const financialStats = [
    { label: "Total Revenue", value: formatCurrency(stats['totalRevenue'] || 0), change: "+12%", trend: "up" },
    { label: "Paid Revenue", value: formatCurrency(stats['paidRevenue'] || 0), change: "+8%", trend: "up" },
    { label: "Pending (Receivables)", value: formatCurrency(stats['pendingRevenue'] || 0), change: "-2%", trend: "down" },
    { label: "Net Profit (Est.)", value: formatCurrency(stats['netProfit'] || 0), change: "+15%", trend: "up" },
  ];

  if (loading) {
    return (
      <DashboardLayout userType="admin" title="Admin Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-indigo-500 border-b-indigo-700 border-l-indigo-500 border-r-indigo-700 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin" title="Admin Dashboard">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block">{error}</span>
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fallbackStats.map((stat) => (
          <div key={stat.name} className={`bg-white overflow-hidden shadow rounded-lg border-l-4 ${stat.name === "Total Patients" ? 'border-blue-500' : stat.name === "Total Doctors" ? 'border-indigo-500' : stat.name === "Total Staff" ? 'border-purple-500' : 'border-green-500'}`}>
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setSelectedTab("overview")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === "overview"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab("staff")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === "staff"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Staff Management
            </button>
            <button
              onClick={() => setSelectedTab("appointments")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${selectedTab === "appointments"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Appointments
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === "overview" && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Overview</h3>
                <div className="bg-white rounded-md shadow overflow-hidden">
                  <div className="grid grid-cols-2 gap-4 p-4 sm:p-6">
                    {financialStats.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                        <div className="flex items-end justify-between">
                          <h3 className="text-xl font-bold text-gray-800">{item.value}</h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {item.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 bg-white rounded-md shadow overflow-hidden p-6">
                  <h3 className="text-md font-medium text-gray-900 mb-2">Hospital Occupancy</h3>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">General Ward</span>
                      <span className="text-sm font-medium text-gray-700">75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">ICU</span>
                      <span className="text-sm font-medium text-gray-700">40%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Distribution</h3>
                <PieChart
                  data={{
                    labels: ['Doctors', 'Pharmacists', 'Receptionists', 'Patients', 'Appointments', 'Medicines'],
                    values: [
                      stats.totalDoctors,
                      stats.totalPharmacists,
                      stats.totalReceptionists,
                      stats.totalPatients,
                      stats.totalAppointments,
                      stats.totalMedicines
                    ]
                  }}
                  title="System Data"
                />
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-800 text-center">
                    Total System Records: {
                      stats.totalDoctors + stats.totalPharmacists + stats.totalReceptionists + stats.totalPatients + stats.totalAppointments + stats.totalMedicines
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedTab === "staff" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Staff Management</h3>
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  onClick={() => router.push('/admin/staff/new')}
                >
                  Add New Staff
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayStaff.map((staff) => (
                      <tr key={staff.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.firstName} {staff.lastName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staff.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {staff.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            onClick={() => router.push(`/admin/staff/${staff.id}`)}
                          >
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteStaff(staff.id)}>Delete</button>
                          <button
                            className="text-indigo-600 hover:text-indigo-900 ml-3"
                            onClick={() => handleToggleStaffActivation(staff.id, staff.isActive)}
                          >
                            {staff.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === "appointments" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
                <div className="flex space-x-2">
                  <select className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option>All Departments</option>
                    <option>Cardiology</option>
                    <option>Neurology</option>
                    <option>Orthopedics</option>
                    <option>Pediatrics</option>
                  </select>
                  <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    onClick={handleGenerateReport}
                  >
                    Generate Report
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {displayAppointments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming appointments</h3>
                    <p className="mt-1 text-sm text-gray-500">Appointments will appear here when receptionists register patients and schedule them.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayAppointments.map((appointment) => (
                        <tr key={appointment.id || appointment.appointmentId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {appointment.patient ? (
                              // If proper patient object exists
                              `${appointment.patient.firstName || ''} ${appointment.patient.lastName || ''}`.trim() || 'Unknown Patient'
                            ) : (
                              // Fallback display options
                              appointment.patientName ||
                              (appointment.firstName && appointment.lastName &&
                                `${appointment.firstName} ${appointment.lastName}`) ||
                              "Unknown Patient"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {appointment.doctor ? (
                              // If proper doctor object exists
                              `Dr. ${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}`.trim() || 'Unknown Doctor'
                            ) : (
                              // Fallback display options
                              appointment.doctorName || "Dr. Unknown"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {appointment.department ||
                              (appointment.doctor && appointment.doctor.specialization) ||
                              "General"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {appointment.appointmentDateTime
                              ? new Date(appointment.appointmentDateTime).toLocaleDateString()
                              : appointment.appointmentDate || new Date().toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {appointment.appointmentDateTime
                              ? new Date(appointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : appointment.appointmentTime || "9:00 AM"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${appointment.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                  appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                              {appointment.status || 'Scheduled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {/* START FIX: Edit/Cancel Buttons */}
                            <button
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                              onClick={() => {
                                // Ensure ID is passed correctly
                                const id = appointment.id || appointment.appointmentId;
                                if (id) {
                                  router.push(`/admin/appointments/${id}`);
                                } else {
                                  console.error("No appointment ID found");
                                }
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => {
                                if (confirm("Are you sure you want to cancel this appointment?")) {
                                  const id = appointment.id || appointment.appointmentId;
                                  console.log("Cancel appointment", id);

                                  // Call cancel service if available
                                  if (id) {
                                    // Mock cancellation or call actual service
                                    alert("Cancellation logic would run here for ID: " + id);
                                  }
                                }
                              }}
                            >
                              Cancel
                            </button>
                            {/* END FIX */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            onClick={() => router.push('/admin/doctors')}
          >
            <h3 className="font-medium">Manage Doctors</h3>
            <p className="text-sm text-gray-500">Add or update doctor information</p>
          </button>
          <button
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            onClick={() => router.push('/admin/staff')}
          >
            <h3 className="font-medium">Staff Management</h3>
            <p className="text-sm text-gray-500">Add or manage all staff members</p>
          </button>
          <button
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            onClick={() => router.push('/admin/patients')}
          >
            <h3 className="font-medium">Patient Management</h3>
            <p className="text-sm text-gray-500">Register and manage patients</p>
          </button>
          <button
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            onClick={() => router.push('/admin/departments')}
          >
            <h3 className="font-medium">Department Settings</h3>
            <p className="text-sm text-gray-500">Manage hospital departments</p>
          </button>
          <button
            className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            onClick={() => router.push('/admin/settings')}
          >
            <h3 className="font-medium">System Settings</h3>
            <p className="text-sm text-gray-500">Update system configurations</p>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}