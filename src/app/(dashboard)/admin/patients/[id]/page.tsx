"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import AdminService from "@/services/admin.service";
import MedicalRecordService from "@/services/medical-record.service";
import Link from "next/link";
import Button from "@/components/Button";

export default function ViewPatientPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [records, setRecords] = useState([]);
  const [recordError, setRecordError] = useState("");
  const [error, setError] = useState(null);

  const patientId = params.id;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AdminService.getPatient(params.id);
        console.log("Fetched patient data:", data);
        setPatient(data);
        
        // Also fetch patient records using the MedicalRecordService
        try {
          const recordsData = await MedicalRecordService.getMedicalRecords({ patientId: params.id });
          console.log("Fetched medical records:", recordsData);
          setRecords(recordsData);
        } catch (recordError) {
          console.error("Error fetching patient records:", recordError);
          setRecordError("Unable to load medical records. Using sample data for demonstration.");
        }
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError(err.message || "Failed to load patient information");
        
        // Provide a mock patient if API fails
        if (err.status === 404 || err.message.includes("404")) {
          console.log("Using mock patient data for ID:", params.id);
          const mockPatient = {
            patientId: params.id,
            firstName: "Sample",
            lastName: "Patient",
            email: "sample.patient@example.com",
            phoneNumber: "555-123-4567",
            address: "123 Sample St, Example City",
            dateOfBirth: "1985-06-15",
            gender: "Not specified",
            bloodGroup: "Unknown",
            emergencyContact: "Emergency Contact: 555-987-6543",
            medicalHistory: "No significant medical history provided",
            status: "Active"
          };
          setPatient(mockPatient);
          setError("Using sample patient data. The requested patient may not exist in the database.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [params.id]);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleEdit = () => {
    router.push(`/admin/patients/${patientId}/edit`);
  };

  const handleBack = () => {
    router.push("/admin/patients");
  };

  const handleAddRecord = () => {
    router.push(`/admin/patients/${patientId}/add-record`);
  };

  const handleViewRecord = (recordId) => {
    router.push(`/admin/medical-records/${recordId}`);
  };

  const handleEditRecord = (recordId) => {
    router.push(`/admin/medical-records/${recordId}/edit`);
  };

  return (
    <DashboardLayout userType="admin" title="Patient Details">
      <div className="w-full px-6 py-6 mx-auto">
        {/* Header */}
        <div className="flex flex-wrap -mx-3">
          <div className="flex-none w-full max-w-full px-3">
            <div className="relative flex flex-col min-w-0 mb-6 break-words bg-white border-0 border-transparent border-solid shadow-xl dark:bg-slate-850 dark:shadow-dark-xl rounded-2xl bg-clip-border">
              <div className="flex justify-between p-6 pb-0 mb-0 border-b-0 border-b-solid rounded-t-2xl border-b-transparent">
                <h6 className="dark:text-white">Patient Details</h6>
                {loading ? (
                  <div>Loading...</div>
                ) : patient ? (
                  <Link href="/admin/patients">
                    <Button className="bg-gradient-to-tl from-blue-500 to-violet-500 text-white px-4 py-2 rounded-lg">
                      Back to Patients
                    </Button>
                  </Link>
                ) : null}
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="p-6">
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                  </div>
                </div>
              ) : patient ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                      <h3 className="text-xl font-semibold mb-4 dark:text-white">Personal Information</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                          <p className="font-medium dark:text-white">{patient.firstName} {patient.lastName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                          <p className="font-medium dark:text-white">{patient.dateOfBirth} ({calculateAge(patient.dateOfBirth)} years)</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                          <p className="font-medium dark:text-white">{patient.gender}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Blood Group</p>
                          <p className="font-medium dark:text-white">{patient.bloodGroup || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                      <h3 className="text-xl font-semibold mb-4 dark:text-white">Contact Information</h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                          <p className="font-medium dark:text-white">{patient.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="font-medium dark:text-white">{patient.phoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                          <p className="font-medium dark:text-white">{patient.address || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Emergency Contact</p>
                          <p className="font-medium dark:text-white">{patient.emergencyContact || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold dark:text-white">Medical Records</h3>
                      <Button 
                        className="bg-gradient-to-tl from-blue-500 to-violet-500 text-white px-3 py-1 rounded-lg"
                        onClick={handleAddRecord}
                      >
                        Add Record
                      </Button>
                    </div>
                    
                    {recordError && (
                      <div className="mb-4 text-amber-600 bg-amber-100 p-3 rounded-lg">
                        {recordError}
                      </div>
                    )}
                    
                    {records.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              <th scope="col" className="px-6 py-3">Record ID</th>
                              <th scope="col" className="px-6 py-3">Date</th>
                              <th scope="col" className="px-6 py-3">Doctor</th>
                              <th scope="col" className="px-6 py-3">Diagnosis</th>
                              <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {records.map((record) => (
                              <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">{record.recordId}</td>
                                <td className="px-6 py-4">{record.recordDate}</td>
                                <td className="px-6 py-4">{record.doctorName}</td>
                                <td className="px-6 py-4">{record.diagnosis}</td>
                                <td className="px-6 py-4">
                                  <button 
                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline mr-3"
                                    onClick={() => handleViewRecord(record.id)}
                                  >
                                    View
                                  </button>
                                  <button 
                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                    onClick={() => handleEditRecord(record.id)}
                                  >
                                    Edit
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 dark:text-gray-400">No medical records found for this patient.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 bg-gray-50 dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 dark:text-white">Medical History</h3>
                    <p className="dark:text-white">{patient.medicalHistory || "No medical history available."}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 