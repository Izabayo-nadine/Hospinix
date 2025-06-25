import { useState, useEffect } from "react";
import DataService from "../../services/data.service";
import AdminService from "../../services/admin.service";

const DoctorForm = ({ doctor = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "DOCTOR", // Fixed role for doctor form
    phoneNumber: "",
    address: "",
    gender: "Male",
    specialization: "", // This is used as specialty in the UI but stored as specialization in DB
    licenseNumber: "",
    // experience: "",
    availability: "",
    isActive: true,
    // Additional doctor-specific fields
    // patients: 0,
    nextAvailable: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [availabilities, setAvailabilities] = useState([
    "Mon, Wed, Fri",
    "Tue, Thu, Sat",
    "Mon, Tue, Thu",
    "Wed, Fri, Sat",
    "Mon-Fri",
  ]);
  const [specialties, setSpecialties] = useState([
    "Cardiology",
    "Pediatrics",
    "Neurology",
    "Orthopedics",
    "Dermatology",
    "General Medicine",
    "Gynecology",
    "Ophthalmology",
    "ENT",
  ]);

  useEffect(() => {
    // If doctor data is provided, populate the form for editing
    if (doctor) {
      console.log("Initializing edit form with doctor data:", doctor);
      setIsEdit(true);
      setFormData({
        firstName: doctor.firstName || "",
        lastName: doctor.lastName || "",
        email: doctor.email || "",
        password: "",
        confirmPassword: "",
        role: "DOCTOR",
        phoneNumber: doctor.phoneNumber || "",
        address: doctor.address || "",
        gender: doctor.gender || "Male",
        // Use specialization field from the doctor object
        specialization: doctor.specialization || "",
        licenseNumber: doctor.licenseNumber || "",
        isActive: doctor.isActive || true,
        // Additional doctor-specific fields
        // experience: doctor.experience || "",
        // patients: doctor.patients || 0,
        availability: doctor.availability || "Mon, Wed, Fri",
        nextAvailable:
          doctor.nextAvailable || new Date().toISOString().split("T")[0],
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "patients"
          ? parseInt(value) || 0
          : value,
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

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!isEdit && !formData.password)
      newErrors.password = "Password is required";
    if (!isEdit && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.specialization.trim())
      newErrors.specialization = "Specialty is required";
    if (!formData.licenseNumber.trim())
      newErrors.licenseNumber = "License number is required";
    // if (!formData.experience.trim())
    //   newErrors.experience = "Experience is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Prepare data for API call
      const doctorData = { ...formData };
      // Remove confirmPassword as it's not needed for the API
      delete doctorData.confirmPassword;

      // If editing and password is empty, remove it from the request
      if (isEdit && !doctorData.password) {
        delete doctorData.password;
      }

      // Ensure all necessary fields for a doctor are included
      doctorData.role = "DOCTOR";

      console.log("Submitting doctor data:", doctorData);

      // Make API call based on whether we're adding or updating
      let response;
      if (isEdit && doctor && doctor.id) {
        response = await AdminService.updateUser(doctor.id, doctorData);
      } else {
        response = await AdminService.createUser(doctorData);
      }

      console.log("API response:", response);

      // Call the success callback with the response data
      onSuccess(response);
    } catch (err) {
      console.error("Error saving doctor:", err);

      // Handle specific error messages from the API
      if (err.response && err.response.data && err.response.data.message) {
        setErrors((prev) => ({
          ...prev,
          form: err.response.data.message,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: "An error occurred while saving the doctor. Please try again.",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {isEdit ? "Edit Doctor" : "Add New Doctor"}
      </h2>

      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Information */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
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
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
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
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
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
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                errors.phoneNumber ? "border-red-500" : ""
              }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          {!isEdit && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Doctor-specific fields */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Specialty
            </label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                errors.specialization ? "border-red-500" : ""
              }`}
            >
              <option value="">Select a specialty</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            {errors.specialization && (
              <p className="mt-1 text-xs text-red-500">
                {errors.specialization}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              License Number
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                errors.licenseNumber ? "border-red-500" : ""
              }`}
            />
            {errors.licenseNumber && (
              <p className="mt-1 text-xs text-red-500">
                {errors.licenseNumber}
              </p>
            )}
          </div>

          {/* <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Experience
            </label>
            <input
              type="text"
              name="experience"
              placeholder="e.g., 5 years"
              value={formData.experience}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.experience ? "border-red-500" : ""
              }`}
            />
            {errors.experience && (
              <p className="mt-1 text-xs text-red-500">{errors.experience}</p>
            )}
          </div> */}

          {/* <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Patients
            </label>
            <input
              type="number"
              name="patients"
              min="0"
              value={formData.patients}
              onChange={handleChange}
              readOnly={isEdit}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                isEdit ? "bg-gray-100" : ""
              }`}
            />
            {isEdit && (
              <p className="mt-1 text-xs text-gray-500">
                Patient count is automatically updated based on appointments and
                cannot be manually edited.
              </p>
            )}
          </div> */}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Availability
            </label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
            >
              {availabilities.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Next Available Date
            </label>
            <input
              type="date"
              name="nextAvailable"
              value={formData.nextAvailable}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
            />
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status field */}
          <div className="mb-4 col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-700"
              >
                Active Doctor
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formData.isActive
                ? "Doctor will be available for appointments"
                : "Doctor will be marked as inactive and won't be available for appointments"}
            </p>
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
            {loading ? "Saving..." : isEdit ? "Update Doctor" : "Create Doctor"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorForm;
