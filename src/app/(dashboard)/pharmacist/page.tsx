"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import PharmacistService from "@/services/pharmacist.service";
import { useRouter } from "next/navigation";
import { API_URL } from "@/config";

// Define types for the data we expect from the API
interface DashboardStats {
  totalMedicines: number;
  lowStockMedicines: number;
  totalCompanies: number;
  totalDistributors: number;
  pendingPrescriptions: number;
}

interface Medicine {
  id: string | number;
  medicineId?: string;
  name: string;
  category: string;
  stock: number;
  stockStatus?: string;
  reorderLevel?: number;
  expiry: string;
  expiryDate?: string;
  price?: number;
  requiresPrescription?: boolean;
  company?: string;
}

export default function PharmacistDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
  
        // Fetch dashboard stats from the API
        const dashboardStats = await PharmacistService.getDashboardStats()
          .catch(e => {
            console.error("Dashboard stats API call failed:", e);
            return null;
          });
  
    const medicinesData = await PharmacistService.getLowStockMedicines();
  console.log("low stock medicines: "+medicinesData);
        // Properly extract data from the response
        
        if (!dashboardStats) {
          throw new Error("Failed to fetch dashboard stats");
        }
  
        // Validate that medicinesData is an array before calling map
        const formattedMedicines = Array.isArray(medicinesData) ? medicinesData.map((med: any) => ({
          id: med.id || med.medicineId,
          medicineId: med.medicineId,
          name: med.name,
          category: med.category,
          stock: med.stock || 0,
          stockStatus: med.stockStatus,
          reorderLevel: med.reorderLevel || Math.floor((med.stock || 20) * 1.5) || 30,
          expiry: med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : "N/A",
          expiryDate: med.expiryDate,
          price: med.price,
          requiresPrescription: med.requiresPrescription,
          company: med.company?.name || med.companyName || "Unknown"
        })) : [];
  
        setStats(dashboardStats);
        setMedicines(formattedMedicines);
        setError("");
  
      } catch (err: any) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data. Please ensure the backend server is running.");
  
        // Fallback data
        setStats({
          totalMedicines: 0,
          lowStockMedicines: 0,
          totalCompanies: 0,
          totalDistributors: 0,
          pendingPrescriptions: 0
        });
  
        setMedicines([
          { id: 1, name: "Amoxicillin 500mg", category: "Antibiotics", stock: 12, reorderLevel: 30, expiry: "2024-08-15", company: "PharmaCorp Inc." },
          { id: 2, name: "Lisinopril 10mg", category: "Antihypertensive", stock: 8, reorderLevel: 25, expiry: "2024-06-30", company: "MediLife Labs" },
          { id: 3, name: "Metformin 850mg", category: "Antidiabetic", stock: 5, reorderLevel: 30, expiry: "2024-07-22", company: "Global Meds" }
        ]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchDashboardData();
  }, []);
  
  

  const filteredMedicines = searchQuery 
    ? medicines.filter(med => 
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (med.company && med.company.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : medicines;

  const handleAddMedicine = () => {
    router.push('/pharmacist/medicines/add');
  };

  const handleReorder = (medicineId: string | number) => {
    // Implement reordering functionality
    console.log(`Reordering medicine: ${medicineId}`);
    // Could navigate to a reorder page or open a modal
  };

  const handleEditMedicine = (medicineId: string | number) => {
    router.push(`/pharmacist/medicines/edit/${medicineId}`);
  };

  const handleViewCompanies = () => {
    router.push('/pharmacist/companies');
  };

  const handleViewDistributors = () => {
    router.push('/pharmacist/distributors');
  };

  const handleViewPrescriptions = () => {
    router.push('/pharmacist/prescriptions');
  };

  if (loading) {
    return (
      <DashboardLayout userType="pharmacist" title="Pharmacy Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="pharmacist" title="Pharmacy Dashboard">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/pharmacist/medicines')}>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Medicines</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.totalMedicines || 0}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/pharmacist/medicines?stockStatus=low')}>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">{stats?.lowStockMedicines || 0}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={handleViewPrescriptions}>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Prescriptions</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats?.pendingPrescriptions || 0}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={handleViewCompanies}>
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Companies</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.totalCompanies || 0}</dd>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Low Stock Medicines</h2>
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search medicines..."
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
            <button 
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              onClick={handleAddMedicine}
            >
              Add New Medicine
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.length > 0 ? (
                filteredMedicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{medicine.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.company || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        medicine.stock <= (medicine.reorderLevel || 30) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {medicine.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.reorderLevel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicine.expiry}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-red-600 hover:text-red-900 mr-3"
                        onClick={() => handleReorder(medicine.id)}
                      >
                        Reorder
                      </button>
                      <button 
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => handleEditMedicine(medicine.id)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchQuery ? "No medicines found matching your search criteria." : "No low stock medicines found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <button className="text-indigo-600 hover:text-indigo-900 text-sm">
              View All
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Prescription #2458 filled</p>
                <p className="text-sm text-gray-500">Today at 10:30 AM</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">New inventory received from HealthCare Distribution</p>
                <p className="text-sm text-gray-500">Yesterday at 2:45 PM</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Low stock alert: Ibuprofen 200mg</p>
                <p className="text-sm text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Quick Links</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push('/pharmacist/medicines')}
              className="flex items-center p-3 bg-indigo-50 rounded-md hover:bg-indigo-100"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0h10a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Manage Medicines</p>
              </div>
            </button>

            <button 
              onClick={handleViewCompanies}
              className="flex items-center p-3 bg-indigo-50 rounded-md hover:bg-indigo-100"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Manage Companies</p>
              </div>
            </button>

            <button 
              onClick={handleViewDistributors}
              className="flex items-center p-3 bg-indigo-50 rounded-md hover:bg-indigo-100"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Manage Distributors</p>
              </div>
            </button>

            <button 
              onClick={() => router.push('/pharmacist/prescriptions')}
              className="flex items-center p-3 bg-indigo-50 rounded-md hover:bg-indigo-100"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Manage Prescriptions</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 