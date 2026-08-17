"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AdminService from "@/services/admin.service";
import Pagination from "@/components/Pagination";

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
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  specialization: string;
  availability: string;
  nextAvailable: string;
  status: string;
  isActive: boolean;
  originalUser: User;
}

const PREDEFINED_SPECIALTIES = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "General Medicine",
  "Dermatology",
  "Gynecology",
  "Ophthalmology"
];

export default function DoctorsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  // Stores ALL fetched doctors
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10
  });

  const [sort, setSort] = useState({
    key: "firstName",
    direction: "asc" as "asc" | "desc",
  });

  // Fetch all doctors on mount
  useEffect(() => {
    const fetchAllDoctors = async () => {
      try {
        setLoading(true);
        // Fetch a large number to emulate "getting all" for client-side processing
        // Ideally the API would support a "getAll" flag or we'd page through everything,
        // but for this dashboard size=1000 should suffice.
        const requestParams = {
          role: "DOCTOR",
          page: 0,
          size: 1000,
        };

        const response = await AdminService.getUsers(requestParams);

        if (!response) {
          throw new Error("No response received from server");
        }

        const content = Array.isArray(response) ? response : response.content;

        if (!Array.isArray(content)) {
          throw new Error("Invalid response format");
        }

        const formattedDoctors: Doctor[] = content.map((user: User) => {
          const specialty = user.specialization || 'General Medicine';
          return {
            id: user.id,
            name: `Dr. ${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phoneNumber || "N/A",
            specialty: specialty,
            specialization: specialty,
            availability: user.availability || "Mon-Fri",
            nextAvailable: user.nextAvailable || new Date().toISOString().split('T')[0],
            status: user.isActive ? "Active" : "Inactive",
            isActive: user.isActive,
            originalUser: user
          };
        });

        setAllDoctors(formattedDoctors);
        setError("");
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(err instanceof Error ? err.message : "Failed to load doctors data.");
        setAllDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDoctors();
  }, []);

  // Filter, Sort, and Paginate Logic using useMemo
  const processedDoctors = useMemo(() => {
    let filtered = [...allDoctors];

    // 1. Search Filter (Client-side, enables full name search)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(query) ||
        doc.email.toLowerCase().includes(query) ||
        doc.specialty.toLowerCase().includes(query)
      );
    }

    // 2. Status Filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    // 3. Specialty Filter
    if (specialtyFilter !== "all") {
      filtered = filtered.filter(doc =>
        doc.specialization.toLowerCase() === specialtyFilter.toLowerCase()
      );
    }

    // 4. Sorting
    filtered.sort((a, b) => {
      let valA: any = a[sort.key as keyof Doctor];
      let valB: any = b[sort.key as keyof Doctor];

      // Handle specific sort keys
      if (sort.key === 'name' || sort.key === 'firstName') {
        valA = `${a.firstName} ${a.lastName}`.toLowerCase();
        valB = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else if (sort.key === 'specialization') {
        valA = a.specialization.toLowerCase();
        valB = b.specialization.toLowerCase();
      } else if (sort.key === 'isActive') {
        valA = a.isActive;
        valB = b.isActive;
      }

      if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allDoctors, searchQuery, statusFilter, specialtyFilter, sort]);

  // Pagination Logic
  const totalItems = processedDoctors.length;
  const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
  const paginatedDoctors = processedDoctors.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  // Available specialties for filter dropdown
  const availableSpecialties = useMemo(() => {
    const fromData = allDoctors.map(d => d.specialization);
    // Combine predefined and existing, remove duplicates, sort
    return Array.from(new Set([...PREDEFINED_SPECIALTIES, ...fromData])).sort();
  }, [allDoctors]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSort = (key: string) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIndicator = (key: string) => {
    if (sort.key !== key) return '↕️';
    return sort.direction === 'asc' ? '↑' : '↓';
  };

  const handleToggleStatus = async (doctor: Doctor) => {
    try {
      // Optimistic Update
      const newStatus = !doctor.isActive;
      const newStatusString = newStatus ? "Active" : "Inactive";

      setAllDoctors(prevDocs =>
        prevDocs.map(d =>
          d.id === doctor.id
            ? { ...d, isActive: newStatus, status: newStatusString }
            : d
        )
      );

      // API Call
      await AdminService.updateUser(doctor.id, { isActive: newStatus });

      // No need to re-fetch if successful, our local state is already updated provided backend does what we expect.
      // If we wanted to be strictly safe, we could re-fetch here, but for "responsiveness" optimitic is better.
    } catch (err) {
      console.error("Error updating doctor status:", err);
      alert("Failed to update doctor status. Reverting changes.");

      // Revert Optimistic Update
      setAllDoctors(prevDocs =>
        prevDocs.map(d =>
          d.id === doctor.id
            ? { ...d, isActive: !doctor.isActive, status: doctor.isActive ? "Active" : "Inactive" } // Reset to original
            : d
        )
      );
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
                placeholder="Search by name, email, specialty..."
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-1 focus:border-gray-700 w-full text-gray-700 pr-6"
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
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-1 focus:ring-indigo-500 focus:border-gray-700 text-gray-700"
                value={specialtyFilter}
                onChange={(e) => {
                  setSpecialtyFilter(e.target.value);
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
              >
                <option value="all">All Specialties</option>
                {availableSpecialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-1 focus:ring-indigo-500 focus:border-gray-700 text-gray-700"
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
                  {paginatedDoctors.map((doctor) => (
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doctor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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

            {paginatedDoctors.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No doctors found matching your criteria.
              </div>
            )}

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
