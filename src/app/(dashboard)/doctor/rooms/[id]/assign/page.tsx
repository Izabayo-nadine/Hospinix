"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import DoctorService from "@/services/doctor.service";

export default function AssignPatientToRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id;
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [assigningPatient, setAssigningPatient] = useState(false);
  
  // Fetch room and available patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch room data
        try {
          const roomData = await DoctorService.getRoomById(roomId);
          setRoom(roomData);
          console.log("Successfully fetched room data:", roomData);
        } catch (error) {
          console.error("Failed to fetch room data:", error);
          setError("Failed to load room data. Please try again later.");
          return;
        }
        
        // Fetch patients
        setLoadingPatients(true);
        try {
          const patientsData = await DoctorService.getPatients();
          
          // TODO: Filter patients who are already assigned to rooms or beds
          // For now, we'll just use all patients
          setPatients(patientsData);
        } catch (error) {
          console.error("Error fetching patients:", error);
          setError("Failed to load patient data. Please try again.");
        } finally {
          setLoadingPatients(false);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (roomId) {
      fetchData();
    }
  }, [roomId]);
  
  // Handle assigning patient to room
  const handleAssignPatient = async () => {
    if (!selectedPatient || !room) return;
    
    try {
      setAssigningPatient(true);
      
      // Call the API endpoint to assign the patient to the room
      await DoctorService.assignPatientToRoom(roomId, selectedPatient);
      
      // Show success message
      setError("");  // Clear any previous errors
      
      // Navigate back to room details with a success message in the URL
      router.push(`/doctor/rooms/${roomId}?success=assigned`);
    } catch (err) {
      console.error("Error assigning patient:", err);
      setError("Failed to assign patient. Please try again.");
    } finally {
      setAssigningPatient(false);
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout userType="doctor" title="Assign Patient to Room">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Loading data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout userType="doctor" title="Assign Patient to Room">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
          <button
            onClick={() => router.back()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!room) {
    return (
      <DashboardLayout userType="doctor" title="Assign Patient to Room">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-4 text-gray-500">
            Room not found or could not be loaded.
          </div>
          <button
            onClick={() => router.back()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="doctor" title="Assign Patient to Room">
      <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Assign Patient to Room: {room.name} ({room.id})
          </h2>
          <p className="text-gray-600">
            Ward: {room.ward} | Room Type: {room.type} | Current Occupancy: {room.occupancy}/{room.capacity}
          </p>
        </div>
        
        {loadingPatients ? (
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Loading patient data...</p>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Patient to Assign
            </label>
            
            {patients.length > 0 ? (
              <div className="space-y-4">
                <select
                  className="border border-gray-300 rounded-md py-2 px-4 w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                >
                  <option value="">-- Select a patient --</option>
                  {patients.map(patient => (
                    <option 
                      key={patient.id || patient.patientId} 
                      value={patient.id || patient.patientId}
                    >
                      {patient.firstName} {patient.lastName} ({patient.patientId || patient.id})
                    </option>
                  ))}
                </select>
                
                {selectedPatient && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Patient Details</h3>
                    {/* Show selected patient details here */}
                    <p className="text-gray-700">
                      {patients.find(p => (p.id || p.patientId) === selectedPatient)?.firstName} {patients.find(p => (p.id || p.patientId) === selectedPatient)?.lastName}
                    </p>
                    <p className="text-gray-700">
                      ID: {selectedPatient}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
                <p>No patients available for assignment.</p>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignPatient}
            disabled={!selectedPatient || assigningPatient || room.status === "Full" || room.occupancy >= room.capacity}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white 
              ${(!selectedPatient || assigningPatient || room.status === "Full" || room.occupancy >= room.capacity)
                ? 'bg-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
          >
            {assigningPatient ? "Assigning..." : "Assign Patient"}
          </button>
        </div>
        
        {(room.status === "Full" || room.occupancy >= room.capacity) && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded">
            <p>This room is at full capacity and cannot accept more patients.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 