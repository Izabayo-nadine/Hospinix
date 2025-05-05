"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PharmacistService from "@/services/pharmacist.service";
import { getErrorMessage } from "@/utils/apiUtils";

interface Medicine {
  id: string | number;
  medicineId?: string;
  name: string;
  category: string;
  description?: string;
  manufacturer?: string;
  company?: string;
  companyName?: string;
  batchNumber?: string;
  expiryDate?: string;
  expiry?: string;
  stock: number;
  stockStatus?: string;
  price: number;
  requiresPrescription?: boolean;
  dosageForm?: string;
  strength?: string;
  interactions?: string[];
  sideEffects?: string[];
}

export default function PharmacistMedicines() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [prescriptionFilter, setPrescriptionFilter] = useState("all");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        console.log("Fetching medicines...");

        const apiResponse = await PharmacistService.getMedicines();
        const response = Array.isArray(apiResponse)
          ? apiResponse
          : apiResponse?.data;

        console.log("Raw response:", apiResponse);

        if (!Array.isArray(response)) {
          throw new Error("Invalid response format");
        }

        const formattedMedicines = response.map((med: any) => ({
          id: med.id || med.medicineId || `MED-${Math.floor(Math.random() * 1000)}`,
          medicineId: med.medicineId,
          name: med.name || "Unknown Medicine",
          category: med.category || med.categoryName || "Uncategorized",
          description: med.description || "",
          manufacturer: med.manufacturer || "",
          company: med.company?.name || med.companyName || "Unknown",
          batchNumber: med.batchNumber || "N/A",
          expiry: med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : "N/A",
          expiryDate: med.expiryDate,
          stock: med.stock || 0,
          stockStatus: getStockStatusFromQuantity(med.stock),
          price: med.price || 0,
          requiresPrescription: med.requiresPrescription || false,
          dosageForm: med.dosageForm || "Tablet",
          strength: med.dosage || med.strength || "N/A",
          interactions: Array.isArray(med.interactions)
            ? med.interactions
            : med.interactions
            ? med.interactions.split(",")
            : [],
          sideEffects: Array.isArray(med.sideEffects)
            ? med.sideEffects
            : med.sideEffects
            ? med.sideEffects.split(",")
            : [],
        }));

        const uniqueCategories = [
          "all",
          ...new Set(
            formattedMedicines
              .filter((med) => med.category && med.category !== "Uncategorized")
              .map((med) => med.category)
          ),
        ];

        setMedicines(formattedMedicines);
        setCategories(uniqueCategories);
        setError("");
      } catch (err) {
        console.error("Error fetching medicines:", err);
        setError(getErrorMessage(err as Error) || "Failed to load medicines data.");

        // fallback
        setMedicines([
          {
            id: 1,
            name: "Amoxicillin 500mg",
            category: "Antibiotics",
            company: "PharmaCorp Inc.",
            stock: 12,
            stockStatus: "Low",
            price: 12.5,
            requiresPrescription: true,
            expiry: "2024-08-15",
          },
          {
            id: 2,
            name: "Lisinopril 10mg",
            category: "Antihypertensive",
            company: "MediLife Labs",
            stock: 8,
            stockStatus: "Critical",
            price: 15.99,
            requiresPrescription: true,
            expiry: "2024-06-30",
          },
          {
            id: 3,
            name: "Metformin 850mg",
            category: "Antidiabetic",
            company: "Global Meds",
            stock: 45,
            stockStatus: "Normal",
            price: 9.99,
            requiresPrescription: true,
            expiry: "2024-07-22",
          },
        ]);
        setCategories(["all", "Antibiotics", "Antihypertensive", "Antidiabetic"]);
      } finally {
        setLoading(false);
      }
    };

    const refreshParam = searchParams ? searchParams.get("refresh") : null;
    fetchMedicines();
  }, [searchParams]);

  const getStockStatusFromQuantity = (quantity: number | undefined) => {
    if (quantity === undefined || quantity === null) return "Unknown";
    if (quantity <= 10) return "Critical";
    if (quantity <= 30) return "Low";
    if (quantity >= 200) return "High";
    return "Normal";
  };

  // Get filtered medicines based on search and filters
  const getFilteredMedicines = () => {
    return medicines.filter(medicine => 
      (categoryFilter === "all" || medicine.category === categoryFilter) &&
      (stockFilter === "all" || 
        (stockFilter === "low" && medicine.stockStatus === "Low") || 
        (stockFilter === "critical" && medicine.stockStatus === "Critical") ||
        (stockFilter === "normal" && medicine.stockStatus === "Normal") ||
        (stockFilter === "high" && medicine.stockStatus === "High")) &&
      (prescriptionFilter === "all" || 
        (prescriptionFilter === "required" && medicine.requiresPrescription) || 
        (prescriptionFilter === "otc" && !medicine.requiresPrescription)) &&
      (searchQuery === "" || 
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        (medicine.company && medicine.company.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  };

  const filteredMedicines = getFilteredMedicines();

  // Get status color class based on stock status
  const getStockStatusColorClass = (status?: string) => {
    switch (status) {
      case "High":
        return "bg-green-100 text-green-800";
      case "Normal":
        return "bg-blue-100 text-blue-800";
      case "Low":
        return "bg-yellow-100 text-yellow-800";
      case "Critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout userType="pharmacist" title="Medicines Management">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block">{error}</span>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Medication Inventory</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search medicines..."
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
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">All Stock Levels</option>
                <option value="critical">Critical</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={prescriptionFilter}
                onChange={(e) => setPrescriptionFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="required">Prescription Only</option>
                <option value="otc">Over-the-Counter</option>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMedicines.length > 0 ? (
                    filteredMedicines.map((medicine) => (
                      <tr key={medicine.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                          <div className="text-sm text-gray-500">{medicine.medicineId || medicine.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{medicine.stock} units</div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColorClass(medicine.stockStatus)}`}>
                            {medicine.stockStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${medicine.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.expiry}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => router.push(`/pharmacist/medicines/${medicine.id}`)}
                            >
                              View
                            </button>
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => router.push(`/pharmacist/medicines/edit/${medicine.id}`)}
                            >
                              Edit
                            </button>
                            {medicine.stock <= 30 && (
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => router.push(`/pharmacist/orders/new?medicineId=${medicine.id}`)}
                              >
                                Reorder
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        {searchQuery ? "No medicines found matching your search criteria." : "No medicines found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {filteredMedicines.length} of {medicines.length} medicines
              </div>
              <button
                className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50"
                onClick={() => router.push('/pharmacist/medicines/inventory')}
              >
                View Full Inventory Report
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 