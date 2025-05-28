import { useState, useEffect } from "react";
import DataService from "../../services/data.service";
import ReceptionistService from "../../services/receptionist.service";

const AppointmentForm = ({ appointment = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    duration: 30,
    reason: "",
    notes: "",
    status: "SCHEDULED",
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients and doctors in parallel
        const [patientsData, doctorsData] = await Promise.all([
          DataService.getAllPatients(),
          DataService.getAllDoctors(),
        ]);

        setPatients(patientsData);
        setDoctors(doctorsData);

        // If appointment data is provided, populate the form for editing
        if (appointment) {
          setIsEdit(true);
          // Format date and time from the ISO string
          const dateTime = new Date(appointment.appointmentDateTime);
          const formattedDate = dateTime.toISOString().split("T")[0];
          const formattedTime = dateTime.toTimeString().slice(0, 5);

          setFormData({
            patientId: appointment.patientId || "",
            doctorId: appointment.doctorId || "",
            appointmentDate: formattedDate,
            appointmentTime: formattedTime,
            duration: appointment.duration || 30,
            reason: appointment.reason || "",
            notes: appointment.notes || "",
            status: appointment.status || "SCHEDULED",
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setErrors((prev) => ({
          ...prev,
          form: "Failed to load data. Please refresh the page and try again.",
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [appointment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.patientId) newErrors.patientId = "Patient is required";
    if (!formData.doctorId) newErrors.doctorId = "Doctor is required";
    if (!formData.appointmentDate)
      newErrors.appointmentDate = "Appointment date is required";
    if (!formData.appointmentTime)
      newErrors.appointmentTime = "Appointment time is required";
    if (!formData.reason.trim())
      newErrors.reason = "Reason for appointment is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Combine date and time into datetime string
      const appointmentDateTime = `${formData.appointmentDate}T${formData.appointmentTime}:00`;

      const appointmentData = {
        ...formData,
        appointmentDateTime,
      };

      // Remove separate date and time as they are not needed for the API
      delete appointmentData.appointmentDate;
      delete appointmentData.appointmentTime;

      // Make API call based on whether we're adding or updating
      let response;
      if (isEdit) {
        response = await ReceptionistService.updateAppointment(
          appointment.appointmentId,
          appointmentData
        );
      } else {
        response = await ReceptionistService.scheduleAppointment(
          appointmentData
        );
      }

      // Call the success callback with the response data
      onSuccess(response);
    } catch (err) {
      console.error("Error saving appointment:", err);

      // Handle specific error messages from the API
      if (err.response && err.response.data && err.response.data.message) {
        setErrors((prev) => ({
          ...prev,
          form: err.response.data.message,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: "An error occurred while saving the appointment. Please try again.",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Appointment" : "Schedule New Appointment"}
      </h2>

      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Patient
            </label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                errors.patientId ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.patientId} value={patient.patientId}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className="mt-1 text-xs text-red-500">{errors.patientId}</p>
            )}
          </div>

          {/* Doctor Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Doctor
            </label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                errors.doctorId ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.userId} value={doctor.userId}>
                  Dr. {doctor.firstName} {doctor.lastName}
                  {doctor.specialization ? ` (${doctor.specialization})` : ""}
                </option>
              ))}
            </select>
            {errors.doctorId && (
              <p className="mt-1 text-xs text-red-500">{errors.doctorId}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Appointment Date
            </label>
            <input
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                errors.appointmentDate ? "border-red-500" : ""
              }`}
            />
            {errors.appointmentDate && (
              <p className="mt-1 text-xs text-red-500">
                {errors.appointmentDate}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Appointment Time
            </label>
            <input
              type="time"
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                errors.appointmentTime ? "border-red-500" : ""
              }`}
            />
            {errors.appointmentTime && (
              <p className="mt-1 text-xs text-red-500">
                {errors.appointmentTime}
              </p>
            )}
          </div>

          {/* Duration */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Duration (minutes)
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          {/* Status (for edit mode) */}
          {isEdit && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>
          )}

          {/* Reason */}
          <div className="mb-4 col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Reason for Appointment
            </label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                errors.reason ? "border-red-500" : ""
              }`}
              placeholder="e.g., Annual checkup, Follow-up, Consultation"
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-red-500">{errors.reason}</p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-4 col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
              placeholder="Any special requirements or notes for this appointment"
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Appointment"
              : "Schedule Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
