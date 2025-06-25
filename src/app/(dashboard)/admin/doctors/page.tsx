"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  specialization?: string;
  availability?: string;
  nextAvailable?: string;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  specialization: string;
  availability: string;
  nextAvailable: string;
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

export default function DoctorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
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
  
  // Add sort configuration
  const sortConfig = {
    id: { key: 'id', label: 'Doctor ID' },
    firstName: { key: 'firstName', label: 'Name' },
    lastName: { key: 'lastName', label: 'Last Name' },
    email: { key: 'email', label: 'Email' },
    specialization: { key: 'specialization', label: 'Specialty' },
    isActive: { key: 'isActive', label: 'Status' },
    availability: { key: 'availability', label: 'Availability' },
    nextAvailable: { key: 'nextAvailable', label: 'Next Available' }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const sortParam = `${sort.key},${sort.direction}`;
        const requestParams = {
          role: "DOCTOR",
          page: pagination.currentPage - 1,
          size: pagination.itemsPerPage,
          sort: sortParam,
          search: searchQuery,
          active: statusFilter === "all" ? undefined : statusFilter === "Active",
          specialization: specialtyFilter === "all" ? undefined : specialtyFilter
        };

        // Log the exact URL and parameters being sent
        const params = new URLSearchParams();
        Object.entries(requestParams).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, value.toString());
        });
        console.log('API Request URL:', `/admin/users?${params.toString()}`);
        console.log('Request Parameters:', requestParams);

        const response = await AdminService.getUsers(requestParams);

        // Log the raw response and parsed data
        console.log('Raw API Response:', response);
        console.log('Response Content:', response.content);
        console.log('Current Specialty Filter:', specialtyFilter);
        
        // Log each doctor's specialty for debugging
        if (response.content) {
          console.log('Doctor Specialties:', response.content.map(doc => ({
            id: doc.id,
            name: `${doc.firstName} ${doc.lastName}`,
            specialty: doc.specialization || 'General Medicine'
          })));
        }

        // Check if response exists and has the expected structure
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
          
          if (sort.key === 'specialization') {
            // Sort by specialization, handling null/undefined values
            const specA = (a.specialization || 'General Medicine').toLowerCase().trim();
            const specB = (b.specialization || 'General Medicine').toLowerCase().trim();
            
            // Log the comparison for debugging
            console.log('Sorting specialties:', {
              a: specA,
              b: specB,
              direction: sort.direction,
              result: sort.direction === 'asc' 
                ? specA.localeCompare(specB)
                : specB.localeCompare(specA)
            });
            
            return sort.direction === 'asc'
              ? specA.localeCompare(specB)
              : specB.localeCompare(specA);
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

        // Log the sorted specialties for verification
        if (sort.key === 'specialization') {
          console.log('Sorted specialties:', sortedContent.map(doc => ({
            name: `${doc.firstName} ${doc.lastName}`,
            specialty: doc.specialization || 'General Medicine',
            direction: sort.direction
          })));
        }

        // If the response is an array and not paginated, manually paginate it
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        const endIndex = startIndex + pagination.itemsPerPage;
        const paginatedContent = Array.isArray(response) 
          ? sortedContent.slice(startIndex, endIndex) 
          : sortedContent;

        // Update the formatted doctors with consistent specialty handling
        const formattedDoctors = paginatedContent.map((user: User) => {
          const specialty = user.specialization || 'General Medicine';
          return {
            id: user.id,
            name: `Dr. ${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phoneNumber || "N/A",
            specialty: specialty,
            specialization: specialty, // Use the same value for consistency
            availability: user.availability || "Mon-Fri",
            nextAvailable: user.nextAvailable || new Date().toISOString().split('T')[0],
            status: user.isActive ? "Active" : "Inactive",
            originalUser: user
          };
        });

        // Log the final formatted doctors for verification
        if (sort.key === 'specialization') {
          console.log('Final formatted doctors with specialties:', formattedDoctors.map(doc => ({
            name: doc.name,
            specialty: doc.specialization
          })));
        }

        setDoctors(formattedDoctors);
        setPagination(prev => ({
          ...prev,
          totalPages,
          totalItems: totalElements
        }));
        setError("");
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(err instanceof Error ? err.message : "Failed to load doctors data. Please try again.");
        setDoctors([]);
        setPagination(prev => ({
          ...prev,
          totalPages: 1,
          totalItems: 0
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [pagination.currentPage, sort, searchQuery, statusFilter, specialtyFilter]);

  // Get all unique specialties for the filter
  const specialties = [...new Set(doctors.filter(d => d.specialization).map(d => d.specialization))];
  
  // Add debug logging for specialties
  useEffect(() => {
    console.log('Available specialties:', specialties);
    console.log('Current specialty filter:', specialtyFilter);
    console.log('Filtered doctors:', doctors.filter(d => 
      specialtyFilter === 'all' || d.specialization === specialtyFilter
    ));
  }, [specialties, specialtyFilter, doctors]);

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

  // Add a function to get sort indicator
  const getSortIndicator = (key: string) => {
    if (sort.key !== sortConfig[key as keyof typeof sortConfig]?.key) {
      return '↕️'; // Neutral indicator
    }
    return sort.direction === 'asc' ? '↑' : '↓';
  };

  const handleToggleStatus = async (doctor: Doctor) => {
    try {
      if (!doctor.originalUser) return;
      
      const newStatus = !doctor.originalUser.isActive;
      await AdminService.updateUser(doctor.originalUser.id, { isActive: newStatus });
      
      // Refresh the current page
      const response = await AdminService.getUsers({ 
        role: "DOCTOR",
        page: pagination.currentPage,
        size: pagination.itemsPerPage,
        sort: `${sort.key},${sort.direction}`,
        search: searchQuery,
        active: statusFilter === "all" ? undefined : statusFilter === "Active"
      }) as PaginatedResponse<User>;
      
      if (!response || !Array.isArray(response.content)) {
        throw new Error("Invalid response format from server");
      }
      
      const formattedDoctors = response.content.map((user: User) => ({
        id: user.id,
        name: `Dr. ${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phoneNumber || "N/A",
        specialty: user.specialization || "General Medicine",
        specialization: user.specialization || "General Medicine",
        availability: user.availability || "Mon-Fri",
        nextAvailable: user.nextAvailable || new Date().toISOString().split('T')[0],
        status: user.isActive ? "Active" : "Inactive",
        originalUser: user
      }));
      
      setDoctors(formattedDoctors);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages,
        totalItems: response.totalElements
      }));
    } catch (err) {
      console.error("Error updating doctor status:", err);
      alert("Failed to update doctor status. Please try again.");
    }
  };

  return (
    <DashboardLayout userType="admin" title="Doctors Management">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block">{error}</span>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Doctors Directory</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full text-gray-700"
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
            <div className="flex space-x-2">
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                value={specialtyFilter}
                onChange={(e) => {
                  console.log('Selected specialty:', e.target.value);
                  setSpecialtyFilter(e.target.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
              >
                <option value="all">All Specialties</option>
                {specialties.sort().map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty || 'General Medicine'}
                  </option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
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
                        <span>Doctor ID</span>
                        <span className="text-xs">{getSortIndicator('id')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('firstName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        <span className="text-xs">{getSortIndicator('firstName')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('specialization')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Specialty</span>
                        <span className="text-xs">{getSortIndicator('specialization')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('availability')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Availability</span>
                        <span className="text-xs">{getSortIndicator('availability')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('isActive')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        <span className="text-xs">{getSortIndicator('isActive')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{doctor.email}</div>
                        <div>{doctor.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialization}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{doctor.availability}</div>
                        <div className="text-xs text-gray-400">Next: {doctor.nextAvailable}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          doctor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {doctor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => router.push(`/admin/doctors/${doctor.id}`)}
                        >
                          Edit
                        </button>
                        <button 
                          className={`${doctor.status === 'Active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                          onClick={() => handleToggleStatus(doctor)}
                        >
                          {doctor.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {doctors.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No doctors found matching your criteria.
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