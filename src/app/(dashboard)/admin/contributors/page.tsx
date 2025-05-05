"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";

export default function ContributorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // In a real app, this would be fetched from an API
  const contributors = [
    { 
      id: "C001", 
      name: "Dr. Emily Johnson", 
      role: "Pharmacist",
      email: "emily.johnson@healthcorp.com",
      phone: "+1 (555) 123-4567",
      specialization: "Clinical Pharmacy",
      joinDate: "2022-03-15",
      contributions: 87,
      status: "Active",
      location: "New York, NY"
    },
    { 
      id: "C002", 
      name: "Dr. Michael Wong", 
      role: "Physician",
      email: "michael.wong@healthcorp.com",
      phone: "+1 (555) 234-5678",
      specialization: "Internal Medicine",
      joinDate: "2021-11-05",
      contributions: 45,
      status: "Active",
      location: "Los Angeles, CA"
    },
    { 
      id: "C003", 
      name: "Sarah Miller", 
      role: "Researcher",
      email: "sarah.miller@medresearch.org",
      phone: "+1 (555) 345-6789",
      specialization: "Pharmaceutical Research",
      joinDate: "2023-01-20",
      contributions: 23,
      status: "Active",
      location: "Boston, MA"
    },
    { 
      id: "C004", 
      name: "Dr. James Rodriguez", 
      role: "Physician",
      email: "james.rodriguez@healthcorp.com",
      phone: "+1 (555) 456-7890",
      specialization: "Cardiology",
      joinDate: "2021-08-12",
      contributions: 56,
      status: "Inactive",
      location: "Chicago, IL"
    },
    { 
      id: "C005", 
      name: "Olivia Chen", 
      role: "Pharmacist",
      email: "olivia.chen@pharm.edu",
      phone: "+1 (555) 567-8901",
      specialization: "Pharmaceutical Education",
      joinDate: "2022-05-30",
      contributions: 34,
      status: "On Leave",
      location: "Seattle, WA"
    },
    { 
      id: "C006", 
      name: "Dr. Robert Patel", 
      role: "Researcher",
      email: "robert.patel@medresearch.org",
      phone: "+1 (555) 678-9012",
      specialization: "Drug Development",
      joinDate: "2023-02-15",
      contributions: 12,
      status: "Active",
      location: "San Francisco, CA"
    }
  ];

  // Get unique roles for filter
  const roles = [...new Set(contributors.map(contributor => contributor.role))];

  const filteredContributors = contributors
    .filter(contributor => 
      (roleFilter === "all" || contributor.role === roleFilter) &&
      (statusFilter === "all" || contributor.status === statusFilter) &&
      (searchQuery === "" || 
       contributor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       contributor.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
       contributor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
       contributor.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <DashboardLayout userType="admin" title="Contributors Management">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Contributors Directory</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, ID, email, or specialization..."
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
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
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
                <option value="On Leave">On Leave</option>
              </select>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                Add Contributor
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contributions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContributors.map((contributor) => (
                <tr key={contributor.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contributor.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contributor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contributor.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contributor.specialization}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contributor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contributor.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contributor.contributions}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contributor.joinDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      contributor.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      contributor.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {contributor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                    <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button className="text-indigo-600 hover:text-indigo-900">Contact</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredContributors.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No contributors found matching your criteria.
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredContributors.length}</span> of <span className="font-medium">{contributors.length}</span> contributors
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