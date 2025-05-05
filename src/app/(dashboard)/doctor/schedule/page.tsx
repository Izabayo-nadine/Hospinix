"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";

export default function DoctorSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // "day", "week", "month"
  
  // Days of the week for the header
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Generate the time slots (hours) for the schedule
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
  
  // In a real app, these would be fetched from an API
  const appointments = [
    { 
      id: 1, 
      title: "John Doe - Follow-up", 
      day: "Monday", 
      startTime: 9, 
      endTime: 9.5, 
      type: "Follow-up",
      status: "Confirmed" 
    },
    { 
      id: 2, 
      title: "Mary Johnson - New Patient", 
      day: "Monday", 
      startTime: 11.5, 
      endTime: 12, 
      type: "New Patient",
      status: "Confirmed" 
    },
    { 
      id: 3, 
      title: "Robert Williams - Diabetes Check", 
      day: "Tuesday", 
      startTime: 10, 
      endTime: 11, 
      type: "Follow-up",
      status: "Pending" 
    },
    { 
      id: 4, 
      title: "Jennifer Brown - Urgent Care", 
      day: "Tuesday", 
      startTime: 14.5, 
      endTime: 15, 
      type: "Urgent",
      status: "Confirmed" 
    },
    { 
      id: 5, 
      title: "Michael Davis - Surgery Follow-up", 
      day: "Wednesday", 
      startTime: 9.5, 
      endTime: 10, 
      type: "Follow-up",
      status: "Cancelled" 
    },
    { 
      id: 6, 
      title: "Emily Wilson - Initial Consultation", 
      day: "Thursday", 
      startTime: 13, 
      endTime: 14, 
      type: "New Patient",
      status: "Confirmed" 
    },
    { 
      id: 7, 
      title: "Lunch Break", 
      day: "Monday", 
      startTime: 12, 
      endTime: 13, 
      type: "Break",
      status: "Confirmed" 
    },
    { 
      id: 8, 
      title: "Lunch Break", 
      day: "Tuesday", 
      startTime: 12, 
      endTime: 13, 
      type: "Break",
      status: "Confirmed" 
    },
    { 
      id: 9, 
      title: "Lunch Break", 
      day: "Wednesday", 
      startTime: 12, 
      endTime: 13, 
      type: "Break",
      status: "Confirmed" 
    },
    { 
      id: 10, 
      title: "Lunch Break", 
      day: "Thursday", 
      startTime: 12, 
      endTime: 13, 
      type: "Break",
      status: "Confirmed" 
    },
    { 
      id: 11, 
      title: "Lunch Break", 
      day: "Friday", 
      startTime: 12, 
      endTime: 13, 
      type: "Break",
      status: "Confirmed" 
    },
    { 
      id: 12, 
      title: "Team Meeting", 
      day: "Friday", 
      startTime: 15, 
      endTime: 16, 
      type: "Meeting",
      status: "Confirmed" 
    }
  ];

  // Helper function to navigate dates
  const changeDate = (amount) => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + amount);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (7 * amount));
    } else if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + amount);
    }
    setCurrentDate(newDate);
  };

  // Get formatted date string for display
  const getFormattedDateRange = () => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    if (viewMode === "day") {
      return currentDate.toLocaleDateString('en-US', options);
    } else if (viewMode === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', options)}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  // Function to get appointments for a specific day and time
  const getAppointmentsForSlot = (day, time) => {
    return appointments.filter(
      app => app.day === day && time >= app.startTime && time < app.endTime
    );
  };

  // Check if a time slot is the start of an appointment
  const isAppointmentStart = (day, time) => {
    return appointments.some(app => app.day === day && app.startTime === time);
  };

  return (
    <DashboardLayout userType="doctor" title="My Schedule">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Schedule Management</h2>
          <div className="flex space-x-4">
            <div className="flex space-x-1">
              <button 
                onClick={() => setViewMode("day")}
                className={`px-3 py-1 rounded ${viewMode === "day" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Day
              </button>
              <button 
                onClick={() => setViewMode("week")}
                className={`px-3 py-1 rounded ${viewMode === "week" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Week
              </button>
              <button 
                onClick={() => setViewMode("month")}
                className={`px-3 py-1 rounded ${viewMode === "month" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Month
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => changeDate(-1)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="font-medium">{getFormattedDateRange()}</span>
              <button 
                onClick={() => changeDate(1)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              Add Appointment
            </button>
          </div>
        </div>
        
        {/* Weekly Schedule View */}
        <div className="overflow-x-auto">
          <div className="schedule-grid min-w-full">
            {/* Time Column */}
            <div className="grid grid-cols-[80px_repeat(7,_1fr)] border-b border-gray-200">
              <div className="border-r border-gray-200 bg-gray-50"></div>
              {daysOfWeek.map((day, index) => (
                <div 
                  key={index} 
                  className="py-3 px-2 text-center font-medium bg-gray-50"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Time Slots */}
            {timeSlots.map((hour) => (
              <div key={hour} className="grid grid-cols-[80px_repeat(7,_1fr)] border-b border-gray-200">
                <div className="border-r border-gray-200 py-3 px-2 text-sm text-gray-500 text-right">
                  {hour > 12 ? `${hour-12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </div>
                
                {daysOfWeek.map((day, dayIndex) => {
                  const appointments = getAppointmentsForSlot(day, hour);
                  const isStart = isAppointmentStart(day, hour);
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`border-r border-gray-200 py-2 px-1 relative ${
                        isStart ? 'appointment-start' : ''
                      }`}
                    >
                      {appointments.map((app) => (
                        isAppointmentStart(day, hour) && (
                          <div
                            key={app.id}
                            className={`text-xs p-1 mb-1 rounded ${
                              app.type === 'Break' || app.type === 'Meeting'
                                ? 'bg-gray-200 text-gray-800'
                                : app.status === 'Confirmed'
                                ? 'bg-indigo-100 text-indigo-800 border-l-4 border-indigo-600'
                                : app.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-600'
                                : 'bg-red-100 text-red-800 border-l-4 border-red-600'
                            }`}
                          >
                            {app.title}
                          </div>
                        )
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 