import React, { useState, useEffect } from "react";
import PharmacistService from "../../services/pharmacist.service";

const MedicineForm = ({ onSuccess, onCancel, medicine = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    companyId: "",
    categoryId: "",
    price: "",
    stock: "",
    dosage: "",
    sideEffects: "",
    expiryDate: "",
    batchNumber: "",
    prescriptionRequired: false,
  });

  useEffect(() => {
    // Fetch companies and categories for dropdown
    const fetchData = async () => {
      try {
        const [companiesData, categoriesData] = await Promise.all([
          PharmacistService.getAllCompanies(),
          PharmacistService.getMedicineCategories(),
        ]);

        setCompanies(companiesData || []);
        setCategories(categoriesData || []);

        // If editing existing medicine, populate form
        if (medicine) {
          setFormData({
            name: medicine.name || "",
            description: medicine.description || "",
            companyId: medicine.companyId || "",
            categoryId: medicine.categoryId || "",
            price: medicine.price || "",
            stock: medicine.stock || "",
            dosage: medicine.dosage || "",
            sideEffects: medicine.sideEffects || "",
            expiryDate: medicine.expiryDate
              ? new Date(medicine.expiryDate).toISOString().split("T")[0]
              : "",
            batchNumber: medicine.batchNumber || "",
            prescriptionRequired: medicine.prescriptionRequired || false,
          });
        }
      } catch (err) {
        console.error("Failed to fetch form data:", err);
        setError("Failed to load form data. Please try again.");
      }
    };

    fetchData();
  }, [medicine]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form
      if (
        !formData.name ||
        !formData.companyId ||
        !formData.price ||
        !formData.stock
      ) {
        throw new Error("Please fill all required fields");
      }

      // Format data
      const medicineData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
      };

      // Submit to API
      let result;
      if (medicine) {
        result = await PharmacistService.updateMedicine(
          medicine.id,
          medicineData
        );
      } else {
        result = await PharmacistService.addMedicine(medicineData);
      }

      // Handle success
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error("Failed to save medicine:", err);
      setError(err.message || "Failed to save medicine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes, mock companies and categories if none were fetched
  const mockCompanies =
    companies.length > 0
      ? companies
      : [
          { id: "1", name: "Pfizer Inc." },
          { id: "2", name: "Johnson & Johnson" },
          { id: "3", name: "Novartis" },
          { id: "4", name: "Roche" },
        ];

  const mockCategories =
    categories.length > 0
      ? categories
      : [
          { id: "1", name: "Antibiotics" },
          { id: "2", name: "Pain Relievers" },
          { id: "3", name: "Antivirals" },
          { id: "4", name: "Cardiovascular" },
        ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {medicine ? "Edit Medicine" : "Add New Medicine"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicine Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Amoxicillin 500mg"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company *
            </label>
            <select
              name="companyId"
              value={formData.companyId}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Company</option>
              {mockCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Category</option>
              {mockCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (USD) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>

          {/* Dosage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosage
            </label>
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 1 tablet twice daily"
            />
          </div>

          {/* Batch Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Number
            </label>
            <input
              type="text"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., BN12345"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Prescription Required */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="prescriptionRequired"
              checked={formData.prescriptionRequired}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Prescription Required
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter medicine description..."
          ></textarea>
        </div>

        {/* Side Effects */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Side Effects
          </label>
          <textarea
            name="sideEffects"
            value={formData.sideEffects}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter potential side effects..."
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
            {loading
              ? "Saving..."
              : medicine
              ? "Update Medicine"
              : "Add Medicine"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicineForm;
