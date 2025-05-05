"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import AdminService from "@/services/admin.service";
import DataService from "@/services/data.service";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";

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
    // Facility data initialized to zero/empty
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
        setStats(dashboardStats);

        // Fetch staff for "Recent Staff" widget
        const staffData = await AdminService.getUsers({ active: true });
        setRecentStaff(staffData.slice(0, 5)); // Just take the first 5

        // Fetch appointments data
        try {
          const appointmentsData = await DataService.getAllAppointments();
          console.log("Raw appointments data:", appointmentsData);
          setAppointments(appointmentsData.slice(0, 4)); // Just take the first 4
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
    { name: "Total Patients", value: stats.totalPatients || "0" },
    { name: "Total Doctors", value: stats.totalDoctors || "0" },
    { name: "Total Staff", value: (stats.totalPharmacists + stats.totalReceptionists) || "0" },
    { name: "Total Medicines", value: stats.totalMedicines || "0" },
  ];

  const fallbackRecentStaff = [
    { id: 1, name: "Dr. Sarah Johnson", role: "Cardiologist", status: "Active", joined: "2023-08-15" },
    { id: 2, name: "Dr. Michael Chen", role: "Neurologist", status: "Active", joined: "2023-09-01" },
    { id: 3, name: "Emily Rodriguez", role: "Receptionist", status: "Active", joined: "2023-10-12" },
    { id: 4, name: "Robert Williams", role: "Pharmacist", status: "On Leave", joined: "2023-07-22" },
    { id: 5, name: "Lisa Thompson", role: "Nurse", status: "Active", joined: "2023-11-05" },
  ];

  const fallbackAppointments = [
    { id: 1, patient: "John Doe", doctor: "Dr. Sarah Johnson", department: "Cardiology", time: "09:00 AM", date: "2023-12-15" },
    { id: 2, patient: "Jane Smith", doctor: "Dr. Michael Chen", department: "Neurology", time: "10:30 AM", date: "2023-12-15" },
    { id: 3, patient: "Robert Brown", doctor: "Dr. Alex Davis", department: "Orthopedics", time: "02:15 PM", date: "2023-12-16" },
    { id: 4, patient: "Emily Wilson", doctor: "Dr. Lisa Wong", department: "Pediatrics", time: "11:45 AM", date: "2023-12-16" },
  ];

  const displayStaff = recentStaff.length > 0 ? recentStaff : fallbackRecentStaff;
  const displayAppointments = appointments.length > 0 ? appointments : fallbackAppointments;

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fallbackStats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
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
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                selectedTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab("staff")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                selectedTab === "staff"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Staff Management
            </button>
            <button
              onClick={() => setSelectedTab("appointments")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                selectedTab === "appointments"
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hospital Overview</h3>
                <div className="col-span-12 lg:col-span-8 bg-white rounded-md shadow overflow-hidden">
                  <div className="p-4 sm:p-6 flex justify-between items-center border-b border-gray-100">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Hospital Overview</h2>
                      <p className="text-sm text-gray-500">Facility information and resources</p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex items-center">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        <span className="text-xs text-gray-500">Live Data</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">Departments</p>
                      <div className="flex items-center">
                        <h3 className="text-2xl font-bold text-gray-800">{stats.totalDepartments}</h3>
                        <div className="ml-2 bg-green-100 text-green-800 text-xs px-1 rounded flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                          <span>Live</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">Hospital Beds</p>
                      <div className="flex items-center">
                        <h3 className="text-2xl font-bold text-gray-800">{stats.hospitalBeds}</h3>
                        <div className="ml-2 bg-green-100 text-green-800 text-xs px-1 rounded flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                          <span>Live</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">Surgeries (This Month)</p>
                      <div className="flex items-center">
                        <h3 className="text-2xl font-bold text-gray-800">{stats.monthlySurgeries}</h3>
                        <div className="ml-2 bg-green-100 text-green-800 text-xs px-1 rounded flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                          <span>Live</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">Patient Satisfaction</p>
                      <div className="flex items-center">
                        <h3 className="text-2xl font-bold text-gray-800">{stats.patientSatisfaction}</h3>
                        <div className="ml-2 bg-green-100 text-green-800 text-xs px-1 rounded flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                          <span>Live</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Distribution</h3>
                <div className="bg-gray-50 p-4 rounded-lg h-full">
                  {/* These values come from the backend */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        All Staff
                        <span className="ml-1 text-xs text-green-500" title="Live data from backend">
                          (live)
                        </span>
                      </p>
                      <p className="text-xl font-semibold">
                        {(stats.totalDoctors + stats.totalPharmacists + stats.totalReceptionists) || "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        Prescriptions
                        <span className="ml-1 text-xs text-green-500" title="Live data from backend">
                          (live)
                        </span>
                      </p>
                      <p className="text-xl font-semibold">{stats.totalPrescriptions || "0"}</p>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-700 mt-4 mb-2 flex items-center">
                    Appointment Distribution
                    <span className="ml-1 text-xs text-green-500" title="Live data from backend">
                      (live)
                    </span>
                  </h4>
                  <div className="flex space-x-2 mb-2 text-xs text-gray-500">
                    <div className="flex-1">Scheduled</div>
                    <div className="flex-1">Completed</div>
                    <div className="flex-1">Cancelled</div>
                  </div>
                  <div className="h-10 flex space-x-2">
                    {/* Calculate percentages based on actual appointment data */}
                    {(() => {
                      const total = stats.totalAppointments || 1; // Avoid division by zero
                      const scheduled = Math.max(5, (stats.scheduledAppointments / total) * 100);
                      const completed = Math.max(5, (stats.completedAppointments / total) * 100);
                      const cancelled = Math.max(5, (stats.cancelledAppointments / total) * 100);
                      
                      return (
                        <>
                          <div className="flex-1">
                            <div className="bg-green-500 h-6 rounded-t text-white text-center text-xs leading-6" 
                                style={{ width: '100%', height: `${scheduled}%` }}>
                              {stats.scheduledAppointments}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="bg-blue-500 h-6 rounded-t text-white text-center text-xs leading-6" 
                                style={{ width: '100%', height: `${completed}%` }}>
                              {stats.completedAppointments}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="bg-red-500 h-6 rounded-t text-white text-center text-xs leading-6" 
                                style={{ width: '100%', height: `${cancelled}%` }}>
                              {stats.cancelledAppointments}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
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
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            staff.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    Generate Report
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
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
                            ? new Date(appointment.appointmentDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
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
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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