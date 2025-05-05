"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";

export default function MedicalRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // In a real app, these would be fetched from an API
  const patients = [
    { 
      id: "P-10032", 
      name: "John Doe", 
      age: 45, 
      gender: "Male",
      bloodType: "A+",
      allergies: ["Penicillin", "Peanuts"],
      chronicConditions: ["Hypertension", "Type 2 Diabetes"]
    },
    { 
      id: "P-10045", 
      name: "Mary Johnson", 
      age: 32, 
      gender: "Female",
      bloodType: "O-",
      allergies: ["Sulfa drugs"],
      chronicConditions: ["Migraine"]
    },
    { 
      id: "P-10067", 
      name: "Robert Williams", 
      age: 58, 
      gender: "Male",
      bloodType: "B+",
      allergies: ["Latex"],
      chronicConditions: ["Type 2 Diabetes", "Coronary artery disease"]
    },
    { 
      id: "P-10089", 
      name: "Jennifer Brown", 
      age: 27, 
      gender: "Female",
      bloodType: "AB+",
      allergies: [],
      chronicConditions: ["Asthma"]
    },
    { 
      id: "P-10102", 
      name: "Michael Davis", 
      age: 62, 
      gender: "Male",
      bloodType: "A-",
      allergies: ["Codeine"],
      chronicConditions: ["Arthritis", "Hypertension"]
    }
  ];

  // Medical records data
  const medicalRecords = [
    {
      id: "REC-1001",
      patientId: "P-10032",
      date: "2023-11-15",
      recordType: "Visit Note",
      diagnosis: "Essential Hypertension",
      provider: "Dr. Sarah Mitchell",
      notes: "Blood pressure remains elevated at 145/90. Increased lisinopril dosage from 10mg to 20mg daily. Patient advised on salt reduction.",
      vitals: {
        bloodPressure: "145/90",
        heartRate: "78",
        temperature: "98.6°F",
        respiratoryRate: "16",
        weight: "195 lbs"
      }
    },
    {
      id: "REC-1002",
      patientId: "P-10032",
      date: "2023-10-02",
      recordType: "Lab Results",
      diagnosis: "Routine Bloodwork",
      provider: "Dr. Sarah Mitchell",
      notes: "Glucose levels elevated at 130 mg/dL (fasting). HbA1c at 6.7%. Cholesterol slightly elevated. Patient advised on dietary changes.",
      labResults: {
        glucose: "130 mg/dL",
        hbA1c: "6.7%",
        cholesterol: "210 mg/dL",
        hdl: "45 mg/dL",
        ldl: "130 mg/dL"
      }
    },
    {
      id: "REC-1003",
      patientId: "P-10045",
      date: "2023-11-20",
      recordType: "Visit Note",
      diagnosis: "Acute Migraine",
      provider: "Dr. Sarah Mitchell",
      notes: "Patient reports severe migraine episode lasting 48 hours. Prescribed sumatriptan 50mg as needed. Discussed migraine triggers and prevention strategies.",
      vitals: {
        bloodPressure: "118/75",
        heartRate: "72",
        temperature: "98.4°F",
        respiratoryRate: "14",
        weight: "140 lbs"
      }
    },
    {
      id: "REC-1004",
      patientId: "P-10067",
      date: "2023-11-10",
      recordType: "Visit Note",
      diagnosis: "Type 2 Diabetes",
      provider: "Dr. Sarah Mitchell",
      notes: "Blood glucose control improving with current regimen. HbA1c decreased from 8.2% to 7.4%. Continuing current dosage of metformin.",
      vitals: {
        bloodPressure: "135/85",
        heartRate: "76",
        temperature: "98.8°F",
        respiratoryRate: "15",
        weight: "210 lbs"
      }
    },
    {
      id: "REC-1005",
      patientId: "P-10089",
      date: "2023-11-28",
      recordType: "Visit Note",
      diagnosis: "Acute Bronchitis",
      provider: "Dr. Sarah Mitchell",
      notes: "Patient presents with productive cough, slight wheezing, and low-grade fever for 5 days. Prescribed amoxicillin for 7 days and albuterol inhaler as needed.",
      vitals: {
        bloodPressure: "122/78",
        heartRate: "88",
        temperature: "100.2°F",
        respiratoryRate: "20",
        weight: "135 lbs"
      }
    }
  ];

  const filteredPatients = searchQuery 
    ? patients.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : patients;

  const getPatientRecords = (patientId: any) => {
    return medicalRecords.filter(record => record.patientId === patientId);
  };

  return (
    <DashboardLayout userType="doctor" title="Medical Records">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-4">
              <label htmlFor="patient-search" className="block text-sm font-medium text-gray-700">Search Patients</label>
              <div className="mt-1 relative">
                <input
                  id="patient-search"
                  type="text"
                  placeholder="Name or Patient ID..."
                  className="border border-gray-300 rounded-md py-2 px-4 block w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
            
            <h3 className="text-lg font-medium text-gray-900 mb-3">Patient List</h3>
            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    selectedPatient?.id === patient.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setSelectedRecord(null);
                  }}
                >
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-sm text-gray-500">
                    {patient.id} • {patient.age} years, {patient.gender}
                  </div>
                </div>
              ))}
            </div>
            
            {filteredPatients.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No patients found matching your search.
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
                  <p className="text-gray-500">
                    {selectedPatient.id} • {selectedPatient.age} years, {selectedPatient.gender} • Blood Type: {selectedPatient.bloodType}
                  </p>
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                  Add Record
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Medical Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Allergies</h4>
                    {selectedPatient.allergies.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {selectedPatient.allergies.map((allergy: any, index: any) => (
                          <li key={index} className="text-sm text-gray-700">{allergy}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No known allergies</p>
                    )}
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Chronic Conditions</h4>
                    {selectedPatient.chronicConditions.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {selectedPatient.chronicConditions.map((condition: any, index: any) => (
                          <li key={index} className="text-sm text-gray-700">{condition}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No chronic conditions</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Medical Records</h3>
                
                {/* Records list */}
                <div className="space-y-4 mb-6">
                  {getPatientRecords(selectedPatient.id).map((record) => (
                    <div
                      key={record.id}
                      className={`border rounded-lg p-4 cursor-pointer ${
                        selectedRecord?.id === record.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedRecord(record)}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">{record.recordType}</div>
                        <div className="text-sm text-gray-500">{record.date}</div>
                      </div>
                      <div className="text-sm">{record.diagnosis}</div>
                      <div className="text-sm text-gray-500">Provider: {record.provider}</div>
                    </div>
                  ))}
                  
                  {getPatientRecords(selectedPatient.id).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No medical records found for this patient.
                    </div>
                  )}
                </div>
                
                {/* Selected record details */}
                {selectedRecord && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium">Record Details</h3>
                      <div className="text-sm text-gray-500">{selectedRecord.id}</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p>{selectedRecord.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Provider</p>
                        <p>{selectedRecord.provider}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Record Type</p>
                        <p>{selectedRecord.recordType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Diagnosis</p>
                        <p>{selectedRecord.diagnosis}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="border rounded-lg p-3 bg-gray-50">{selectedRecord.notes}</p>
                    </div>
                    
                    {selectedRecord.vitals && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Vitals</p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                          <div className="border rounded-lg p-2">
                            <p className="text-gray-500">BP</p>
                            <p className="font-medium">{selectedRecord.vitals.bloodPressure}</p>
                          </div>
                          <div className="border rounded-lg p-2">
                            <p className="text-gray-500">Heart Rate</p>
                            <p className="font-medium">{selectedRecord.vitals.heartRate} bpm</p>
                          </div>
                          <div className="border rounded-lg p-2">
                            <p className="text-gray-500">Temp</p>
                            <p className="font-medium">{selectedRecord.vitals.temperature}</p>
                          </div>
                          <div className="border rounded-lg p-2">
                            <p className="text-gray-500">Resp Rate</p>
                            <p className="font-medium">{selectedRecord.vitals.respiratoryRate}</p>
                          </div>
                          <div className="border rounded-lg p-2">
                            <p className="text-gray-500">Weight</p>
                            <p className="font-medium">{selectedRecord.vitals.weight}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedRecord.labResults && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Lab Results</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          {Object.entries(selectedRecord.labResults).map(([key, value]) => (
                            <div key={key} className="border rounded-lg p-2">
                              <p className="text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                              <p className="font-medium">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6 flex space-x-3">
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                        Edit Record
                      </button>
                      <button className="bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded hover:bg-indigo-50">
                        Print Record
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 flex items-center justify-center h-full">
              <p className="text-gray-500">Select a patient to view medical records</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 