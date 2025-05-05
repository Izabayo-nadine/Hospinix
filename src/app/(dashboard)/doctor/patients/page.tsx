"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DoctorService from "@/services/doctor.service";
import { calculateAge } from "@/utils/dateUtils";

export default function DoctorPatients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        
        // Fetch patients assigned to the doctor
        const patientsData = await DoctorService.getPatients({
          search: searchQuery
        });
        
        console.log("Fetched patients data:", patientsData);
        
        // Transform the data for display
        const formattedPatients = patientsData.map(patient => ({
          id: patient.id,
          patientId: patient.patientId,
          name: `${patient.firstName} ${patient.lastName}`,
          age: calculateAge(patient.dateOfBirth),
          gender: patient.gender,
          lastVisit: patient.lastVisitDate || "No recent visits",
          condition: patient.medicalHistory || "No condition recorded",
          diagnosis: patient.diagnosis || "No diagnosis recorded",
          treatment: patient.currentMedications || "No treatment recorded",
          // Keep original data for reference
          originalPatient: patient
        }));
        
        setPatients(formattedPatients);
        setError("");
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Failed to load patients. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, [searchQuery]);

  const filteredPatients = patients.filter(patient => 
    searchQuery === "" || 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout userType="doctor" title="My Patients">
      <div className="mb-4 flex">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search patients..."
            className="border border-gray-300 rounded-md py-2 px-4 w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Patient List</h2>
              {filteredPatients.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No patients found. Check with reception if patients need to be assigned to you.</p>
              ) : (
                <div className="space-y-4">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 rounded-lg cursor-pointer ${
                        selectedPatient?.id === patient.id
                          ? 'bg-indigo-50 border border-indigo-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <h3 className="font-medium">{patient.name}</h3>
                      <p className="text-sm text-gray-500">Age: {patient.age}, {patient.gender}</p>
                      <p className="text-sm text-gray-500">Condition: {patient.condition}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            {selectedPatient ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">{selectedPatient.name}</h2>
                    <p className="text-gray-500">Age: {selectedPatient.age}, {selectedPatient.gender}</p>
                    <p className="text-gray-500">Patient ID: {selectedPatient.patientId}</p>
                    <p className="text-gray-500">Last Visit: {selectedPatient.lastVisit}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm">
                      Assign Medicine
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                      Update Treatment
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Medical Condition</h3>
                    <p>{selectedPatient.condition}</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Diagnosis</h3>
                    <p>{selectedPatient.diagnosis}</p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Current Treatment</h3>
                    <p>{selectedPatient.treatment}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Medical History</h3>
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <p className="text-sm text-gray-500">{selectedPatient.lastVisit !== "No recent visits" ? selectedPatient.lastVisit : new Date().toISOString().split('T')[0]}</p>
                        <p className="font-medium">Regular check-up</p>
                        <p>{selectedPatient.condition}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 flex items-center justify-center h-full">
                <p className="text-gray-500">Select a patient to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 