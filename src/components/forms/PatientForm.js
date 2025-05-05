import { useState, useEffect } from "react";
import ReceptionistService from "../../services/receptionist.service";
import AdminService from "../../services/admin.service";
import { formatDateForBackend } from "../../utils/dateUtils";
import {
  formatApiError,
  validateForm,
  validationRules,
} from "../../utils/errorHandler";

const PatientForm = ({
  patient = null,
  onSuccess,
  onCancel,
  onError,
  serviceType = "receptionist",
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "Male",
    dateOfBirth: "",
    bloodGroup: "",
    emergencyContact: "",
    medicalHistory: "",
    allergies: "",
    insuranceProvider: "",
    insuranceNumber: "",
    status: "Active",
    assignedDoctorId: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const service =
          serviceType === "admin" ? AdminService : ReceptionistService;
        const doctorsData = await service.getAvailableDoctors();
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [serviceType]);

  useEffect(() => {
    if (patient) {
      setIsEdit(true);
      setFormData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        email: patient.email || "",
        phoneNumber: patient.phoneNumber || "",
        address: patient.address || "",
        gender: patient.gender || "Male",
        dateOfBirth: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
          : "",
        bloodGroup: patient.bloodGroup || "",
        emergencyContact: patient.emergencyContact || "",
        medicalHistory: patient.medicalHistory || "",
        allergies: patient.allergies || "",
        insuranceProvider: patient.insuranceProvider || "",
        insuranceNumber: patient.insuranceNumber || "",
        status: patient.status || "Active",
        assignedDoctorId: patient.assignedDoctor
          ? patient.assignedDoctor.id
          : "",
      });
    }
  }, [patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const rules = {
      firstName: validationRules.required,
      lastName: validationRules.required,
      phoneNumber: validationRules.required,
      dateOfBirth: validationRules.required,
      email: (value) => (value ? validationRules.email(value) : null),
    };

    const newErrors = validateForm(formData, rules);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const service =
        serviceType === "admin" ? AdminService : ReceptionistService;

      const patientData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth
          ? formatDateForBackend(new Date(formData.dateOfBirth)).split("T")[0]
          : null,
      };

      if (formData.assignedDoctorId) {
        const selectedDoctor = doctors.find(
          (doctor) =>
            doctor.id.toString() === formData.assignedDoctorId.toString()
        );

        if (selectedDoctor) {
          console.log("Found selected doctor:", selectedDoctor);
          patientData.assignedDoctor = {
            id: selectedDoctor.id,
          };
          console.log("Setting assignedDoctor to:", patientData.assignedDoctor);
        } else {
          console.warn(
            "Doctor with ID",
            formData.assignedDoctorId,
            "not found in the list of available doctors"
          );
        }
      } else {
        console.log("No doctor selected, setting assignedDoctor to null");
        patientData.assignedDoctor = null;
      }

      let response;
      if (isEdit) {
        console.log(`Updating patient with ID: ${patient.patientId}`);
        response = await service.updatePatient(patient.patientId, patientData);
        console.log("Patient updated successfully:", response);
      } else {
        console.log("Registering new patient with data:", patientData);
        response = await service.registerPatient(patientData);
        console.log("Patient registered successfully:", response);
      }

      if (onSuccess && typeof onSuccess === "function") {
        onSuccess(response);
      }
    } catch (err) {
      console.error("Error saving patient:", err);

      if (onError && typeof onError === "function") {
        onError(err);
      }

      setErrors((prev) => {
        const errorMessage = formatApiError(
          err,
          `Failed to ${
            isEdit ? "update" : "register"
          } patient. Please try again.`
        );

        return {
          ...prev,
          form:
            typeof errorMessage === "string"
              ? errorMessage
              : `Failed to ${
                  isEdit ? "update" : "register"
                } patient. Please try again.`,
        };
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Patient" : "Register New Patient"}
      </h2>

      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.firstName ? "border-red-500" : ""
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.lastName ? "border-red-500" : ""
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.phoneNumber ? "border-red-500" : ""
              }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.dateOfBirth ? "border-red-500" : ""
              }`}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Emergency Contact
            </label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Medical History
            </label>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="mb-4 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Allergies
            </label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              rows="2"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Insurance Provider
            </label>
            <input
              type="text"
              name="insuranceProvider"
              value={formData.insuranceProvider}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Insurance Number
            </label>
            <input
              type="text"
              name="insuranceNumber"
              value={formData.insuranceNumber}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {isEdit && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Discharged">Discharged</option>
                <option value="Deceased">Deceased</option>
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Assigned Doctor
            </label>
            <select
              name="assignedDoctorId"
              value={formData.assignedDoctorId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={loadingDoctors}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.firstName} {doctor.lastName}
                </option>
              ))}
            </select>
            {loadingDoctors && (
              <p className="mt-1 text-sm text-gray-500">Loading doctors...</p>
            )}
            {!loadingDoctors && doctors.length === 0 && (
              <p className="mt-1 text-sm text-yellow-500">
                No doctors available. Please add doctors first.
              </p>
            )}
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
              ? "Update Patient"
              : "Register Patient"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
