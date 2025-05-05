"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";

export default function DistributorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  
  // In a real app, this would be fetched from an API
  const distributors = [
    { 
      id: "DIST-1001", 
      name: "Global Pharma Distribution", 
      email: "contact@globalpharma.com", 
      phone: "+1 (555) 123-4567", 
      region: "North America",
      address: "123 Commerce Blvd, Chicago, IL 60601",
      activeContracts: 12,
      lastDelivery: "2023-11-25",
      joinDate: "2019-04-10",
      status: "Active",
      rating: 4.8
    },
    { 
      id: "DIST-1002", 
      name: "MediExpress Logistics", 
      email: "operations@mediexpress.com", 
      phone: "+1 (555) 234-5678", 
      region: "Europe",
      address: "45 Shipping Lane, London, UK EC1A 1BB",
      activeContracts: 8,
      lastDelivery: "2023-11-28",
      joinDate: "2020-07-15",
      status: "Active",
      rating: 4.5
    },
    { 
      id: "DIST-1003", 
      name: "AsiaPharma Network", 
      email: "info@asiapharma.net", 
      phone: "+1 (555) 345-6789", 
      region: "Asia",
      address: "78 Supply Road, Singapore 238859",
      activeContracts: 5,
      lastDelivery: "2023-11-20",
      joinDate: "2021-02-03",
      status: "Active",
      rating: 4.2
    },
    { 
      id: "DIST-1004", 
      name: "HealthRoute Distributors", 
      email: "support@healthroute.com", 
      phone: "+1 (555) 456-7890", 
      region: "South America",
      address: "29 Delivery Ave, São Paulo, Brazil 01310-200",
      activeContracts: 0,
      lastDelivery: "2023-10-05",
      joinDate: "2018-11-12",
      status: "Inactive",
      rating: 3.7
    },
    { 
      id: "DIST-1005", 
      name: "PharmaConnect Global", 
      email: "partners@pharmaconnect.org", 
      phone: "+1 (555) 567-8901", 
      region: "Africa",
      address: "56 Medical Park, Cape Town, South Africa 8001",
      activeContracts: 3,
      lastDelivery: "2023-11-15",
      joinDate: "2022-01-20",
      status: "On Probation",
      rating: 3.9
    },
    { 
      id: "DIST-1006", 
      name: "MedSupply International", 
      email: "orders@medsupplyintl.com", 
      phone: "+1 (555) 678-9012", 
      region: "Australia/Oceania",
      address: "92 Health Street, Sydney, Australia 2000",
      activeContracts: 7,
      lastDelivery: "2023-11-27",
      joinDate: "2020-05-19",
      status: "Active",
      rating: 4.6
    }
  ];

  // Get unique regions for filter
  const regions = [...new Set(distributors.map(distributor => distributor.region))];

  const filteredDistributors = distributors
    .filter(distributor => 
      (regionFilter === "all" || distributor.region === regionFilter) &&
      (statusFilter === "all" || distributor.status === statusFilter) &&
      (searchQuery === "" || 
       distributor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       distributor.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
       distributor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
       distributor.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <DashboardLayout userType="admin" title="Distributors Management">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Distributors Directory</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, ID, email, or address..."
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
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
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
                <option value="On Probation">On Probation</option>
              </select>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Add Distributor
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contracts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDistributors.map((distributor) => (
                <tr key={distributor.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{distributor.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{distributor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{distributor.email}</div>
                    <div>{distributor.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{distributor.region}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{distributor.activeContracts}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{distributor.lastDelivery}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      {distributor.rating.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      distributor.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      distributor.status === 'On Probation' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {distributor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                    <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button className="text-indigo-600 hover:text-indigo-900">Contracts</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredDistributors.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No distributors found matching your criteria.
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredDistributors.length}</span> of <span className="font-medium">{distributors.length}</span> distributors
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