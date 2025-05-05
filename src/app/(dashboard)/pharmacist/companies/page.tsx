"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import pharmacistService from '@/services/pharmacist.service';

// Define the Company type
type Company = {
  id: number;
  companyId: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  contactPerson: string;
  licenseNumber: string;
  registrationDate: string;
};

const ManageCompanies = () => {
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Company, 'id' | 'companyId'>>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    contactPerson: '',
    licenseNumber: '',
    registrationDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Fetch companies (mocked)
  useEffect(() => {
    setLoading(true);
    setError('');
    setTimeout(async () => {
      try {
        // const data: Company[] = [
        const data = await pharmacistService.getCompanies();
        console.log(data);
        //   {
        //     id: 1,
        //     companyId: 'COMP-001',
        //     name: 'HealthCo',
        //     address: '123 Main St',
        //     phone: '+1 123-456-7890',
        //     email: 'contact@healthco.com',
        //     website: 'https://healthco.com',
        //     contactPerson: 'Jane Doe',
        //     licenseNumber: 'LIC-45678',
        //     registrationDate: '2023-01-15',
        //   },
        //   {
        //     id: 2,
        //     companyId: 'COMP-002',
        //     name: 'MediSupply',
        //     address: '456 Wellness Ave',
        //     phone: '+1 987-654-3210',
        //     email: 'info@medisupply.com',
        //     website: 'https://medisupply.com',
        //     contactPerson: 'John Smith',
        //     licenseNumber: 'LIC-12345',
        //     registrationDate: '2023-01-15',
        //   },
        // ];
        setCompanies(data);
        setFilteredCompanies(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch companies');
        setLoading(false);
      }
    }, 1000);
  }, [retryCount]);

  // Filter companies on search
  useEffect(() => {
    const filtered = companies.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [searchQuery, companies]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newCompany: Company = {
      id: companies.length + 1,
      companyId: `COMP-${companies.length + 1}`,
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
      contactPerson: formData.contactPerson,
      licenseNumber: formData.licenseNumber,
      registrationDate: formData.registrationDate,
    };
    await pharmacistService.addCompany(newCompany);
    setCompanies([...companies, newCompany]);
    setFilteredCompanies([...filteredCompanies, newCompany]);
    setShowAddModal(false);
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      contactPerson: '',
      licenseNumber: '',
      registrationDate: '',
    });
    setSuccessMessage('Company added successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(retryCount + 1);
    } else {
      setError('Please try again later.');
    }
  };

  const handleViewMedicines = (company: Company) => {
    alert(`Viewing medicines for ${company.name}`);
  };

  const formatPhoneNumber = (phone: string) => phone; // Placeholder

  // You can return your JSX here (e.g., UI layout, modals, etc.)
  return (
    <DashboardLayout userType="pharmacist" title="Manage Companies">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Companies</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Company
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search companies..."
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
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
            <button 
              onClick={handleRetry}
              className="ml-auto text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              {retryCount < 3 ? `Retry (${3 - retryCount} attempts left)` : 'Try Again'}
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
            <p className="text-gray-500">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <p className="text-gray-500">No companies found.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-indigo-600 hover:text-indigo-800"
            >
              Add your first company
            </button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
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
                      {company.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{company.contactPerson}</div>
                      <div className="text-xs text-gray-400">{formatPhoneNumber(company.phone)}</div>
                      <div className="text-xs text-gray-400">{company.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.licenseNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => router.push(`/pharmacist/companies/${company.id || company.companyId}`)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => router.push(`/pharmacist/medicines/add?companyId=${company.id || company.companyId}`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Add Medicine
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Company Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Add New Company</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name*
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., PharmaCorp Inc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address*
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., 123 Medicine Lane, New York, NY"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone*
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., +1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., contact@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., www.company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., John Smith"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Number
                      </label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., LIC-12345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration Date
                      </label>
                      <input
                        type="date"
                        name="registrationDate"
                        value={formData.registrationDate ?? ''}

                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {loading ? "Saving..." : "Save Company"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ManageCompanies;
