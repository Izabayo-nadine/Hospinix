"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ReceptionistService from "@/services/receptionist.service";
import { formatDateForApiQuery } from "@/utils/dateUtils";

export default function NewAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    type: "REGULAR",
    notes: "",
    duration: 30,
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch available doctors
        const doctorsData = await ReceptionistService.getAvailableDoctors();
        setDoctors(doctorsData);
        
        // Fetch patients
        const patientsData = await ReceptionistService.getPatients();
        setPatients(patientsData);
        
      } catch (err) {
        console.error("Error loading form data:", err);
        setErrorMessage("Failed to load necessary data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Effect to check doctor availability when doctor and date are selected
  useEffect(() => {
    const checkDoctorAvailability = async () => {
      if (formData.doctorId && formData.appointmentDate) {
        try {
          console.log(`Checking availability for doctor ${formData.doctorId} on ${formData.appointmentDate}`);
          
          // Use the new endpoint that uses path variables instead of query parameters
          const doctorAppointments = await ReceptionistService.getDoctorAppointmentsByDate(
            formData.doctorId, 
            formData.appointmentDate
          );
          
          console.log("Doctor appointments found:", doctorAppointments);
          console.log("Doctor appointments data type:", typeof doctorAppointments);
          console.log("Is array:", Array.isArray(doctorAppointments));
          if (Array.isArray(doctorAppointments)) {
            console.log("Number of appointments:", doctorAppointments.length);
            console.log("First appointment sample:", doctorAppointments[0]);
          }
          
          // Check if we have valid doctor appointments data
          if (!Array.isArray(doctorAppointments)) {
            console.error("Invalid doctor appointments data:", doctorAppointments);
            setErrorMessage("Failed to load doctor appointments. Please try again.");
            setAvailableTimeSlots([]);
            return;
          }
          
          // Generate available time slots (9AM to 5PM, 30 min intervals)
          const currentDuration = parseInt(formData.duration) || 30;
          console.log("Appointment duration:", currentDuration);
          
          try {
            const bookedTimes = doctorAppointments.map(apt => {
              if (!apt || !apt.appointmentDateTime) {
                console.warn("Invalid appointment data:", apt);
                return null;
              }
              
              // Store the raw date string
              console.log("Original appointment datetime:", apt.appointmentDateTime);
              
              // Normalize the date by extracting just the time portion
              // This avoids timezone issues by focusing only on hours and minutes
              let hours = 0;
              let minutes = 0;
              
              try {
                // First approach: Try to extract time from string like "2023-09-15T14:30:00"
                const timeMatch = apt.appointmentDateTime.match(/T(\d{2}):(\d{2})/);
                if (timeMatch) {
                  hours = parseInt(timeMatch[1]);
                  minutes = parseInt(timeMatch[2]);
                  console.log(`Extracted time: ${hours}:${minutes}`);
                } 
                // Second approach: Try ISO string format without T
                else if (apt.appointmentDateTime.includes(' ')) {
                  // Handle format like "2023-09-15 14:30:00"
                  const parts = apt.appointmentDateTime.split(' ');
                  if (parts.length >= 2) {
                    const timeParts = parts[1].split(':');
                    if (timeParts.length >= 2) {
                      hours = parseInt(timeParts[0]);
                      minutes = parseInt(timeParts[1]);
                      console.log(`Extracted time from space-separated format: ${hours}:${minutes}`);
                    }
                  }
                }
                // Third approach: Try parsing with the Date object
                else {
                  // Fallback to Date parsing if regex fails
                  const aptTime = new Date(apt.appointmentDateTime);
                  
                  // Verify the date parsed correctly
                  if (isNaN(aptTime.getTime())) {
                    console.error("Invalid appointment datetime:", apt.appointmentDateTime);
                    return null;
                  }
                  
                  hours = aptTime.getHours();
                  minutes = aptTime.getMinutes();
                  console.log(`Parsed time from Date: ${hours}:${minutes}`);
                }
                
                // Verify parsed time makes sense
                if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                  console.error(`Invalid time values: hours=${hours}, minutes=${minutes}`);
                  return null;
                }
              } catch (parseError) {
                console.error("Error parsing appointment time:", parseError);
                return null;
              }
              
              // Convert time to minutes since day start
              const aptMinutes = hours * 60 + minutes;
              
              // Use the appointment's duration or default to 30 minutes
              const aptDuration = apt.duration || 30;
              
              console.log(`Appointment at ${hours}:${minutes}, duration: ${aptDuration}min, minutes since day start: ${aptMinutes}`);
              
              // Return range of minutes that are blocked by this appointment
              return {
                start: aptMinutes,
                end: aptMinutes + aptDuration,
                originalTime: apt.appointmentDateTime,
                status: apt.status || "SCHEDULED" // Default to SCHEDULED if status is missing
              };
            })
            .filter(Boolean); // Remove any null values from invalid appointments
            
            console.log("Booked time ranges:", bookedTimes);
            console.log("Number of valid booked times:", bookedTimes.length);
            
            // Get active appointments (not cancelled or completed)
            const activeBookedTimes = bookedTimes.filter(
              time => time.status !== "CANCELLED" && time.status !== "COMPLETED"
            );
            console.log("Active booked times (excluding cancelled/completed):", activeBookedTimes);
            console.log("Active appointment times (minutes since day start):", activeBookedTimes.map(t => `${t.start}-${t.end} (${t.status})`));
            
            const availableTimes = [];
            
            // 9 AM to 5 PM
            for (let hour = 9; hour < 17; hour++) {
              for (let minute = 0; minute < 60; minute += 30) {
                const timeInMinutes = hour * 60 + minute;
                const slotEndTime = timeInMinutes + currentDuration;
                
                let hasConflict = false;
                
                // Check each active booking for conflicts
                for (const bookedTime of activeBookedTimes) {
                  // Check if there's any overlap between the proposed slot and booked slots
                  if (timeInMinutes < bookedTime.end && slotEndTime > bookedTime.start) {
                    console.log(`Conflict detected: Slot ${hour}:${minute.toString().padStart(2, '0')} (${timeInMinutes}-${slotEndTime}) conflicts with appointment at ${Math.floor(bookedTime.start/60)}:${(bookedTime.start%60).toString().padStart(2, '0')} (${bookedTime.start}-${bookedTime.end})`);
                    hasConflict = true;
                    break;
                  }
                }
                
                if (!hasConflict) {
                  const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                  availableTimes.push(timeString);
                  console.log(`Added available slot: ${timeString}`);
                }
              }
            }
            
            console.log("Available time slots generated:", availableTimes);
            console.log("Number of available slots:", availableTimes.length);
            
            // If no slots are available, add a fallback message
            if (availableTimes.length === 0 && activeBookedTimes.length > 0) {
              console.warn("No available time slots found for the selected date due to conflicts");
            } else if (availableTimes.length === 0) {
              // If we have no slots and no conflicts, something may be wrong with the logic
              console.warn("No available time slots were generated - adding default slots as fallback");
              // Add standard time slots as a fallback
              for (let hour = 9; hour < 17; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                  const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                  availableTimes.push(timeString);
                  console.log(`Added fallback slot: ${timeString}`);
                }
              }
            }
            
            setAvailableTimeSlots(availableTimes);
            
            // Clear selected time if not available
            if (formData.appointmentTime && !availableTimes.includes(formData.appointmentTime)) {
              setFormData(prev => ({ ...prev, appointmentTime: "" }));
            }
            
            // Restore important console logs that were accidentally removed
            console.log("Available time slots generated:", availableTimes);
            console.log("Number of available slots:", availableTimes.length);
          } catch (parseError) {
            console.error("Error parsing appointment data:", parseError);
            setErrorMessage("Error processing appointment data. Please try again.");
            setAvailableTimeSlots([]);
          }
          
        } catch (err) {
          console.error("Error checking doctor availability:", err);
          setErrorMessage("Failed to check doctor availability. Please try again.");
          setAvailableTimeSlots([]);
        }
      }
    };
    
    checkDoctorAvailability();
  }, [formData.doctorId, formData.appointmentDate, formData.duration]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.patientId) errors.patientId = "Patient is required";
    if (!formData.doctorId) errors.doctorId = "Doctor is required";
    if (!formData.appointmentDate) errors.appointmentDate = "Appointment date is required";
    if (!formData.appointmentTime) errors.appointmentTime = "Appointment time is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setErrorMessage("");
      
      // Create a proper ISO format date string that Spring can parse
      // Important: Spring's LocalDateTime.parse() needs the correct format
      const dateTimeStr = `${formData.appointmentDate}T${formData.appointmentTime}:00`;
      console.log("Formatted appointment date for submission:", dateTimeStr);
      
      // Prepare appointment data
      const appointmentData = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        appointmentDateTime: dateTimeStr,
        type: formData.type,
        duration: parseInt(formData.duration),
        notes: formData.notes,
        status: "SCHEDULED"
      };
      
      console.log("Submitting appointment data:", appointmentData);
      
      // Create appointment
      await ReceptionistService.scheduleAppointment(appointmentData);
      
      // Navigate back to appointments list
      router.push("/receptionist/appointments");
      
    } catch (err) {
      console.error("Error creating appointment:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to create appointment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout userType="receptionist" title="Schedule New Appointment">
      <div className="bg-white shadow rounded-lg p-6">
        {errorMessage && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">Patient</label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2.5 text-gray-900 ${
                    formErrors.patientId ? "border-red-500" : ""
                  }`}
                >
                  <option value="" className="text-gray-500">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id} className="text-gray-900">
                      {patient.firstName} {patient.lastName} ({patient.patientId})
                    </option>
                  ))}
                </select>
                {formErrors.patientId && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.patientId}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">Doctor</label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2.5 text-gray-900 ${
                    formErrors.doctorId ? "border-red-500" : ""
                  }`}
                >
                  <option value="" className="text-gray-500">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id} className="text-gray-900">
                      Dr. {doctor.firstName} {doctor.lastName} ({doctor.department || "General"})
                    </option>
                  ))}
                </select>
                {formErrors.doctorId && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.doctorId}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">Appointment Date</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2.5 text-gray-900 ${
                    formErrors.appointmentDate ? "border-red-500" : ""
                  }`}
                />
                {formErrors.appointmentDate && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.appointmentDate}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">Appointment Time</label>
                <select
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  disabled={!formData.doctorId || !formData.appointmentDate}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2.5 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500 ${
                    formErrors.appointmentTime ? "border-red-500" : ""
                  }`}
                >
                  <option value="" className="text-gray-500">Select Time</option>
                  {availableTimeSlots.map(time => (
                    <option key={time} value={time} className="text-gray-900">{time}</option>
                  ))}
                </select>
                {formErrors.appointmentTime && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.appointmentTime}</p>
                )}
                {availableTimeSlots.length === 0 && formData.doctorId && formData.appointmentDate && (
                  <p className="mt-1 text-sm text-amber-600">No available time slots for this date. Please select another date.</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">Appointment Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2.5 text-gray-900"
                >
                  <option value="REGULAR" className="text-gray-900">Regular Check-up</option>
                  <option value="FOLLOW_UP" className="text-gray-900">Follow-up</option>
                  <option value="EMERGENCY" className="text-gray-900">Emergency</option>
                  <option value="CONSULTATION" className="text-gray-900">Consultation</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">Duration (minutes)</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2.5 text-gray-900"
                >
                  <option value="15" className="text-gray-900">15 minutes</option>
                  <option value="30" className="text-gray-900">30 minutes</option>
                  <option value="45" className="text-gray-900">45 minutes</option>
                  <option value="60" className="text-gray-900">60 minutes</option>
                </select>
              </div>
              
              <div className="mb-4 md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2.5 text-gray-900"
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? "Scheduling..." : "Schedule Appointment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
} 