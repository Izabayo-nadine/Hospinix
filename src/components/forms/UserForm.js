import { useState, useEffect } from "react";
import DataService from "../../services/data.service";
import AdminService from "../../services/admin.service";

const UserForm = ({ user = null, role = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "DOCTOR",
    phoneNumber: "",
    address: "",
    gender: "Male",
    specialization: "",
    licenseNumber: "",
    isActive: true,
    qualification: "",
    shift: "Morning",
  });

  const [roles, setRoles] = useState([
    "DOCTOR",
    "PHARMACIST",
    "RECEPTIONIST",
    "ADMIN",
  ]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    // Fetch available roles
    const fetchRoles = async () => {
      try {
        const data = await DataService.getAccountTypes();
        if (data && data.length > 0) {
          setRoles(data);
        } else {
          // Keep default roles if API returns empty data
          console.warn("API returned empty roles, using defaults");
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        // Keep default roles if API fails
      }
    };

    fetchRoles();

    // If user data is provided, populate the form for editing
    if (user) {
      setIsEdit(true);
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        role: user.role || "DOCTOR",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        gender: user.gender || "Male",
        specialization: user.specialization || "",
        licenseNumber: user.licenseNumber || "",
        isActive: user.isActive || true,
        qualification: user.qualification || "",
        shift: user.shift || "Morning",
      });
    }
    // If role is provided from URL parameter, set it in the form
    else if (role) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        role: role,
      }));
    }
  }, [user, role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";

    if (formData.role === "DOCTOR" && !formData.specialization.trim()) {
      newErrors.specialization = "Specialization is required for doctors";
    }

    if (
      (formData.role === "DOCTOR" || formData.role === "PHARMACIST") &&
      !formData.licenseNumber.trim()
    ) {
      newErrors.licenseNumber = "License number is required";
    }

    if (formData.role === "PHARMACIST" && !formData.qualification.trim()) {
      newErrors.qualification = "Qualification is required for pharmacists";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Prepare data for API call
      const userData = { ...formData };
      // Remove confirmPassword as it's not needed for the API
      delete userData.confirmPassword;

      // If editing and password is empty, remove it from the request
      if (isEdit && !userData.password) {
        delete userData.password;
      }

      // Make API call based on whether we're adding or updating
      let response;
      if (isEdit) {
        // Use the user.id instead of user.userId for updating
        response = await AdminService.updateUser(user.id, userData);
      } else {
        response = await AdminService.createUser(userData);
      }

      // Call the success callback with the response data
      onSuccess(response);
    } catch (err) {
      console.error("Error saving user:", err);

      // Handle specific error messages from the API
      if (err.response && err.response.data && err.response.data.message) {
        setErrors((prev) => ({
          ...prev,
          form: err.response.data.message,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: "An error occurred while saving the user. Please try again.",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // This function extracts the Shift selector into a reusable component
  const ShiftSelector = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">Shift</label>
      <select
        name="shift"
        value={formData.shift}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="Morning">Morning</option>
        <option value="Evening">Evening</option>
        <option value="Night">Night</option>
        <option value="Rotating">Rotating</option>
      </select>
    </div>
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit User" : "Add New User"}
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
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.address ? "border-red-500" : ""
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-500">{errors.address}</p>
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

          {/* Account Information */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.role ? "border-red-500" : ""
              }`}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{errors.role}</p>
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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
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
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
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

          {/* Role-specific fields */}
          {formData.role === "DOCTOR" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.specialization ? "border-red-500" : ""
                }`}
              />
              {errors.specialization && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.specialization}
                </p>
              )}
            </div>
          )}

          {formData.role === "PHARMACIST" && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="e.g., PharmD, MSc Pharmacy, B.Pharm"
                  value={formData.qualification}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.qualification ? "border-red-500" : ""
                  }`}
                />
                {errors.qualification && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.qualification}
                  </p>
                )}
              </div>

              <ShiftSelector />
            </>
          )}

          {formData.role === "RECEPTIONIST" && <ShiftSelector />}

          {(formData.role === "DOCTOR" || formData.role === "PHARMACIST") && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.licenseNumber ? "border-red-500" : ""
                }`}
              />
              {errors.licenseNumber && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.licenseNumber}
                </p>
              )}
            </div>
          )}

          {/* Status field - always visible */}
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
                Active Account
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formData.isActive
                ? "User will have access to the system"
                : "User will be deactivated and won't be able to log in"}
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
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
