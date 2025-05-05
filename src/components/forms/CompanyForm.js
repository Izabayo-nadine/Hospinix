import React, { useState, useEffect } from "react";
import PharmacistService from "../../services/pharmacist.service";

const CompanyForm = ({ onSuccess, onCancel, company = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    contactPerson: "",
    registrationNumber: "",
    website: "",
  });

  useEffect(() => {
    // If editing existing company, populate form
    if (company) {
      setFormData({
        name: company.name || "",
        email: company.email || "",
        phone: company.phone || "",
        address: company.address || "",
        description: company.description || "",
        contactPerson: company.contactPerson || "",
        registrationNumber: company.registrationNumber || "",
        website: company.website || "",
      });
    }
  }, [company]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.phone) {
        throw new Error("Please fill all required fields");
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Phone validation
      const phoneRegex = /^\+?[0-9\s\-\(\)]{7,15}$/;
      if (!phoneRegex.test(formData.phone)) {
        throw new Error("Please enter a valid phone number");
      }

      // Submit to API
      let result;
      if (company) {
        result = await PharmacistService.updateCompany(company.id, formData);
      } else {
        result = await PharmacistService.addCompany(formData);
      }

      // Handle success
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error("Failed to save company:", err);
      setError(err.message || "Failed to save company. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {company ? "Edit Company" : "Add New Company"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Pfizer Inc."
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., contact@company.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., +1 (123) 456-7890"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., https://www.company.com"
            />
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., John Smith"
            />
          </div>

          {/* Registration Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Number
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., REG123456"
            />
          </div>
        </div>

        {/* Address */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows="2"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter full company address..."
          ></textarea>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter company description..."
          ></textarea>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? "Saving..." : company ? "Update Company" : "Add Company"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;
