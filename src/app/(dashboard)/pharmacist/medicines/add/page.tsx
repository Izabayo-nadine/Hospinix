"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PharmacistService from "@/services/pharmacist.service";

export default function AddMedicinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [dropdownError, setDropdownError] = useState("");
  const [formData, setFormData] = useState({
    medicineId: "",
    name: "",
    category: "",
    description: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: "",
    stock: "",
    price: "",
    requiresPrescription: false,
    dosageForm: "",
    strength: "",
    companyId: "",
    distributorId: "",
  });
  const [companies, setCompanies] = useState([]);
  const [distributors, setDistributors] = useState([]);

  // Fetch companies and distributors for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setLoadingDropdowns(true);
      setDropdownError("");
      try {
        // Fetch data in parallel
        const [companiesResult, distributorsResult] = await Promise.allSettled([
          PharmacistService.getCompanies(),
          PharmacistService.getDistributors()
        ]);
        
        // Handle companies result
        if (companiesResult.status === 'fulfilled') {
          setCompanies(companiesResult.value || []);
        } else {
          console.error("Failed to load companies:", companiesResult.reason);
          // Set default companies for fallback
          setCompanies([
            { id: 'demo-1', companyId: 'COMP-001', name: 'PharmaCorp Inc.' },
            { id: 'demo-2', companyId: 'COMP-002', name: 'MediLife Labs' }
          ]);
        }
        
        // Handle distributors result
        if (distributorsResult.status === 'fulfilled') {
          setDistributors(distributorsResult.value || []);
        } else {
          console.error("Failed to load distributors:", distributorsResult.reason);
          // Set default distributors for fallback
          setDistributors([
            { id: 'demo-1', distributorId: 'DIST-001', name: 'MediLogistics' },
            { id: 'demo-2', distributorId: 'DIST-002', name: 'PharmaConnect' }
          ]);
        }
        
        // Show an error if both failed
        if (companiesResult.status === 'rejected' && distributorsResult.status === 'rejected') {
          setDropdownError("Could not load companies and distributors from the server. Using demo data instead.");
        } else if (companiesResult.status === 'rejected') {
          setDropdownError("Could not load companies from the server. Using demo data instead.");
        } else if (distributorsResult.status === 'rejected') {
          setDropdownError("Could not load distributors from the server. Using demo data instead.");
        }
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
        setDropdownError("Could not load required data. Using demo data instead.");
        
        // Set default data
        setCompanies([
          { id: 'demo-1', companyId: 'COMP-001', name: 'PharmaCorp Inc.' },
          { id: 'demo-2', companyId: 'COMP-002', name: 'MediLife Labs' }
        ]);
        setDistributors([
          { id: 'demo-1', distributorId: 'DIST-001', name: 'MediLogistics' },
          { id: 'demo-2', distributorId: 'DIST-002', name: 'PharmaConnect' }
        ]);
      } finally {
        setLoadingDropdowns(false);
      }
    };
    
    fetchData();
  }, []);

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
      if (!formData.name || !formData.category || !formData.stock || !formData.price) {
        throw new Error("Please fill all required fields");
      }

      // Format data
      const medicineData = {
        ...formData,
        medicineId: formData.medicineId || `MED-${Date.now().toString().slice(-6)}`,
        stock: parseInt(formData.stock, 10),
        price: parseFloat(formData.price),
      };

      // Submit to API
      await PharmacistService.addMedicine(medicineData);
      
      // Redirect back to medicines page
      router.push("/pharmacist");
    } catch (err) {
      console.error("Failed to add medicine:", err);
      setError(err.message || "Failed to add medicine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userType="pharmacist" title="Add New Medicine">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-6">Add New Medicine</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {dropdownError && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-md">
            {dropdownError}
          </div>
        )}
        
        {loadingDropdowns ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="ml-2 text-gray-600">Loading form data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Amoxicillin 500mg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Antibiotics"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Pfizer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.companyId || company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distributor
                </label>
                <select
                  name="distributorId"
                  value={formData.distributorId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Distributor</option>
                  {distributors.map((distributor) => (
                    <option key={distributor.id} value={distributor.distributorId || distributor.id}>
                      {distributor.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity*
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price*
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 9.99"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., BN12345"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage Form
                </label>
                <select
                  name="dosageForm"
                  value={formData.dosageForm}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Dosage Form</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Cream">Cream</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Drops">Drops</option>
                  <option value="Inhaler">Inhaler</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strength
                </label>
                <input
                  type="text"
                  name="strength"
                  value={formData.strength}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 500mg, 10ml"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiresPrescription"
                  name="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="requiresPrescription" className="ml-2 block text-sm text-gray-700">
                  Requires Prescription
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Medicine description..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? "Saving..." : "Save Medicine"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
} 