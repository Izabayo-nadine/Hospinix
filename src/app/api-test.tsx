"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import PharmacistService from "@/services/pharmacist.service";

export default function ApiTest() {
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    message: string;
    details?: any;
  }>({
    isConnected: false,
    message: "Testing connection..."
  });

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);

  useEffect(() => {
    const testConnection = async () => {
      // Test 1: Check server connectivity
      try {
        const pingResult = await api.pingServer();
        console.log("API Ping Result:", pingResult);
        
        if (pingResult.isConnected) {
          setConnectionStatus({
            isConnected: true,
            message: "Successfully connected to the backend API.",
            details: pingResult
          });
          
          // Test 2: Try fetching dashboard data
          try {
            const stats = await PharmacistService.getDashboardStats();
            console.log("Dashboard Stats:", stats);
            setDashboardStats(stats);
            
            // Test 3: Fetch medicines
            const medsData = await PharmacistService.getMedicines();
            console.log("Medicines:", medsData);
            setMedicines(medsData);
          } catch (apiError: any) {
            console.error("Error fetching data:", apiError);
            setConnectionStatus({
              isConnected: true,
              message: "Connected to API but couldn't fetch data: " + (apiError.message || "Unknown error"),
              details: { error: apiError.message }
            });
          }
        } else {
          setConnectionStatus({
            isConnected: false,
            message: "Failed to connect to the backend API.",
            details: pingResult
          });
        }
      } catch (error: any) {
        console.error("Connection test error:", error);
        setConnectionStatus({
          isConnected: false,
          message: "Error testing API connection: " + (error.message || "Unknown error"),
          details: { error: error.message }
        });
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      <div className={`p-4 mb-6 rounded ${connectionStatus.isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
        <h2 className="text-lg font-semibold mb-2">Connection Status:</h2>
        <p className={connectionStatus.isConnected ? 'text-green-700' : 'text-red-700'}>
          {connectionStatus.message}
        </p>
        {connectionStatus.details && (
          <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
            {JSON.stringify(connectionStatus.details, null, 2)}
          </pre>
        )}
      </div>

      {dashboardStats && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Dashboard Stats:</h2>
          <div className="bg-white p-4 rounded shadow">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(dashboardStats, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {medicines && medicines.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Medicines (First 5):</h2>
          <div className="bg-white p-4 rounded shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medicines.slice(0, 5).map((medicine) => (
                  <tr key={medicine.id || medicine.medicineId}>
                    <td className="px-4 py-2 whitespace-nowrap">{medicine.medicineId || medicine.id}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{medicine.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{medicine.category}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{medicine.stock}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{medicine.stockStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Next Steps:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            {connectionStatus.isConnected ? (
              <span className="text-green-600">✓ Backend API connection successful</span>
            ) : (
              <span className="text-red-600">✗ Backend API connection failed - check if the server is running</span>
            )}
          </li>
          <li>
            {dashboardStats ? (
              <span className="text-green-600">✓ Dashboard stats retrieved successfully</span>
            ) : (
              <span className="text-red-600">✗ Dashboard stats retrieval failed - check API endpoints</span>
            )}
          </li>
          <li>
            {medicines && medicines.length > 0 ? (
              <span className="text-green-600">✓ Medicines data retrieved successfully</span>
            ) : (
              <span className="text-red-600">✗ Medicines data retrieval failed - check API endpoints</span>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
} 