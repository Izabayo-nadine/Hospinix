"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");
  
  // In a real app, this would be fetched from an API
  const appointments = [
    { 
      id: "APT-2001", 
      patientName: "John Smith",
      patientId: "P-10045",
      doctorName: "Dr. Michael Chen",
      doctorId: "DOC-1001",
      department: "Cardiology",
      date: "2023-12-01",
      time: "09:00 AM",
      type: "Consultation",
      status: "Confirmed",
      notes: "Follow-up after surgery"
    },
    { 
      id: "APT-2002", 
      patientName: "Maria Garcia",
      patientId: "P-10089",
      doctorName: "Dr. Emily Rodriguez",
      doctorId: "DOC-1002",
      department: "Pediatrics",
      date: "2023-12-01",
      time: "10:30 AM",
      type: "Check-up",
      status: "Confirmed",
      notes: "Annual wellness check"
    },
    { 
      id: "APT-2003", 
      patientName: "Robert Johnson",
      patientId: "P-10123",
      doctorName: "Dr. Sarah Jefferson",
      doctorId: "DOC-1003",
      department: "Neurology",
      date: "2023-12-02",
      time: "11:15 AM",
      type: "Consultation",
      status: "Cancelled",
      notes: "Patient requested cancellation"
    },
    { 
      id: "APT-2004", 
      patientName: "Jennifer Lee",
      patientId: "P-10056",
      doctorName: "Dr. James Wilson",
      doctorId: "DOC-1004",
      department: "Orthopedics",
      date: "2023-12-02",
      time: "02:00 PM",
      type: "Surgery Consultation",
      status: "Confirmed",
      notes: "Pre-surgery assessment"
    },
    { 
      id: "APT-2005", 
      patientName: "William Brown",
      patientId: "P-10078",
      doctorName: "Dr. Olivia Parker",
      doctorId: "DOC-1005",
      department: "Dermatology",
      date: "2023-12-03",
      time: "03:30 PM",
      type: "Check-up",
      status: "Pending",
      notes: "Skin condition follow-up"
    },
    { 
      id: "APT-2006", 
      patientName: "Emma Wilson",
      patientId: "P-10032",
      doctorName: "Dr. Michael Chen",
      doctorId: "DOC-1001",
      department: "Cardiology",
      date: "2023-12-03",
      time: "11:00 AM",
      type: "Consultation",
      status: "Confirmed",
      notes: "Regular heart check-up"
    },
  ];

  // Get unique doctors for filter
  const doctors = [...new Set(appointments.map(apt => apt.doctorName))];

  const filteredAppointments = appointments
    .filter(appointment => 
      (statusFilter === "all" || appointment.status === statusFilter) &&
      (doctorFilter === "all" || appointment.doctorName === doctorFilter) &&
      (dateFilter === "" || appointment.date === dateFilter) &&
      (searchQuery === "" || 
       appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       appointment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
       appointment.patientId.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <DashboardLayout userType="admin" title="Appointments Management">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Appointments Schedule</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by patient, doctor, or ID..."
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
              <input
                type="date"
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
              >
                <option value="all">All Doctors</option>
                {doctors.map(doctor => (
                  <option key={doctor} value={doctor}>{doctor}</option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Schedule New
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{appointment.patientName}</div>
                    <div className="text-xs text-gray-500">{appointment.patientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{appointment.doctorName}</div>
                    <div className="text-xs text-gray-500">{appointment.doctorId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{appointment.date}</div>
                    <div>{appointment.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                      appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                      appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                    <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                      <button className="text-red-600 hover:text-red-900">Cancel</button>
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
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-gray-50">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 