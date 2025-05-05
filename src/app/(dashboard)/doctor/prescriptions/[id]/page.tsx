"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import DoctorService from "@/services/doctor.service";
import { formatDateForDisplay } from "@/utils/dateUtils";

export default function PrescriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const prescriptionId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prescription, setPrescription] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    notes: "",
    status: ""
  });
  
  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setLoading(true);
        
        // First try to get all prescriptions to find this one
        const allPrescriptions = await DoctorService.getPrescriptions();
        
        // Find the prescription with matching ID or prescriptionId
        const foundPrescription = allPrescriptions.find(p => 
          p.id?.toString() === prescriptionId || 
          p.prescriptionId === prescriptionId
        );
        
        if (!foundPrescription) {
          setError(`Prescription with ID ${prescriptionId} not found`);
          return;
        }
        
        console.log("Found prescription:", foundPrescription);
        setPrescription(foundPrescription);
        
        // Initialize form data with prescription values
        setFormData({
          medication: foundPrescription.medication || "",
          dosage: foundPrescription.dosage || "",
          frequency: foundPrescription.frequency || "",
          duration: foundPrescription.duration || "",
          instructions: foundPrescription.instructions || "",
          notes: foundPrescription.notes || "",
          status: foundPrescription.status || ""
        });
        
      } catch (err) {
        console.error("Error fetching prescription:", err);
        setError("Failed to load prescription details");
      } finally {
        setLoading(false);
      }
    };
    
    if (prescriptionId) {
      fetchPrescription();
    }
  }, [prescriptionId]);
  
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
      setLoading(true);
      
      // Prepare update data
      const updateData = {
        ...formData,
        id: prescription.id
      };
      
      if (prescription.prescriptionId) {
        updateData.prescriptionId = prescription.prescriptionId;
      }
      
      console.log("Updating prescription with data:", updateData);
      
      // Update prescription
      await DoctorService.updatePrescription(prescription.id, updateData);
      
      // Refresh data
      const updatedPrescriptions = await DoctorService.getPrescriptions();
      const updatedPrescription = updatedPrescriptions.find(p => 
        p.id?.toString() === prescriptionId || 
        p.prescriptionId === prescriptionId
      );
      
      setPrescription(updatedPrescription);
      setEditMode(false);
      
    } catch (err) {
      console.error("Error updating prescription:", err);
      setError("Failed to update prescription");
    } finally {
      setLoading(false);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDiscontinue = async () => {
    if (!confirm("Are you sure you want to discontinue this prescription?")) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Update prescription status
      await DoctorService.updatePrescription(prescription.id, {
        ...prescription,
        status: "DISCONTINUED"
      });
      
      // Redirect back to prescriptions list
      router.push("/doctor/prescriptions");
      
    } catch (err) {
      console.error("Error discontinuing prescription:", err);
      setError("Failed to discontinue prescription");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout userType="doctor" title="Prescription Details">
        <div className="bg-white shadow rounded-lg p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout userType="doctor" title="Prescription Details">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push("/doctor/prescriptions")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Prescriptions
          </button>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!prescription) {
    return (
      <DashboardLayout userType="doctor" title="Prescription Details">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg mb-4">
            Prescription not found
          </div>
          <button
            onClick={() => router.push("/doctor/prescriptions")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Prescriptions
          </button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="doctor" title="Prescription Details">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Prescription {prescription.prescriptionId || `#${prescription.id}`}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push("/doctor/prescriptions")}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            
            {!editMode && (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  Edit
                </button>
                
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 border border-green-600 rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50"
                >
                  Print
                </button>
                
                {prescription.status === "ACTIVE" && (
                  <button
                    onClick={handleDiscontinue}
                    className="px-4 py-2 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50"
                  >
                    Discontinue
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        
        {editMode ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <div className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {prescription.patient 
                    ? `${prescription.patient.firstName} ${prescription.patient.lastName} (${prescription.patient.patientId})` 
                    : "Unknown patient"}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prescription Date</label>
                <div className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {formatDateForDisplay(prescription.prescriptionDate)}
                </div>
              </div>
              
              <div>
                <label htmlFor="medication" className="block text-sm font-medium text-gray-700 mb-1">Medication *</label>
                <input
                  type="text"
                  id="medication"
                  name="medication"
                  value={formData.medication}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="Every 4 hours">Every 4 hours</option>
                  <option value="Every 6 hours">Every 6 hours</option>
                  <option value="Every 8 hours">Every 8 hours</option>
                  <option value="Every 12 hours">Every 12 hours</option>
                  <option value="As needed (PRN)">As needed (PRN)</option>
                  <option value="Once weekly">Once weekly</option>
                  <option value="Before meals">Before meals</option>
                  <option value="After meals">After meals</option>
                  <option value="At bedtime">At bedtime</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                <textarea
                  id="instructions"
                  name="instructions"
                  rows={3}
                  value={formData.instructions}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              {prescription.status !== "ACTIVE" && (
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="DISCONTINUED">Discontinued</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Patient</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {prescription.patient 
                    ? `${prescription.patient.firstName} ${prescription.patient.lastName} (${prescription.patient.patientId})` 
                    : "Unknown patient"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Prescription Date</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDateForDisplay(prescription.prescriptionDate)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Medication</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {prescription.medication || "Not specified"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Dosage</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {prescription.dosage || "Not specified"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Frequency</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {prescription.frequency || "Not specified"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {prescription.duration || "Not specified"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    prescription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    prescription.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {prescription.status}
                  </span>
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Prescribing Doctor</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {prescription.doctor 
                    ? `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}` 
                    : "Unknown doctor"}
                </p>
              </div>
              
              {prescription.instructions && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Instructions</h3>
                  <p className="mt-1 text-sm text-gray-900">{prescription.instructions}</p>
                </div>
              )}
              
              {prescription.notes && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="mt-1 text-sm text-gray-900">{prescription.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 