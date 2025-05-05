"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminService from "@/services/admin.service";

export default function MedicinesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        console.log("Fetching medicines...");
        
        let response;
        try {
          response = await AdminService.getMedicines();
        } catch (apiError) {
          console.error("API error fetching medicines:", apiError);
          // If the API fails completely, provide mock data for development
          response = [
            { 
              id: "MED-1001", 
              name: "Amoxicillin", 
              categoryName: "Antibiotic",
              companyName: "PharmaCorp Inc.",
              expiryDate: "2025-05-15",
              stock: 145,
              price: 12.99,
              dosage: "500mg",
            },
            { 
              id: "MED-1002", 
              name: "Lisinopril", 
              categoryName: "Antihypertensive",
              companyName: "MediLife Labs",
              expiryDate: "2024-11-30",
              stock: 78,
              price: 15.49,
              dosage: "10mg",
            }
          ];
          setError("Could not connect to medicine API. Showing sample data.");
        }
        
        console.log("Fetched medicines:", response);
        
        if (!response || !Array.isArray(response)) {
          throw new Error("Invalid response format");
        }
        
        // Transform the medicines data to match the expected structure
        const formattedMedicines = response.map(med => ({
          id: med.id || `MED-${Math.floor(Math.random() * 1000)}`,
          name: med.name || "Unknown Medicine",
          category: med.category?.name || med.categoryName || "Uncategorized",
          manufacturer: med.manufacturer?.name || med.companyName || "Unknown Manufacturer",
          expiryDate: med.expiryDate ? new Date(med.expiryDate).toISOString().split('T')[0] : "Not specified",
          stock: med.stock || 0,
          price: med.price || 0,
          dosage: med.dosage || "Not specified",
          status: getStockStatus(med.stock),
          // Original medicine data for reference
          originalMedicine: med
        }));
        
        // Extract unique categories from the medicines
        const uniqueCategories = [...new Set(formattedMedicines
          .filter(med => med.category)
          .map(med => med.category))];
        
        console.log("Formatted medicines:", formattedMedicines);
        setMedicines(formattedMedicines);
        setCategories(uniqueCategories);
        
        if (!error) {
          setError("");
        }
      } catch (err) {
        console.error("Error processing medicines data:", err);
        if (!error) {
          setError("Failed to process medicines data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch medicines on initial load or when refresh parameter changes
    const refreshParam = searchParams.get('refresh');
    fetchMedicines();
  }, [searchParams, error]);
  
  // Determine stock status based on quantity
  const getStockStatus = (quantity) => {
    if (quantity === undefined || quantity === null) return "Unknown";
    if (quantity === 0) return "Out of Stock";
    if (quantity <= 10) return "Low Stock";
    return "In Stock";
  };

  const getStockStatusFilter = (medicine) => {
    if (stockFilter === "all") return true;
    return medicine.status === stockFilter;
  };

  const filteredMedicines = medicines
    .filter(medicine => 
      (categoryFilter === "all" || medicine.category === categoryFilter) &&
      getStockStatusFilter(medicine) &&
      (searchQuery === "" || 
       medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       medicine.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
       medicine.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <DashboardLayout userType="admin" title="Medicines Management">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block">{error}</span>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Medicines Inventory</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, ID or manufacturer..."
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex space-x-2">
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">All Stock Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => router.push('/pharmacist/medicines/add')}
              >
                Add Medicine
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMedicines.map((medicine) => (
                    <tr key={medicine.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{medicine.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicine.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.manufacturer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.dosage}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${medicine.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.stock} units</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.expiryDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          medicine.status === 'In Stock' ? 'bg-green-100 text-green-800' : 
                          medicine.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {medicine.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => router.push(`/admin/medicines/${medicine.id}`)}
                        >
                          View
                        </button>
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => router.push(`/pharmacist/medicines/edit/${medicine.id}`)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => router.push(`/pharmacist/inventory/order/${medicine.id}`)}
                        >
                          Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredMedicines.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No medicines found matching your criteria.
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredMedicines.length}</span> of <span className="font-medium">{medicines.length}</span> medicines
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 