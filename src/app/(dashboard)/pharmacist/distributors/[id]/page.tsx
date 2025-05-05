"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PharmacistService from "@/services/pharmacist.service";
import { getErrorMessage } from "@/utils/apiUtils";

interface Distributor {
  id: string | number;
  distributorId: string;
  name: string;
  logoUrl?: string;
  region: string;
  headquarters?: string;
  areas: string[];
  contactName?: string;
  contactTitle?: string;
  phone: string;
  email?: string;
  website?: string;
  relationshipSince?: string;
  contractStatus?: string;
  contractRenewal?: string;
  deliveryTime?: string;
  rating?: number;
  reliability?: string;
  lastDelivery?: string;
  paymentTerms?: string;
  specialties?: string[];
}

export default function DistributorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [distributor, setDistributor] = useState<Distributor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDistributorData();
  }, [params.id]);

  const fetchDistributorData = async () => {
    if (!params.id) return;
    
    try {
      setLoading(true);
      setError("");
      
      // Fetch distributor details
      const data = await PharmacistService.getDistributorById(params.id as string);
      setDistributor(data);
      
    } catch (err) {
      console.error("Error fetching distributor details:", err);
      setError(getErrorMessage(err) || "Failed to load distributor details");
      
      // Fallback data for development/demo
      setDistributor({
        id: params.id,
        distributorId: `DIST-${params.id}`,
        name: "MediLogistics International",
        logoUrl: "/images/logo-placeholder.png",
        region: "North America",
        headquarters: "Chicago, IL, USA",
        areas: ["USA", "Canada", "Mexico"],
        contactName: "John Williams",
        contactTitle: "Distribution Manager",
        phone: "+1 (312) 555-6789",
        email: "jwilliams@medilogistics.com",
        website: "www.medilogistics.com",
        relationshipSince: "2018-05-22",
        contractStatus: "Active",
        contractRenewal: "2024-05-21",
        deliveryTime: "2-3 days",
        rating: 4.8,
        reliability: "Excellent",
        lastDelivery: "2023-11-24",
        paymentTerms: "Net 30",
        specialties: ["Temperature-controlled delivery", "Controlled substances", "Bulk distribution"]
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800";
      case "Expired":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <DashboardLayout userType="pharmacist" title="Distributor Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="pharmacist" title="Distributor Details">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
          <button 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => router.push('/pharmacist/distributors')}
          >
            Back to Distributors
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!distributor) {
    return (
      <DashboardLayout userType="pharmacist" title="Distributor Details">
        <div className="text-center py-10">
          <p className="text-gray-500">Distributor not found</p>
          <button 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => router.push('/pharmacist/distributors')}
          >
            Back to Distributors
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="pharmacist" title={`Distributor: ${distributor.name}`}>
      <div className="mb-6">
        <button
          onClick={() => router.push('/pharmacist/distributors')}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Distributors
        </button>
      </div>

      {/* Distributor Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
              {distributor.logoUrl ? (
                <img 
                  src={distributor.logoUrl} 
                  alt={`${distributor.name} logo`} 
                  className="h-12 w-12 rounded-full" 
                />
              ) : (
                <span className="text-2xl font-bold text-indigo-600">
                  {distributor.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{distributor.name}</h1>
              <p className="text-gray-500">{distributor.distributorId}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/pharmacist/distributors/edit/${distributor.id}`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Edit Distributor
            </button>
            <button
              onClick={() => router.push(`/pharmacist/orders/new?distributorId=${distributor.id}`)}
              className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Distributor Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Region</h3>
              <p className="text-base text-gray-900">{distributor.region}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Headquarters</h3>
              <p className="text-base text-gray-900">{distributor.headquarters || "N/A"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Areas Served</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {distributor.areas && distributor.areas.length > 0 ? (
                  distributor.areas.map((area, index) => (
                    <span key={index} className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs">
                      {area}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No areas specified</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contract Status</h3>
              <span className={`px-2 py-1 mt-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(distributor.contractStatus)}`}>
                {distributor.contractStatus || "Unknown"}
              </span>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Relationship Since</h3>
              <p className="text-base text-gray-900">{formatDate(distributor.relationshipSince)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contract Renewal</h3>
              <p className="text-base text-gray-900">{formatDate(distributor.contractRenewal)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Delivery Time</h3>
              <p className="text-base text-gray-900">{distributor.deliveryTime || "N/A"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment Terms</h3>
              <p className="text-base text-gray-900">{distributor.paymentTerms || "N/A"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Delivery</h3>
              <p className="text-base text-gray-900">{formatDate(distributor.lastDelivery)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Reliability</h3>
              <div className="flex items-center">
                <span className="text-base text-gray-900 mr-2">{distributor.reliability || "N/A"}</span>
                {distributor.rating && (
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="text-base text-gray-900">{distributor.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500">Specialties</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {distributor.specialties && distributor.specialties.length > 0 ? (
                distributor.specialties.map((specialty, index) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                    {specialty}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No specialties specified</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
              <p className="text-base text-gray-900">{distributor.contactName || "N/A"}</p>
              {distributor.contactTitle && (
                <p className="text-sm text-gray-500">{distributor.contactTitle}</p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="text-base text-gray-900">{distributor.phone}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="text-base text-gray-900">
                {distributor.email ? (
                  <a href={`mailto:${distributor.email}`} className="text-indigo-600 hover:text-indigo-800">
                    {distributor.email}
                  </a>
                ) : "N/A"}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Website</h3>
              <p className="text-base text-gray-900">
                {distributor.website ? (
                  <a 
                    href={distributor.website.startsWith('http') ? distributor.website : `https://${distributor.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {distributor.website}
                  </a>
                ) : "N/A"}
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Send Email
              </button>
              <button className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                View Order History
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 