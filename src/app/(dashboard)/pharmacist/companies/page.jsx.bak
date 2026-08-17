// import React, { useState, useEffect } from 'react';
// import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
// import PharmacistService from '@/services/pharmacist.service';
// import { DashboardLayout } from '@/components/layout/DashboardLayout';
// import CompanyForm from '@/components/forms/CompanyForm';
// import { Dialog } from '@/components/ui/Dialog';
// import { Button } from '@/components/ui/Button';

// export default function Companies() {
//   const [companies, setCompanies] = useState([]);
//   const [filteredCompanies, setFilteredCompanies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [selectedCompany, setSelectedCompany] = useState(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchCompanies();
//   }, []);

//   useEffect(() => {
//     if (searchQuery.trim() === '') {
//       setFilteredCompanies(companies);
//     } else {
//       const query = searchQuery.toLowerCase();
//       setFilteredCompanies(
//         companies.filter(
//           (company) =>
//             company.name.toLowerCase().includes(query) ||
//             company.email.toLowerCase().includes(query) ||
//             company.phone.toLowerCase().includes(query)
//         )
//       );
//     }
//   }, [searchQuery, companies]);

//   const fetchCompanies = async () => {
//     setLoading(true);
//     try {
//       const data = await PharmacistService.getCompanies();
//       setCompanies(data);
//       setFilteredCompanies(data);
//     } catch (err) {
//       console.error('Failed to fetch companies:', err);
//       setError('Failed to load companies. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddCompany = (newCompany) => {
//     setCompanies([...companies, newCompany]);
//     setShowAddModal(false);
//   };

//   const handleEditCompany = (updatedCompany) => {
//     setCompanies(
//       companies.map((company) =>
//         company.id === updatedCompany.id ? updatedCompany : company
//       )
//     );
//     setShowEditModal(false);
//   };

//   const handleDeleteCompany = async () => {
//     if (!selectedCompany) return;
    
//     try {
//       await PharmacistService.deleteCompany(selectedCompany.id);
//       setCompanies(companies.filter((c) => c.id !== selectedCompany.id));
//       setShowDeleteConfirm(false);
//       setSelectedCompany(null);
//     } catch (err) {
//       console.error('Failed to delete company:', err);
//       setError('Failed to delete company. Please try again.');
//     }
//   };

//   // For demo purposes, using hardcoded data initially
//   // In production, remove this and use the actual API data
//   useEffect(() => {
//     if (companies.length === 0 && !loading) {
//       const demoCompanies = [
//         {
//           id: 1,
//           name: 'Novartis Pharmaceuticals',
//           email: 'info@novartis.com',
//           phone: '+1 (888) 123-4567',
//           address: '123 Pharma Way, Basel, Switzerland',
//           website: 'https://www.novartis.com',
//           contactPerson: 'John Smith',
//           registrationNumber: 'REG12345',
//           description: 'A global healthcare company based in Switzerland that provides solutions to address the evolving needs of patients worldwide.'
//         },
//         {
//           id: 2,
//           name: 'Johnson & Johnson',
//           email: 'contact@jnj.com',
//           phone: '+1 (866) 565-2229',
//           address: '1 Johnson & Johnson Plaza, New Brunswick, NJ, USA',
//           website: 'https://www.jnj.com',
//           contactPerson: 'Sarah Williams',
//           registrationNumber: 'REG67890',
//           description: 'An American multinational corporation that develops medical devices, pharmaceutical, and consumer packaged goods.'
//         },
//         {
//           id: 3,
//           name: 'Pfizer Inc.',
//           email: 'info@pfizer.com',
//           phone: '+1 (800) 879-3477',
//           address: '235 East 42nd Street, New York, NY, USA',
//           website: 'https://www.pfizer.com',
//           contactPerson: 'Michael Brown',
//           registrationNumber: 'REG24680',
//           description: 'A premier innovative biopharmaceutical company that discovers, develops and provides medicines, vaccines and consumer healthcare products.'
//         }
//       ];
//       setCompanies(demoCompanies);
//       setFilteredCompanies(demoCompanies);
//     }
//   }, [companies, loading]);

//   return (
//     <DashboardLayout>
//       <div className="p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">Pharmaceutical Companies</h1>
//           <Button 
//             onClick={() => setShowAddModal(true)}
//             className="flex items-center gap-2"
//           >
//             <Plus size={16} />
//             Add Company
//           </Button>
//         </div>

//         {error && (
//           <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
//             {error}
//             <button 
//               className="ml-2 font-bold"
//               onClick={() => setError('')}
//             >
//               ✕
//             </button>
//           </div>
//         )}

//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           {/* Search & Filter Bar */}
//           <div className="p-4 border-b border-gray-200">
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Search size={18} className="text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search companies by name, email or phone..."
//                 className="pl-10 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Companies Table */}
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Company
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Contact
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Registration
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {loading ? (
//                   <tr>
//                     <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
//                       Loading companies...
//                     </td>
//                   </tr>
//                 ) : filteredCompanies.length === 0 ? (
//                   <tr>
//                     <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
//                       No companies found. {searchQuery ? 'Try a different search query.' : 'Add a company to get started.'}
//                     </td>
//                   </tr>
//                 ) : (
//                   filteredCompanies.map((company) => (
//                     <tr key={company.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div>
//                             <div className="text-sm font-medium text-gray-900">{company.name}</div>
//                             <div className="text-sm text-gray-500">{company.website}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{company.email}</div>
//                         <div className="text-sm text-gray-500">{company.phone}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {company.registrationNumber || 'N/A'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                         <button
//                           onClick={() => {
//                             setSelectedCompany(company);
//                             setShowViewModal(true);
//                           }}
//                           className="text-blue-600 hover:text-blue-900 mr-3"
//                         >
//                           <Eye size={18} />
//                         </button>
//                         <button
//                           onClick={() => {
//                             setSelectedCompany(company);
//                             setShowEditModal(true);
//                           }}
//                           className="text-indigo-600 hover:text-indigo-900 mr-3"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button
//                           onClick={() => {
//                             setSelectedCompany(company);
//                             setShowDeleteConfirm(true);
//                           }}
//                           className="text-red-600 hover:text-red-900"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Add Company Modal */}
//       <Dialog
//         open={showAddModal}
//         onClose={() => setShowAddModal(false)}
//         title="Add New Company"
//       >
//         <CompanyForm
//           onSuccess={handleAddCompany}
//           onCancel={() => setShowAddModal(false)}
//         />
//       </Dialog>

//       {/* Edit Company Modal */}
//       <Dialog
//         open={showEditModal}
//         onClose={() => setShowEditModal(false)}
//         title="Edit Company"
//       >
//         {selectedCompany && (
//           <CompanyForm
//             company={selectedCompany}
//             onSuccess={handleEditCompany}
//             onCancel={() => setShowEditModal(false)}
//           />
//         )}
//       </Dialog>

//       {/* View Company Modal */}
//       <Dialog
//         open={showViewModal}
//         onClose={() => setShowViewModal(false)}
//         title="Company Details"
//       >
//         {selectedCompany && (
//           <div className="p-6">
//             <div className="mb-6">
//               <h2 className="text-2xl font-bold mb-2">{selectedCompany.name}</h2>
//               <p className="text-gray-500">{selectedCompany.website}</p>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//               <div>
//                 <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
//                 <p className="mt-1 text-sm text-gray-900">{selectedCompany.email}</p>
//                 <p className="mt-1 text-sm text-gray-900">{selectedCompany.phone}</p>
//                 <p className="mt-1 text-sm text-gray-900">Contact: {selectedCompany.contactPerson || 'N/A'}</p>
//               </div>
              
//               <div>
//                 <h3 className="text-sm font-medium text-gray-500">Registration</h3>
//                 <p className="mt-1 text-sm text-gray-900">Number: {selectedCompany.registrationNumber || 'N/A'}</p>
//               </div>
//             </div>
            
//             <div className="mb-6">
//               <h3 className="text-sm font-medium text-gray-500">Address</h3>
//               <p className="mt-1 text-sm text-gray-900">{selectedCompany.address}</p>
//             </div>
            
//             <div>
//               <h3 className="text-sm font-medium text-gray-500">Description</h3>
//               <p className="mt-1 text-sm text-gray-900">{selectedCompany.description || 'No description available.'}</p>
//             </div>
            
//             <div className="mt-6 flex justify-end">
//               <button
//                 onClick={() => setShowViewModal(false)}
//                 className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         )}
//       </Dialog>

//       {/* Delete Confirmation Modal */}
//       <Dialog
//         open={showDeleteConfirm}
//         onClose={() => setShowDeleteConfirm(false)}
//         title="Confirm Delete"
//       >
//         {selectedCompany && (
//           <div className="p-6">
//             <p className="mb-4">
//               Are you sure you want to delete <strong>{selectedCompany.name}</strong>? This action cannot be undone.
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setShowDeleteConfirm(false)}
//                 className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDeleteCompany}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         )}
//       </Dialog>
//     </DashboardLayout>
//   );
// } 