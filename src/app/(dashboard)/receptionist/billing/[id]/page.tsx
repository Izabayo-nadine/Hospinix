"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ReceptionistService from "@/services/receptionist.service";

export default function BillingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [billing, setBilling] = useState(null);
  
  useEffect(() => {
    const fetchBillingDetails = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch billing details from API
        const data = await ReceptionistService.getBillingById(id);
        setBilling(data);
      } catch (err) {
        console.error("Error fetching billing details:", err);
        setError("Failed to load billing details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBillingDetails();
  }, [id]);
  
  // Format date strings to local format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format time strings
  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handlePrintInvoice = () => {
    window.print();
  };
  
  // Calculate balance due
  const calculateBalanceDue = () => {
    if (!billing) return 0;
    const total = parseFloat(billing.totalAmount) || 0;
    const paid = parseFloat(billing.paidAmount) || 0;
    return total - paid;
  };
  
  const renderLoading = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  const renderError = () => (
    <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg print:hidden">
      {error}
    </div>
  );
  
  const renderNotFound = () => (
    <div className="text-center py-10">
      <p className="text-gray-500">Billing record not found.</p>
      <button
        onClick={() => router.push("/receptionist/billing")}
        className="mt-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        Back to Billing List
      </button>
    </div>
  );
  
  const renderBillingDetails = () => {
    if (!billing) return null;
    
    return (
      <>
        <div className="flex justify-between items-center mb-6 print:mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Invoice #{billing.billNumber}</h1>
          <div className="space-x-2 print:hidden">
            <button
              onClick={() => router.back()}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            {billing.status !== "PAID" && (
              <button
                onClick={() => router.push(`/receptionist/billing/${billing.id}/payment`)}
                className="px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Process Payment
              </button>
            )}
            <button
              onClick={handlePrintInvoice}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Print
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 print:mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="font-medium text-lg text-gray-900 mb-2">Patient Information</h2>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Name:</span> {billing.patient.firstName} {billing.patient.lastName}</p>
                <p><span className="text-gray-500">Patient ID:</span> {billing.patient.patientId}</p>
                <p><span className="text-gray-500">Phone:</span> {billing.patient.phoneNumber || "N/A"}</p>
                <p><span className="text-gray-500">Email:</span> {billing.patient.email || "N/A"}</p>
              </div>
            </div>
            
            <div>
              <h2 className="font-medium text-lg text-gray-900 mb-2">Invoice Information</h2>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Invoice Date:</span> {formatDate(billing.billDate)}</p>
                <p><span className="text-gray-500">Due Date:</span> {formatDate(billing.dueDate)}</p>
                <p>
                  <span className="text-gray-500">Status:</span> 
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    billing.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    billing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    billing.status === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {billing.status === 'PAID' ? 'Paid' : 
                     billing.status === 'PENDING' ? 'Pending' : 
                     billing.status === 'PARTIALLY_PAID' ? 'Partial Payment' : billing.status}
                  </span>
                </p>
                <p><span className="text-gray-500">Payment Method:</span> {billing.paymentMethod || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="font-medium text-lg text-gray-900 mb-4">Billing Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {billing.billingItems && billing.billingItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${parseFloat(item.unitPrice).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(item.totalPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-900">Subtotal</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${parseFloat(billing.totalAmount).toFixed(2)}</td>
                </tr>
                {billing.discount && parseFloat(billing.discount) > 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right font-medium text-gray-900">Discount</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-${parseFloat(billing.discount).toFixed(2)}</td>
                  </tr>
                )}
                {billing.tax && parseFloat(billing.tax) > 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right font-medium text-gray-900">Tax</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(billing.tax).toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-900">Total</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${parseFloat(billing.totalAmount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-bold text-green-600">Paid Amount</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">${parseFloat(billing.paidAmount || 0).toFixed(2)}</td>
                </tr>
                {(billing.status === "PENDING" || billing.status === "PARTIALLY_PAID") && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right font-bold text-red-600">Balance Due</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                      ${calculateBalanceDue().toFixed(2)}
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
        </div>
        
        {billing.payments && billing.payments.length > 0 && (
          <div className="mt-8">
            <h2 className="font-medium text-lg text-gray-900 mb-4">Payment History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billing.payments.map((payment, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.paymentDate)} {formatTime(payment.paymentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(payment.amount).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.paymentMethod}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.referenceNumber || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {billing.notes && (
          <div className="mt-8">
            <h2 className="font-medium text-lg text-gray-900 mb-2">Notes</h2>
            <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-700">
              {billing.notes}
            </div>
          </div>
        )}
      </>
    );
  };
  
  return (
    <DashboardLayout userType="receptionist" title="Billing Details">
      <div className="bg-white shadow rounded-lg p-6 print:shadow-none">
        {error && renderError()}
        
        {loading ? (
          renderLoading()
        ) : billing ? (
          renderBillingDetails()
        ) : (
          renderNotFound()
        )}
      </div>
    </DashboardLayout>
  );
} 