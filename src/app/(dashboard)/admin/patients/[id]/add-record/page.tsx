"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import AdminService from "@/services/admin.service";
import MedicalRecordService from "@/services/medical-record.service";
import Button from "@/components/Button";
import Link from "next/link";

export default function AddMedicalRecordPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    chiefComplaint: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    recordDate: new Date().toISOString().split('T')[0],
    vitals: [
      { name: "Blood Pressure", value: "", unit: "mmHg" },
      { name: "Temperature", value: "", unit: "°C" },
      { name: "Heart Rate", value: "", unit: "bpm" },
      { name: "Respiratory Rate", value: "", unit: "breaths/min" },
      { name: "Weight", value: "", unit: "kg" }
    ]
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const data = await AdminService.getPatient(patientId);
        setPatient(data);
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError("Failed to load patient information");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      // Filter out empty vitals
      const filteredVitals = formData.vitals.filter(vital => vital.value.trim() !== "");
      
      const recordData = {
        ...formData,
        vitals: filteredVitals,
        patientId: patientId,
        // In a real app, we'd get this from auth context
        doctorId: "D-1001", // Mock doctor ID
        doctorName: "Dr. Sarah Johnson" // Mock doctor name
      };
      
      const response = await MedicalRecordService.createMedicalRecord(recordData);
      setSuccess("Medical record created successfully!");
      
      // Redirect back to patient view after short delay
      setTimeout(() => {
        router.push(`/admin/patients/${patientId}`);
      }, 1500);
    } catch (err) {
      console.error("Error creating medical record:", err);
      setError("Failed to create medical record. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout userType="admin" title="Add Medical Record">
      <div className="w-full px-6 py-6 mx-auto">
        <div className="flex flex-wrap -mx-3">
          <div className="flex-none w-full max-w-full px-3">
            <div className="relative flex flex-col min-w-0 mb-6 break-words bg-white border-0 border-transparent border-solid shadow-xl dark:bg-slate-850 dark:shadow-dark-xl rounded-2xl bg-clip-border">
              <div className="flex justify-between p-6 pb-0 mb-0 border-b-0 border-b-solid rounded-t-2xl border-b-transparent">
                <h6 className="dark:text-white">Add Medical Record</h6>
                <Link href={`/admin/patients/${patientId}`}>
                  <Button className="bg-gray-500 text-white px-4 py-2 rounded-lg">
                    Cancel
                  </Button>
                </Link>
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
                ) : patient ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium">Patient: {patient.firstName} {patient.lastName}</h3>
                      <p className="text-gray-500">ID: {patient.patientId}</p>
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
                        <h4 className="text-lg font-medium mb-3">Vitals</h4>
                        {formData.vitals.map((vital, index) => (
                          <div key={vital.name} className="flex space-x-4 mb-3">
                            <div className="w-1/3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {vital.name}
                              </label>
                            </div>
                            <div className="w-1/3">
                              <input
                                type="text"
                                className="border border-gray-300 rounded-md py-2 px-4 block w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={vital.value}
                                onChange={(e) => handleVitalChange(index, 'value', e.target.value)}
                                placeholder={`Enter ${vital.name}`}
                              />
                            </div>
                            <div className="w-1/3">
                              <input
                                type="text"
                                className="border border-gray-300 rounded-md py-2 px-4 block w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100"
                                value={vital.unit}
                                disabled
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-3"
                          onClick={() => router.push(`/admin/patients/${patientId}`)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-tl from-blue-500 to-violet-500 text-white px-4 py-2 rounded-lg"
                          disabled={submitting}
                        >
                          {submitting ? 'Saving...' : 'Save Record'}
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 