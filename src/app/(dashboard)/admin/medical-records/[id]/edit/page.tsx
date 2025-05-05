"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import MedicalRecordService from "@/services/medical-record.service";
import Button from "@/components/Button";
import Link from "next/link";

export default function EditMedicalRecordPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [record, setRecord] = useState(null);
  
  const [formData, setFormData] = useState({
    chiefComplaint: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    recordDate: "",
    vitals: []
  });

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await MedicalRecordService.getMedicalRecord(recordId);
        console.log("Fetched medical record data:", data);
        setRecord(data);
        
        // Initialize form data with fetched record
        setFormData({
          chiefComplaint: data.chiefComplaint || "",
          diagnosis: data.diagnosis || "",
          treatment: data.treatment || "",
          notes: data.notes || "",
          recordDate: data.recordDate || new Date().toISOString().split('T')[0],
          vitals: data.vitals || []
        });
      } catch (err) {
        console.error("Error fetching medical record:", err);
        setError(err.message || "Failed to load medical record information");
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [recordId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVitalChange = (index, field, value) => {
    const updatedVitals = [...formData.vitals];
    updatedVitals[index] = {
      ...updatedVitals[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      vitals: updatedVitals
    }));
  };

  const handleAddVital = () => {
    setFormData(prev => ({
      ...prev,
      vitals: [
        ...prev.vitals, 
        { name: "", value: "", unit: "" }
      ]
    }));
  };

  const handleRemoveVital = (index) => {
    const updatedVitals = [...formData.vitals];
    updatedVitals.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      vitals: updatedVitals
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      // Filter out empty vitals
      const filteredVitals = formData.vitals.filter(vital => 
        vital.name.trim() !== "" && vital.value.trim() !== ""
      );
      
      const updatedRecord = {
        ...formData,
        vitals: filteredVitals,
        // Preserve original data
        patientId: record.patientId,
        doctorId: record.doctorId,
        doctorName: record.doctorName,
        recordId: record.recordId,
        labResults: record.labResults
      };
      
      const response = await MedicalRecordService.updateMedicalRecord(recordId, updatedRecord);
      setSuccess("Medical record updated successfully!");
      
      // Redirect after short delay
      setTimeout(() => {
        router.push(`/admin/medical-records/${recordId}`);
      }, 1500);
    } catch (err) {
      console.error("Error updating medical record:", err);
      setError("Failed to update medical record. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/medical-records/${recordId}`);
  };

  return (
    <DashboardLayout userType="admin" title="Edit Medical Record">
      <div className="w-full px-6 py-6 mx-auto">
        <div className="flex flex-wrap -mx-3">
          <div className="flex-none w-full max-w-full px-3">
            <div className="relative flex flex-col min-w-0 mb-6 break-words bg-white border-0 border-transparent border-solid shadow-xl dark:bg-slate-850 dark:shadow-dark-xl rounded-2xl bg-clip-border">
              <div className="flex justify-between p-6 pb-0 mb-0 border-b-0 border-b-solid rounded-t-2xl border-b-transparent">
                <h6 className="dark:text-white">Edit Medical Record</h6>
                <Button 
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                  </div>
                ) : record ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium">
                        Record ID: {record.recordId}
                        {record.patientId && (
                          <span className="ml-4 text-sm text-gray-500">
                            Patient ID: <Link href={`/admin/patients/${record.patientId}`}>
                              <span className="text-blue-600 hover:underline">{record.patientId}</span>
                            </Link>
                          </span>
                        )}
                      </h3>
                    </div>
                    
                    {success && (
                      <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        {success}
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="recordDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Record Date
                          </label>
                          <input
                            type="date"
                            id="recordDate"
                            name="recordDate"
                            className="border border-gray-300 rounded-md py-2 px-4 block w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.recordDate}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="chiefComplaint" className="block text-sm font-medium text-gray-700 mb-1">
                          Chief Complaint *
                        </label>
                        <textarea
                          id="chiefComplaint"
                          name="chiefComplaint"
                          rows={2}
                          className="border border-gray-300 rounded-md py-2 px-4 block w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={formData.chiefComplaint}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                          Diagnosis *
                        </label>
                        <textarea
                          id="diagnosis"
                          name="diagnosis"
                          rows={2}
                          className="border border-gray-300 rounded-md py-2 px-4 block w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={formData.diagnosis}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-1">
                          Treatment *
                        </label>
                        <textarea
                          id="treatment"
                          name="treatment"
                          rows={3}
                          className="border border-gray-300 rounded-md py-2 px-4 block w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={formData.treatment}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="mb-8">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows={3}
                          className="border border-gray-300 rounded-md py-2 px-4 block w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={formData.notes}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-lg font-medium">Vitals</h4>
                          <Button
                            type="button"
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                            onClick={handleAddVital}
                          >
                            Add Vital
                          </Button>
                        </div>
                        
                        {formData.vitals.length === 0 ? (
                          <p className="text-gray-500 italic mb-3">No vitals recorded. Click "Add Vital" to add one.</p>
                        ) : (
                          formData.vitals.map((vital, index) => (
                            <div key={index} className="flex space-x-4 mb-3 items-end">
                              <div className="w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Name
                                </label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md py-2 px-4 block w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  value={vital.name}
                                  onChange={(e) => handleVitalChange(index, 'name', e.target.value)}
                                  placeholder="e.g., Blood Pressure"
                                />
                              </div>
                              <div className="w-1/4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Value
                                </label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md py-2 px-4 block w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  value={vital.value}
                                  onChange={(e) => handleVitalChange(index, 'value', e.target.value)}
                                  placeholder="e.g., 120/80"
                                />
                              </div>
                              <div className="w-1/4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Unit
                                </label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md py-2 px-4 block w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  value={vital.unit}
                                  onChange={(e) => handleVitalChange(index, 'unit', e.target.value)}
                                  placeholder="e.g., mmHg"
                                />
                              </div>
                              <div>
                                <Button
                                  type="button"
                                  className="bg-red-600 text-white px-3 py-2 rounded-lg"
                                  onClick={() => handleRemoveVital(index)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-3"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-tl from-blue-500 to-violet-500 text-white px-4 py-2 rounded-lg"
                          disabled={submitting}
                        >
                          {submitting ? 'Saving...' : 'Update Record'}
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">Medical record not found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 