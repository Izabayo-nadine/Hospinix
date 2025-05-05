"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import ReceptionistService from "@/services/receptionist.service";

export default function NewBillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  
  const [formData, setFormData] = useState({
    patientId: "",
    appointmentId: appointmentId || "",
    description: "Medical services",
    items: [
      { description: "Consultation Fee", amount: 100.00 }
    ],
    paymentMethod: "CASH",
    status: "PENDING"
  });
  
  useEffect(() => {
    const fetchData = async () => {
      if (!appointmentId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch appointment details
        const appointmentData = await ReceptionistService.getAppointmentById(appointmentId);
        setAppointment(appointmentData);
        
        // Set patient information
        setPatient(appointmentData.patient);
        
        // Update form data
        setFormData(prev => ({
          ...prev,
          patientId: appointmentData.patient.id,
          appointmentId: appointmentId,
          items: [
            { 
              description: `${appointmentData.type} Consultation`, 
              amount: appointmentData.type === "EMERGENCY" ? 150.00 : 100.00 
            }
          ]
        }));
        
      } catch (err) {
        console.error("Error loading appointment data:", err);
        setErrorMessage("Failed to load appointment data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [appointmentId]);
  
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: "", amount: 0 }]
    }));
  };
  
  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
  
  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: field === 'amount' ? (value === '' ? '' : parseFloat(value) || 0) : value
      };
      return { ...prev, items: newItems };
    });
  };
  
  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setErrorMessage("");
      
      // Prepare billing data
      const billingData = {
        patientId: formData.patientId,
        appointmentId: formData.appointmentId,
        items: formData.items,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        description: formData.description,
        totalAmount: calculateTotal()
      };
      
      console.log("Creating billing with data:", billingData);
      
      // Create billing
      await ReceptionistService.createBilling(billingData);
      
      setSuccessMessage("Billing created successfully");
      
      // Redirect back to billings list after a short delay
      setTimeout(() => {
        router.push("/receptionist/billing");
      }, 2000);
      
    } catch (err) {
      console.error("Error creating billing:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to create billing. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout userType="receptionist" title="Generate Invoice">
      <div className="bg-white shadow rounded-lg p-6">
        {errorMessage && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
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
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Patient Information</h2>
              
              {patient ? (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Patient Name</p>
                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Patient ID</p>
                      <p className="font-medium">{patient.patientId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{patient.phoneNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{patient.email || "N/A"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-yellow-600">
                  No patient selected. Please select an appointment.
                </div>
              )}
            </div>
            
            {appointment && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Appointment Details</h2>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(appointment.appointmentDateTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{formatTime(appointment.appointmentDateTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">{appointment.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Doctor</p>
                      <p className="font-medium">Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{appointment.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{appointment.duration} minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Billing Items</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">$</span>
                            <input
                              type="number"
                              value={item.amount === '' ? '' : (item.amount || 0)}
                              onChange={(e) => updateItem(index, 'amount', e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              step="0.01"
                              min="0"
                              required
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-6 py-4">
                        <button
                          type="button"
                          onClick={addItem}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          + Add Item
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-right font-bold">Total</td>
                      <td className="px-6 py-4 font-bold">${calculateTotal().toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="INSURANCE">Insurance</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIALLY_PAID">Partial Payment</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => router.push("/receptionist/billing")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !patient}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Invoice"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
} 