"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DoctorService from "@/services/doctor.service";
import { formatDateForDisplay } from "@/utils/dateUtils";

// Minimalist layout for printing
export default function PrintPrescription() {
  const params = useParams();
  const prescriptionId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prescription, setPrescription] = useState(null);
  
  useEffect(() => {
    // First check session storage
    const storedPrescription = sessionStorage.getItem('printPrescription');
    if (storedPrescription) {
      try {
        setPrescription(JSON.parse(storedPrescription));
        setLoading(false);
        return;
      } catch (e) {
        console.error("Error parsing stored prescription:", e);
      }
    }
    
    // If not found in session storage, fetch from API
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
        
        setPrescription(foundPrescription);
        
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
  
  // Auto-print when loaded
  useEffect(() => {
    if (prescription && !loading && !error) {
      // Wait a moment for the page to render
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [prescription, loading, error]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Close
        </button>
      </div>
    );
  }
  
  if (!prescription) {
    return (
      <div className="p-4">
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg mb-4">
          Prescription not found
        </div>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Close
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      {/* Print-only header */}
      <div className="mb-8 text-center border-b pb-4">
        <h1 className="text-2xl font-bold">Hospital Pharmacy System</h1>
        <p className="text-gray-600">123 Medical Center Dr., Anytown, USA</p>
        <p className="text-gray-600">Phone: (555) 123-4567</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-center border-b pb-2">PRESCRIPTION</h2>
        
        <div className="flex justify-between mb-4">
          <div>
            <p className="font-semibold">Prescription ID:</p>
            <p>{prescription.prescriptionId || `#${prescription.id}`}</p>
          </div>
          <div>
            <p className="font-semibold">Date:</p>
            <p>{formatDateForDisplay(prescription.prescriptionDate)}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="font-semibold">Patient:</p>
          <p className="text-lg">{prescription.patient 
            ? `${prescription.patient.firstName} ${prescription.patient.lastName}` 
            : "Unknown patient"}</p>
          <p className="text-sm text-gray-600">{prescription.patient?.patientId}</p>
        </div>
        
        <div className="border p-4 mb-6">
          <h3 className="font-bold text-lg mb-2">Rx</h3>
          
          <div className="mb-4">
            <p className="font-semibold">Medication:</p>
            <p className="text-lg">{prescription.medication}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-semibold">Dosage:</p>
              <p>{prescription.dosage}</p>
            </div>
            
            <div>
              <p className="font-semibold">Frequency:</p>
              <p>{prescription.frequency}</p>
            </div>
          </div>
          
          {prescription.duration && (
            <div className="mb-4">
              <p className="font-semibold">Duration:</p>
              <p>{prescription.duration}</p>
            </div>
          )}
          
          {prescription.instructions && (
            <div className="mb-4">
              <p className="font-semibold">Instructions:</p>
              <p>{prescription.instructions}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-12">
          <div>
            <p className="font-semibold">Prescribing Doctor:</p>
            <p>{prescription.doctor 
              ? `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}` 
              : "Unknown doctor"}</p>
          </div>
          
          <div className="text-center">
            <div className="border-b border-black mb-2 w-48 mt-10"></div>
            <p>Signature</p>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-sm text-gray-500 text-center border-t pt-2">
        <p>This prescription is valid for 30 days from the issue date unless otherwise specified.</p>
        <p>Please keep this prescription for your records.</p>
      </div>
      
      {/* Screen-only buttons */}
      <div className="mt-8 flex justify-center space-x-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Print Again
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
} 