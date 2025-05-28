"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminService from "@/services/admin.service";
import Pagination from "@/components/Pagination";
import SortableHeader from "@/components/SortableHeader";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
}

interface Pharmacist {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  originalUser: User;
}

interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export default function PharmacistsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [sort, setSort] = useState({
    key: "firstName",
    direction: "asc" as "asc" | "desc",
  });

  useEffect(() => {
    const fetchPharmacists = async () => {
      try {
        setLoading(true);
        const sortParam = `${sort.key},${sort.direction}`;
        console.log('Fetching pharmacists with params:', {
          page: pagination.currentPage - 1,
          size: pagination.itemsPerPage,
          sort: sortParam,
          search: searchQuery,
          active: statusFilter === "all" ? undefined : statusFilter === "Active"
        });

        const response = await AdminService.getUsers({
          role: "PHARMACIST",
          page: pagination.currentPage - 1,
          size: pagination.itemsPerPage,
          sort: sortParam,
          search: searchQuery,
          active: statusFilter === "all" ? undefined : statusFilter === "Active"
        });

        console.log('Received response:', response);

        if (!response) {
          throw new Error("No response received from server");
        }

        // Handle both array and paginated response formats
        const content = Array.isArray(response) ? response : response.content;
        const totalPages = response.totalPages || Math.ceil(content.length / pagination.itemsPerPage);
        const totalElements = response.totalElements || content.length;

        if (!Array.isArray(content)) {
          throw new Error("Invalid response format: content is not an array");
        }

        // Sort the data based on the current sort state
        const sortedContent = [...content].sort((a, b) => {
          if (sort.key === 'firstName') {
            // Sort by full name (firstName + lastName)
            const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
            const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
            return sort.direction === 'asc' 
              ? nameA.localeCompare(nameB)
              : nameB.localeCompare(nameA);
          }

          // Default sorting for other fields
          const valueA = a[sort.key as keyof User];
          const valueB = b[sort.key as keyof User];
          
          if (typeof valueA === 'string' && typeof valueB === 'string') {
            return sort.direction === 'asc'
              ? valueA.localeCompare(valueB)
              : valueB.localeCompare(valueA);
          }
          
          if (typeof valueA === 'number' && typeof valueB === 'number') {
            return sort.direction === 'asc'
              ? valueA - valueB
              : valueB - valueA;
          }
          
          if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
            return sort.direction === 'asc'
              ? (valueA === valueB ? 0 : valueA ? -1 : 1)
              : (valueA === valueB ? 0 : valueA ? 1 : -1);
          }

          return 0;
        });

        // If the response is an array and not paginated, manually paginate it
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        const paginatedContent = Array.isArray(response) 
          ? sortedContent.slice(startIndex, endIndex) 
          : sortedContent;

        console.log('Sorted and paginated content:', {
          startIndex,
          endIndex,
          totalItems: content.length,
          itemsPerPage: pagination.itemsPerPage,
          currentPage: pagination.currentPage,
          totalPages,
          sortKey: sort.key,
          sortDirection: sort.direction
        });

        const formattedPharmacists = paginatedContent.map((user: User) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phoneNumber || "N/A",
          status: user.isActive ? "Active" : "Inactive",
          originalUser: user
        }));

        setPharmacists(formattedPharmacists);
        setPagination(prev => ({
          ...prev,
          totalPages,
          totalItems: totalElements
        }));
        setError("");
      } catch (err) {
        console.error("Error fetching pharmacists:", err);
        setError(err instanceof Error ? err.message : "Failed to load pharmacists data. Please try again.");
        setPharmacists([]);
        setPagination(prev => ({
          ...prev,
          totalPages: 1,
          totalItems: 0
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacists();
  }, [pagination.currentPage, sort, searchQuery, statusFilter]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSort = (key: string) => {
    console.log('Sorting by:', key);
    setSort(prev => {
      const newDirection = prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc';
      console.log('New sort direction:', newDirection);
      return {
        key,
        direction: newDirection
      };
    });
  };

  const handleToggleStatus = async (pharmacist: Pharmacist) => {
    try {
      if (!pharmacist.originalUser) return;
      
      const newStatus = !pharmacist.originalUser.isActive;
      await AdminService.updateUser(pharmacist.originalUser.id, { isActive: newStatus });
      
      // Refresh the current page
      const response = await AdminService.getUsers({
        role: "PHARMACIST",
        page: pagination.currentPage,
        size: pagination.itemsPerPage,
        sort: `${sort.key},${sort.direction}`,
        search: searchQuery,
        active: statusFilter === "all" ? undefined : statusFilter === "Active"
      }) as PaginatedResponse<User>;

      if (!response || !Array.isArray(response.content)) {
        throw new Error("Invalid response format from server");
      }

      const formattedPharmacists = response.content.map((user: User) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phoneNumber || "N/A",
        status: user.isActive ? "Active" : "Inactive",
        originalUser: user
      }));

      setPharmacists(formattedPharmacists);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages,
        totalItems: response.totalElements
      }));
    } catch (err) {
      console.error("Error updating pharmacist status:", err);
      alert("Failed to update pharmacist status. Please try again.");
    }
  };

  return (
    <DashboardLayout userType="admin" title="Pharmacists Management">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block">{error}</span>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Pharmacists Directory</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
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
            <select
              className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
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
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>ID</span>
                        <span className="text-xs">{sort.key === 'id' ? (sort.direction === 'asc' ? '↑' : '↓') : '↕️'}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('firstName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        <span className="text-xs">{sort.key === 'firstName' ? (sort.direction === 'asc' ? '↑' : '↓') : '↕️'}</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('isActive')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        <span className="text-xs">{sort.key === 'isActive' ? (sort.direction === 'asc' ? '↑' : '↓') : '↕️'}</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pharmacists.map((pharmacist) => (
                    <tr key={pharmacist.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pharmacist.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pharmacist.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{pharmacist.email}</div>
                        <div>{pharmacist.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          pharmacist.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {pharmacist.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => router.push(`/admin/pharmacists/${pharmacist.id}`)}
                        >
                          Edit
                        </button>
                        <button 
                          className={`${pharmacist.status === 'Active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                          onClick={() => handleToggleStatus(pharmacist)}
                        >
                          {pharmacist.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {pharmacists.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No pharmacists found matching your criteria.
              </div>
            )}
            
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 