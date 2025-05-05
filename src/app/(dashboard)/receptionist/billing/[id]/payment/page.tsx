"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ReceptionistService from "@/services/receptionist.service";

export default function ProcessPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [billing, setBilling] = useState(null);
  
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "CASH",
    referenceNumber: "",
    notes: ""
  });
  
  useEffect(() => {
    const fetchBillingDetails = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch billing details from API
        const data = await ReceptionistService.getBillingById(id);
        setBilling(data);
        
        // Set default payment amount to the total due
        const amountDue = parseFloat(data.totalAmount) - parseFloat(data.paidAmount || 0);
        setPaymentData(prev => ({
          ...prev,
          amount: amountDue.toFixed(2)
        }));
      } catch (err) {
        console.error("Error fetching billing details:", err);
        setError("Failed to load billing details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBillingDetails();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate payment amount
    const amountValue = parseFloat(paymentData.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }
    
    const amountDue = parseFloat(billing.totalAmount) - parseFloat(billing.paidAmount || 0);
    if (amountValue > amountDue) {
      setError("Payment amount cannot exceed the amount due.");
      return;
    }
    
    try {
      setSubmitting(true);
      setError("");
      
      // Process payment
      await ReceptionistService.processBillingPayment(id, paymentData);
      
      setSuccessMessage("Payment processed successfully");
      
      // Redirect back to billing details after a short delay
      setTimeout(() => {
        router.push(`/receptionist/billing/${id}`);
      }, 2000);
    } catch (err) {
      console.error("Error processing payment:", err);
      setError(err.response?.data?.message || "Failed to process payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Format date strings to local format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <DashboardLayout userType="receptionist" title="Process Payment">
      <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="p-4 mb-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : billing ? (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900">Process Payment for Invoice #{billing.billNumber}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Patient: {billing.patient.firstName} {billing.patient.lastName} | 
                Invoice Date: {formatDate(billing.billDate)}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-3">Payment Summary</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">${parseFloat(billing.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-medium text-green-600">${parseFloat(billing.paidAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span className="text-gray-800">Amount Due:</span>
                      <span className="text-red-600">
                        ${(parseFloat(billing.totalAmount) - parseFloat(billing.paidAmount || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {billing.status === "PAID" ? (
                  <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
                    <p className="font-medium">This invoice is fully paid.</p>
                    <button
                      onClick={() => router.push(`/receptionist/billing/${id}`)}
                      className="mt-3 w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      Back to Invoice
                    </button>
                  </div>
                ) : null}
              </div>
              
              {billing.status !== "PAID" && (
                <div>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                          Payment Amount *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            name="amount"
                            id="amount"
                            step="0.01"
                            min="0.01"
                            max={(parseFloat(billing.totalAmount) - parseFloat(billing.paidAmount || 0)).toFixed(2)}
                            required
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                            placeholder="0.00"
                            value={paymentData.amount}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                          Payment Method *
                        </label>
                        <select
                          id="paymentMethod"
                          name="paymentMethod"
                          required
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          value={paymentData.paymentMethod}
                          onChange={handleChange}
                        >
                          <option value="CASH">Cash</option>
                          <option value="CREDIT_CARD">Credit Card</option>
                          <option value="DEBIT_CARD">Debit Card</option>
                          <option value="INSURANCE">Insurance</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700">
                          Reference Number
                        </label>
                        <input
                          type="text"
                          name="referenceNumber"
                          id="referenceNumber"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="e.g., Transaction ID, Check number"
                          value={paymentData.referenceNumber}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows={3}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="Additional information about the payment"
                          value={paymentData.notes}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => router.back()}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {submitting ? "Processing..." : "Process Payment"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Billing record not found.</p>
            <button
              onClick={() => router.push("/receptionist/billing")}
              className="mt-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Billing List
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 