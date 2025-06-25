"use client";

import { useState, useEffect } from "react";
import AdminService from "@/services/admin.service";

export default function PharmacistForm({ pharmacist, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    gender: "",
    licenseNumber: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isEdit = !!pharmacist?.id;

  useEffect(() => {
    if (pharmacist) {
      setFormData({
        firstName: pharmacist.firstName || "",
        lastName: pharmacist.lastName || "",
        email: pharmacist.email || "",
        password: "", // Don't populate password for security
        phoneNumber: pharmacist.phoneNumber || "",
        address: pharmacist.address || "",
        gender: pharmacist.gender || "",
        licenseNumber: pharmacist.licenseNumber || "",
        isActive:
          pharmacist.isActive !== undefined ? pharmacist.isActive : true,
      });
    }
  }, [pharmacist]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!isEdit && !formData.password)
      newErrors.password = "Password is required";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.licenseNumber)
      newErrors.licenseNumber = "License number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const userData = {
        ...formData,
        role: "PHARMACIST",
      };

      let response;
      if (isEdit) {
        response = await AdminService.updateUser(pharmacist.id, userData);
      } else {
        response = await AdminService.createUser(userData);
      }

      onSuccess(response);
    } catch (err) {
      console.error("Error saving pharmacist:", err);
      setErrors({
        submit: err.message || "Failed to save pharmacist. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 text-gray-900 ${
              errors.firstName ? "border-red-500" : ""
            }`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 text-gray-900 ${
              errors.lastName ? "border-red-500" : ""
            }`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 text-gray-900 ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password {isEdit && "(Leave blank to keep current password)"}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 text-gray-900 ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 text-gray-900 ${
              errors.phoneNumber ? "border-red-500" : ""
            }`}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 text-gray-900 ${
              errors.gender ? "border-red-500" : ""
            }`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            License Number
          </label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 text-gray-900 ${
              errors.licenseNumber ? "border-red-500" : ""
            }`}
          />
          {errors.licenseNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Active</label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEdit
            ? "Update Pharmacist"
            : "Add Pharmacist"}
        </button>
      </div>
    </form>
  );
}
