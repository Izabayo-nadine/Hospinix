"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import PharmacistService from "@/services/pharmacist.service";
import { getErrorMessage } from "@/utils/apiUtils";
import { useRouter } from "next/navigation";

interface Distributor {
  id: string | number;
  distributorId: string;
  name: string;
  logoUrl?: string;
  region: string;
  headquarters?: string;
  areas: string[];
  contactName?: string;
  contactTitle?: string;
  phone: string;
  email?: string;
  website?: string;
  relationshipSince?: string;
  contractStatus?: string;
  contractRenewal?: string;
  deliveryTime?: string;
  rating?: number;
  reliability?: string;
  lastDelivery?: string;
  paymentTerms?: string;
  specialties?: string[];
}

interface Medicine {
  id: string | number;
  medicineId?: string;
  name: string;
  category: string;
  stock: number;
  stockStatus?: string;
  reorderLevel?: number;
  expiry?: string;
  expiryDate?: string;
  price?: number;
  requiresPrescription?: boolean;
  company?: string;
  companyId?: string | number;
  distributorId?: string | number;
}

export default function PharmacistDistributors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMedicinesModal, setShowMedicinesModal] = useState(false);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [distributorMedicines, setDistributorMedicines] = useState<Medicine[]>([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    headquarters: "",
    contactName: "",
    contactTitle: "",
    phone: "",
    email: "",
    website: "",
    areas: "",
    contractStatus: "Active",
    deliveryTime: "",
    specialties: ""
  });
  const router = useRouter();
  
  useEffect(() => {
    fetchDistributors();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchDistributors = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Try to fetch from API
      const data = await PharmacistService.getDistributors();
      setDistributors(data || []);
      
    } catch (err) {
      console.error("Error fetching distributors:", err);
      setError(getErrorMessage(err) || "Failed to load distributors data");
      
      // Fallback data for development/demo
      setDistributors([
        { 
          id: "1", 
          distributorId: "DIST-001", 
          name: "MediLogistics International",
          logoUrl: "/images/logo-placeholder.png",
          region: "North America",
          headquarters: "Chicago, IL, USA",
          areas: ["USA", "Canada", "Mexico"],
          contactName: "John Williams",
          contactTitle: "Distribution Manager",
          phone: "+1 (312) 555-6789",
          email: "jwilliams@medilogistics.com",
          website: "www.medilogistics.com",
          relationshipSince: "2018-05-22",
          contractStatus: "Active",
          contractRenewal: "2024-05-21",
          deliveryTime: "2-3 days",
          rating: 4.8,
          reliability: "Excellent",
          lastDelivery: "2023-11-24",
          paymentTerms: "Net 30",
          specialties: ["Temperature-controlled delivery", "Controlled substances", "Bulk distribution"]
        },
        { 
          id: "2", 
          distributorId: "DIST-002", 
          name: "PharmaConnect UK",
          logoUrl: "/images/logo-placeholder.png",
          region: "Europe",
          headquarters: "London, UK",
          areas: ["UK", "Ireland", "France", "Germany"],
          contactName: "Emma Thompson",
          contactTitle: "Supply Chain Director",
          phone: "+44 20 7946 0123",
          email: "ethompson@pharmaconnect.co.uk",
          website: "www.pharmaconnect.co.uk",
          relationshipSince: "2019-08-15",
          contractStatus: "Active",
          contractRenewal: "2025-08-14",
          deliveryTime: "1-2 days",
          rating: 4.5,
          reliability: "Very Good",
          lastDelivery: "2023-11-20",
          paymentTerms: "Net 45",
          specialties: ["Express delivery", "Refrigerated transport", "Hospital supply chains"]
        },
        { 
          id: "3", 
          distributorId: "DIST-003", 
          name: "AsiaPharm Distribution",
          logoUrl: "/images/logo-placeholder.png",
          region: "Asia",
          headquarters: "Singapore",
          areas: ["Singapore", "Malaysia", "Thailand", "Vietnam"],
          contactName: "David Chen",
          contactTitle: "Operations Manager",
          phone: "+65 6789 4321",
          email: "dchen@asiapharm.sg",
          website: "www.asiapharm.sg",
          relationshipSince: "2017-11-10",
          contractStatus: "Active",
          contractRenewal: "2023-12-31",
          deliveryTime: "3-5 days",
          rating: 4.2,
          reliability: "Good",
          lastDelivery: "2023-11-15",
          paymentTerms: "Net 30",
          specialties: ["Rural area delivery", "High-volume logistics", "Traditional medicine"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Format areas and specialties from comma-separated string to array
      const formattedData = {
        ...formData,
        areas: formData.areas ? formData.areas.split(',').map(area => area.trim()) : [],
        specialties: formData.specialties ? formData.specialties.split(',').map(specialty => specialty.trim()) : []
      };

      // Add distributor via API
      await PharmacistService.addDistributor(formattedData);
      
      // Show success message and refresh list
      setSuccessMessage("Distributor added successfully!");
      await fetchDistributors();
      
      // Close modal and reset form
      setShowAddModal(false);
      setFormData({
        name: "",
        region: "",
        headquarters: "",
        contactName: "",
        contactTitle: "",
        phone: "",
        email: "",
        website: "",
        areas: "",
        contractStatus: "Active",
        deliveryTime: "",
        specialties: ""
      });
    } catch (err) {
      console.error("Error adding distributor:", err);
      setError(getErrorMessage(err) || "Failed to add distributor");
    } finally {
      setLoading(false);
    }
  };

  const handleViewMedicines = async (distributor: Distributor) => {
    try {
      setLoadingMedicines(true);
      setSelectedDistributor(distributor);
      setShowMedicinesModal(true);
      
      // Fetch medicines associated with this distributor
      const medicines = await PharmacistService.getMedicines({ 
        distributorId: distributor.distributorId || distributor.id 
      });
      
      setDistributorMedicines(Array.isArray(medicines) ? medicines : []);
    } catch (err) {
      console.error("Failed to load distributor medicines:", err);
      setDistributorMedicines([]);
    } finally {
      setLoadingMedicines(false);
    }
  };

  // Get unique regions for filter options
  const regions = ["all", ...new Set(distributors.map(distributor => distributor.region))];

  // Get filtered distributors based on search and filters
  const getFilteredDistributors = () => {
    return distributors.filter(distributor => 
      (regionFilter === "all" || distributor.region === regionFilter) &&
      (statusFilter === "all" || distributor.contractStatus === statusFilter) &&
      (searchQuery === "" || 
        distributor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        distributor.distributorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (distributor.areas && distributor.areas.some(area => area.toLowerCase().includes(searchQuery.toLowerCase()))))
    );
  };

  const filteredDistributors = getFilteredDistributors();

  // Get status color class for visual indication
  const getStatusColorClass = (status?: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800";
      case "Expired":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  return (
    <DashboardLayout userType="pharmacist" title="Manage Distributors">
      {/* Header and controls */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Distributors</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Distributor
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search distributors..."
              className="w-full p-2 pl-8 border border-gray-300 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <select
            className="p-2 border border-gray-300 rounded-md"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region === "all" ? "All Regions" : region}
              </option>
            ))}
          </select>

          <select
            className="p-2 border border-gray-300 rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Expired">Expired</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
            <button 
              onClick={fetchDistributors}
              className="ml-auto text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Retry
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Distributors Table */}
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
            <p className="text-gray-500">Loading distributors...</p>
          </div>
        ) : filteredDistributors.length === 0 ? (
          <div className="text-center py-10 border rounded-md">
            <p className="text-gray-500">No distributors found matching your criteria.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add New Distributor
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDistributors.map((distributor) => (
                  <tr key={distributor.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {distributor.distributorId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {distributor.logoUrl && (
                          <div className="flex-shrink-0 h-10 w-10 mr-4">
                            <img className="h-10 w-10 rounded-full" src={distributor.logoUrl} alt={distributor.name} />
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">{distributor.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{distributor.region}</div>
                      {distributor.headquarters && (
                        <div className="text-xs text-gray-400">{distributor.headquarters}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {distributor.contactName && (
                        <div>{distributor.contactName}</div>
                      )}
                      <div>{distributor.phone}</div>
                      {distributor.email && (
                        <div className="text-xs text-gray-400">{distributor.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(distributor.contractStatus)}`}>
                        {distributor.contractStatus || "Unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {/* Handle edit */}}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewMedicines(distributor)}
                        className="text-green-600 hover:text-green-900"
                      >
                        View Medicines
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Distributor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Distributor</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. North America, Europe, Asia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Headquarters</label>
                  <input
                    type="text"
                    name="headquarters"
                    value={formData.headquarters}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. Chicago, IL, USA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Areas Served</label>
                  <input
                    type="text"
                    name="areas"
                    value={formData.areas}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Comma-separated list, e.g. USA, Canada, Mexico"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Title</label>
                  <input
                    type="text"
                    name="contactTitle"
                    value={formData.contactTitle}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. Distribution Manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. www.medilogistics.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Status</label>
                  <select
                    name="contractStatus"
                    value={formData.contractStatus}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Expired">Expired</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                  <input
                    type="text"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 2-3 days"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                  <textarea
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Comma-separated list, e.g. Temperature-controlled delivery, Controlled substances"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !formData.name || !formData.phone || !formData.region}
                >
                  {loading ? 'Adding...' : 'Add Distributor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Distributor Medicines Modal */}
      {showMedicinesModal && selectedDistributor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Medicines distributed by {selectedDistributor.name}
              </h2>
              <button
                onClick={() => setShowMedicinesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingMedicines ? (
              <div className="py-10 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
                <p className="text-gray-500">Loading medicines...</p>
              </div>
            ) : distributorMedicines.length === 0 ? (
              <div className="py-10 text-center border rounded-md">
                <p className="text-gray-500">No medicines found for this distributor.</p>
                <button
                  onClick={() => router.push({
                    pathname: '/pharmacist/medicines/add',
                    query: { distributorId: selectedDistributor.distributorId || selectedDistributor.id }
                  })}
                  className="mt-2 text-indigo-600 hover:text-indigo-800"
                >
                  Add medicine for this distributor
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {distributorMedicines.map((medicine) => (
                      <tr key={medicine.id || medicine.medicineId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {medicine.medicineId || `MED-${medicine.id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {medicine.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {medicine.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            medicine.stock <= (medicine.reorderLevel || 30) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {medicine.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${medicine.price ? medicine.price.toFixed(2) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {medicine.company || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => router.push(`/pharmacist/medicines/edit/${medicine.id || medicine.medicineId}`)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => router.push({
                  pathname: '/pharmacist/medicines/add',
                  query: { distributorId: selectedDistributor.distributorId || selectedDistributor.id }
                })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 mr-2"
              >
                Add Medicine
              </button>
              <button
                onClick={() => setShowMedicinesModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 