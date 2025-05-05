"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PharmacistService from "@/services/pharmacist.service";

export default function SuppliersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("distributors");
  const [distributors, setDistributors] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);

        if (activeTab === "distributors") {
          // Use the PharmacistService getDistributors method
          const data = await PharmacistService.getDistributors();
          setDistributors(data);
        } else {
          const data = await PharmacistService.getCompanies();
          setCompanies(data || []);
        }

        setError("");
      } catch (err) {
        console.error(`Failed to load ${activeTab}:`, err);
        setError(`Failed to load ${activeTab}. Please try again.`);

        // Set placeholder data if API fails
        if (activeTab === "distributors") {
          setDistributors([
            {
              id: 1,
              distributorId: "DIST-001",
              name: "PharmaPlus Distribution",
              region: "North America",
              contactName: "Robert Johnson",
              phone: "+1 (555) 123-4567",
              reliability: "Excellent",
              specialties: ["Antibiotics", "Vaccines"]
            },
            {
              id: 2,
              distributorId: "DIST-002",
              name: "MedSupply Co.",
              region: "Europe",
              contactName: "Emma Williams",
              phone: "+44 20 1234 5678",
              reliability: "Good",
              specialties: ["Cardiovascular", "Diabetes"]
            }
          ]);
        } else {
          setCompanies([
            {
              id: 1,
              companyId: "COMP-001",
              name: "PharmaCorp Inc.",
              address: "123 Medicine Lane, New York, NY",
              phone: "+1 (555) 987-6543",
              email: "contact@pharmacorp.com"
            },
            {
              id: 2,
              companyId: "COMP-002",
              name: "MediLife Labs",
              address: "456 Health Blvd, Los Angeles, CA",
              phone: "+1 (555) 456-7890",
              email: "info@medilife.com"
            }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [activeTab]);

  const handleAddDistributor = () => {
    router.push('/pharmacist/suppliers/distributors/add');
  };

  const handleAddCompany = () => {
    router.push('/pharmacist/suppliers/companies/add');
  };

  const handleEditDistributor = (id) => {
    router.push(`/pharmacist/suppliers/distributors/${id}`);
  };

  const handleEditCompany = (id) => {
    router.push(`/pharmacist/suppliers/companies/${id}`);
  };

  // Filter data based on search query
  const filteredDistributors = searchQuery
    ? distributors.filter(d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : distributors;

  const filteredCompanies = searchQuery
    ? companies.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : companies;

  return (
    <DashboardLayout userType="pharmacist" title="Manage Suppliers">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Suppliers</h1>

          {/* Tabs */}
          <div className="flex space-x-4 border-b">
            <button
              className={`pb-2 px-1 ${activeTab === 'distributors' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('distributors')}
            >
              Distributors
            </button>
            <button
              className={`pb-2 px-1 ${activeTab === 'companies' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('companies')}
            >
              Companies
            </button>
          </div>
        </div>

        {/* Search and Add button */}
        <div className="flex justify-between mb-6">
          <div className="relative w-64">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
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

          <button
            onClick={activeTab === 'distributors' ? handleAddDistributor : handleAddCompany}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add {activeTab === 'distributors' ? 'Distributor' : 'Company'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading {activeTab}...</p>
          </div>
        ) : activeTab === 'distributors' ? (
          // Distributors Table
          distributors.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <p className="text-gray-500">No distributors found.</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reliability</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDistributors.map((distributor) => (
                    <tr key={distributor.id || distributor.distributorId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {distributor.distributorId || `DIST-${distributor.id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {distributor.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {distributor.region || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {distributor.contactName || "N/A"}
                        {distributor.phone && <div className="text-xs text-gray-400">{distributor.phone}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${distributor.reliability === "Excellent" ? "bg-green-100 text-green-800" :
                            distributor.reliability === "Very Good" ? "bg-blue-100 text-blue-800" :
                              distributor.reliability === "Good" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                          }`}>
                          {distributor.reliability || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleEditDistributor(distributor.id || distributor.distributorId)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // Companies Table
          companies.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <p className="text-gray-500">No companies found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCompanies.map((company) => (
                    <tr key={company.id || company.companyId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {company.companyId || `COMP-${company.id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.address || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.phone && <div>{company.phone}</div>}
                        {company.email && <div className="text-xs text-gray-400">{company.email}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleEditCompany(company.id || company.companyId)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
} 