"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReceptionistService from "@/services/receptionist.service";

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bills, setBills] = useState([]);
  const router = useRouter();
  
  useEffect(() => {
    const fetchBillings = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch billings from the API
        const filters = {};
        if (statusFilter !== "all") {
          filters.status = statusFilter;
        }
        
        const data = await ReceptionistService.getBillings(filters);
        
        // Transform the API data to match the expected format
        const formattedBills = data.map(bill => ({
          id: bill.billNumber,
          patient: `${bill.patient.firstName} ${bill.patient.lastName}`,
          patientId: bill.patient.patientId,
          date: bill.billDate,
          amount: bill.totalAmount,
          items: bill.billingItems.map(item => ({
            name: item.description,
            price: item.totalPrice
          })),
          status: bill.status,
          paymentMethod: bill.paymentMethod,
          paymentDate: bill.payments && bill.payments.length > 0 
            ? bill.payments[0].paymentDate 
            : null
        }));
        
        setBills(formattedBills);
      } catch (err) {
        console.error("Error fetching billings:", err);
        setError("Failed to load billing data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBillings();
  }, [statusFilter]); // Re-fetch when status filter changes
  
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  const filteredBills = bills.filter(bill => 
    (searchQuery === "" || 
     bill.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
     bill.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
     bill.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Calculate totals
  const totalAmount = bills.reduce((sum, bill) => sum + Number(bill.amount), 0);
  const paidAmount = bills
    .filter(bill => bill.status === "PAID")
    .reduce((sum, bill) => sum + Number(bill.amount), 0);
  const pendingAmount = bills
    .filter(bill => bill.status === "PENDING" || bill.status === "PARTIALLY_PAID")
    .reduce((sum, bill) => sum + Number(bill.amount), 0);

  return (
    <DashboardLayout userType="receptionist" title="Billing Management">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">${totalAmount.toFixed(2)}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Collected Payments</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">${paidAmount.toFixed(2)}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Payments</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">${pendingAmount.toFixed(2)}</dd>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Invoices</h2>
          <div className="flex flex-col md:flex-row space-x-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search invoices..."
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full text-gray-700"
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
                value={statusFilter}
                onChange={handleStatusChange}
              >
                <option value="all">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIALLY_PAID">Partial</option>
              </select>
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => router.push("/receptionist/billing/new")}
              >
                Create Invoice
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium">{bill.patient}</div>
                        <div className="text-xs">{bill.patientId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bill.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${parseFloat(bill.amount).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bill.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          bill.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          bill.status === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {bill.status === 'PAID' ? 'Paid' : 
                           bill.status === 'PENDING' ? 'Pending' : 
                           bill.status === 'PARTIALLY_PAID' ? 'Partial' : bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => router.push(`/receptionist/billing/${bill.id}`)}
                        >
                          View
                        </button>
                        {bill.status !== 'PAID' && (
                          <>
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => router.push(`/receptionist/billing/${bill.id}/payment`)}
                            >
                              Process Payment
                            </button>
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => router.push(`/receptionist/billing/${bill.id}/edit`)}
                            >
                              Edit
                            </button>
                          </>
                        )}
                        <button className="text-indigo-600 hover:text-indigo-900">Print</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredBills.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No invoices found matching your criteria.
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredBills.length}</span> of <span className="font-medium">{bills.length}</span> invoices
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 