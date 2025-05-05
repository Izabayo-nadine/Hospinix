"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import MedicalRecordService from "@/services/medical-record.service";
import Button from "@/components/Button";
import Link from "next/link";

export default function ViewMedicalRecordPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await MedicalRecordService.getMedicalRecord(recordId);
        console.log("Fetched medical record data:", data);
        setRecord(data);
      } catch (err) {
        console.error("Error fetching medical record:", err);
        setError(err.message || "Failed to load medical record information");
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [recordId]);

  const handleEdit = () => {
    router.push(`/admin/medical-records/${recordId}/edit`);
  };

  const handleBack = () => {
    // Check if we have the patient info to navigate back to
    if (record && record.patientId) {
      router.push(`/admin/patients/${record.patientId}`);
    } else {
      router.push("/admin/patients");
    }
  };

  return (
    <DashboardLayout userType="admin" title="Medical Record Details">
      <div className="w-full px-6 py-6 mx-auto">
        <div className="flex flex-wrap -mx-3">
          <div className="flex-none w-full max-w-full px-3">
            <div className="relative flex flex-col min-w-0 mb-6 break-words bg-white border-0 border-transparent border-solid shadow-xl dark:bg-slate-850 dark:shadow-dark-xl rounded-2xl bg-clip-border">
              <div className="flex justify-between p-6 pb-0 mb-0 border-b-0 border-b-solid rounded-t-2xl border-b-transparent">
                <h6 className="dark:text-white">Medical Record Details</h6>
                <div className="flex space-x-2">
                  <Button 
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  {record && (
                    <Button 
                      className="bg-gradient-to-tl from-blue-500 to-violet-500 text-white px-4 py-2 rounded-lg"
                      onClick={handleEdit}
                    >
                      Edit Record
                    </Button>
                  )}
                </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-medium mb-4 dark:text-white">Record Information</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Record ID</p>
                            <p className="font-medium dark:text-white">{record.recordId}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                            <p className="font-medium dark:text-white">{record.recordDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Doctor</p>
                            <p className="font-medium dark:text-white">{record.doctorName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID</p>
                            <Link href={`/admin/patients/${record.patientId}`}>
                              <span className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{record.patientId}</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-medium mb-4 dark:text-white">Vitals</h3>
                        {record.vitals && record.vitals.length > 0 ? (
                          <div className="space-y-3">
                            {record.vitals.map((vital, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">{vital.name}</span>
                                <span className="font-medium dark:text-white">
                                  {vital.value} {vital.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No vitals recorded</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-medium mb-2 dark:text-white">Chief Complaint</h3>
                        <p className="dark:text-white">{record.chiefComplaint}</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-medium mb-2 dark:text-white">Diagnosis</h3>
                        <p className="dark:text-white">{record.diagnosis}</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-medium mb-2 dark:text-white">Treatment</h3>
                        <p className="dark:text-white">{record.treatment}</p>
                      </div>
                      
                      {record.notes && (
                        <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                          <h3 className="text-lg font-medium mb-2 dark:text-white">Additional Notes</h3>
                          <p className="dark:text-white">{record.notes}</p>
                        </div>
                      )}
                      
                      {record.labResults && record.labResults.length > 0 && (
                        <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                          <h3 className="text-lg font-medium mb-4 dark:text-white">Lab Results</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                              <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                  <th scope="col" className="px-6 py-3">Test</th>
                                  <th scope="col" className="px-6 py-3">Result</th>
                                  <th scope="col" className="px-6 py-3">Normal Range</th>
                                  <th scope="col" className="px-6 py-3">Unit</th>
                                  <th scope="col" className="px-6 py-3">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {record.labResults.map((result, index) => (
                                  <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4">{result.testName}</td>
                                    <td className="px-6 py-4">{result.result}</td>
                                    <td className="px-6 py-4">{result.normalRange}</td>
                                    <td className="px-6 py-4">{result.unit}</td>
                                    <td className="px-6 py-4">
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        result.status === 'Normal' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {result.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
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