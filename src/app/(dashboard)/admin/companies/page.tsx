"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // In a real app, this would be fetched from an API
  const companies = [
    { 
      id: "COMP-1001", 
      name: "NovaPharm Laboratories", 
      type: "Manufacturer",
      email: "contact@novapharm.com", 
      phone: "+1 (555) 987-6543", 
      headquarters: "Boston, MA, USA",
      established: "1985",
      activeProducts: 32,
      revenue: "$450M",
      status: "Active",
      partnerships: 8
    },
    { 
      id: "COMP-1002", 
      name: "MediCore Pharmaceuticals", 
      type: "Manufacturer",
      email: "info@medicore.net", 
      phone: "+1 (555) 876-5432", 
      headquarters: "Zurich, Switzerland",
      established: "1992",
      activeProducts: 27,
      revenue: "$780M",
      status: "Active",
      partnerships: 12
    },
    { 
      id: "COMP-1003", 
      name: "BioGenesis Research", 
      type: "Research",
      email: "research@biogenesis.org", 
      phone: "+1 (555) 765-4321", 
      headquarters: "Cambridge, UK",
      established: "2005",
      activeProducts: 9,
      revenue: "$120M",
      status: "Active",
      partnerships: 6
    },
    { 
      id: "COMP-1004", 
      name: "HealthTech Solutions", 
      type: "Technology",
      email: "support@healthtech.io", 
      phone: "+1 (555) 654-3210", 
      headquarters: "San Francisco, CA, USA",
      established: "2010",
      activeProducts: 4,
      revenue: "$85M",
      status: "Active",
      partnerships: 3
    },
    { 
      id: "COMP-1005", 
      name: "GlobalCare Pharma", 
      type: "Distributor",
      email: "partners@globalcarepharma.com", 
      phone: "+1 (555) 543-2109", 
      headquarters: "Singapore",
      established: "2001",
      activeProducts: 0,
      revenue: "$320M",
      status: "Inactive",
      partnerships: 0
    },
    { 
      id: "COMP-1006", 
      name: "MedScience Innovations", 
      type: "Research",
      email: "info@medscience.co", 
      phone: "+1 (555) 432-1098", 
      headquarters: "Toronto, Canada",
      established: "2008",
      activeProducts: 11,
      revenue: "$210M",
      status: "Under Review",
      partnerships: 5
    }
  ];

  // Get unique company types for filter
  const companyTypes = [...new Set(companies.map(company => company.type))];

  const filteredCompanies = companies
    .filter(company => 
      (typeFilter === "all" || company.type === typeFilter) &&
      (statusFilter === "all" || company.status === statusFilter) &&
      (searchQuery === "" || 
       company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       company.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
       company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
       company.headquarters.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <DashboardLayout userType="admin" title="Companies Management">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Pharmaceutical Companies</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, ID, email, or location..."
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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {companyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Review">Under Review</option>
              </select>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Add Company
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Headquarters</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partnerships</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{company.name}</div>
                    <div className="text-xs text-gray-500">Est. {company.established}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{company.email}</div>
                    <div>{company.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.headquarters}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.activeProducts}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.partnerships}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.revenue}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      company.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      company.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                    <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button className="text-indigo-600 hover:text-indigo-900">Products</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCompanies.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No companies found matching your criteria.
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredCompanies.length}</span> of <span className="font-medium">{companies.length}</span> companies
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-gray-50">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 