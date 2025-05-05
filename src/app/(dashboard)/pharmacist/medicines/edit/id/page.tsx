"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import PharmacistService from "@/services/pharmacist.service";
import { getErrorMessage } from "@/utils/apiUtils";

export default function EditMedicinePage() {
  const router = useRouter();
  const params = useParams();
  const medicineId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [savingChanges, setSavingChanges] = useState(false);
  const [error, setError] = useState("");
  const [dropdownError, setDropdownError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [companies, setCompanies] = useState([]);
  const [distributors, setDistributors] = useState([]);
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

  // Fetch medicine details and dropdown options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingDropdowns(true);
        setError("");
        setDropdownError("");
        
        // Fetch medicine details first
        let medicineData;
        try {
          medicineData = await PharmacistService.getMedicineById(medicineId);
          if (!medicineData) {
            throw new Error("Medicine not found");
          }
        } catch (err) {
          console.error("Failed to load medicine details:", err);
          setError(getErrorMessage(err) || "Failed to load medicine details. Please try again.");
          throw err; // Rethrow to stop further execution
        }
        
        // Fetch companies and distributors in parallel
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
        
        // Show dropdown errors if needed
        if (companiesResult.status === 'rejected' && distributorsResult.status === 'rejected') {
          setDropdownError("Could not load companies and distributors. Using demo data instead.");
        } else if (companiesResult.status === 'rejected') {
          setDropdownError("Could not load companies. Using demo data instead.");
        } else if (distributorsResult.status === 'rejected') {
          setDropdownError("Could not load distributors. Using demo data instead.");
        }
        
        // Set form data with medicine details
        setFormData({
          medicineId: medicineData.medicineId || "",
          name: medicineData.name || "",
          category: medicineData.category || "",
          description: medicineData.description || "",
          manufacturer: medicineData.manufacturer || "",
          batchNumber: medicineData.batchNumber || "",
          expiryDate: medicineData.expiryDate 
            ? new Date(medicineData.expiryDate).toISOString().split('T')[0] 
            : "",
          stock: medicineData.stock !== undefined ? medicineData.stock.toString() : "",
          price: medicineData.price !== undefined ? medicineData.price.toString() : "",
          requiresPrescription: medicineData.requiresPrescription || false,
          dosageForm: medicineData.dosageForm || "",
          strength: medicineData.strength || "",
          companyId: medicineData.companyId || (medicineData.company ? medicineData.company.companyId : ""),
          distributorId: medicineData.distributorId || "",
        });
      } catch (err) {
        // Main error already set above for medicine loading failure
        console.error("Failed to complete form setup:", err);
      } finally {
        setLoading(false);
        setLoadingDropdowns(false);
      }
    };
    
    if (medicineId) {
      fetchData();
    }
  }, [medicineId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingChanges(true);
    setError("");
    setSuccessMessage("");

    try {
      // Validate form
      if (!formData.name || !formData.category || !formData.stock || !formData.price) {
        throw new Error("Please fill all required fields");
      }

      // Format data
      const medicineData = {
        ...formData,
        stock: parseInt(formData.stock, 10),
        price: parseFloat(formData.price),
      };

      // Submit to API
      await PharmacistService.updateMedicine(medicineId, medicineData);
      
      // Show success message
      setSuccessMessage("Medicine updated successfully!");
      
      // Redirect after a brief delay
      setTimeout(() => {
        router.push("/pharmacist/medicines");
      }, 2000);
    } catch (err) {
      console.error("Failed to update medicine:", err);
      setError(getErrorMessage(err) || "Failed to update medicine. Please try again.");
    } finally {
      setSavingChanges(false);
    }
  };

  const handleCancel = () => {
    router.push("/pharmacist/medicines");
  };

  if (loading) {
    return (
      <DashboardLayout userType="pharmacist" title="Edit Medicine">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="pharmacist" title="Edit Medicine">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Edit Medicine</h1>
          <div>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-2"
              disabled={savingChanges}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              disabled={savingChanges}
            >
              {savingChanges ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
        
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
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {successMessage}
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
                  Medicine ID
                </label>
                <input
                  type="text"
                  value={formData.medicineId}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              
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
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md h-32"
                  placeholder="Enter medicine description..."
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requiresPrescription"
                    name="requiresPrescription"
                    checked={formData.requiresPrescription}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="requiresPrescription" className="ml-2 block text-sm text-gray-700">
                    Requires prescription
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-2"
                disabled={savingChanges}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                disabled={savingChanges}
              >
                {savingChanges ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
} 