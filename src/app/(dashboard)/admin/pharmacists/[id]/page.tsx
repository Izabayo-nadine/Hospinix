"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import AuthService from "@/services/auth.service";
import AdminService from "@/services/admin.service";

// Dynamically import the PharmacistForm component with SSR disabled
const PharmacistForm = dynamic(() => import("@/components/forms/PharmacistForm"), {
  ssr: false
});

export default function EditPharmacistPage() {
  const router = useRouter();
  const params = useParams();
  const [pharmacist, setPharmacist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (!user || user.role !== "ADMIN") {
          router.push("/login");
          return;
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/login");
        return;
      }
    };

    const fetchPharmacist = async () => {
      try {
        const response = await AdminService.getUser(params.id);
        if (response.role !== "PHARMACIST") {
          setError("User is not a pharmacist");
          return;
        }
        setPharmacist(response);
      } catch (err) {
        console.error("Error fetching pharmacist:", err);
        setError(err.message || "Failed to fetch pharmacist details");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    if (params.id) {
      fetchPharmacist();
    } else {
      setLoading(false);
    }
  }, [params.id, router]);

  const handleSuccess = () => {
    router.push("/admin/pharmacists");
  };

  const handleCancel = () => {
    router.push("/admin/pharmacists");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {pharmacist ? "Edit Pharmacist" : "Add New Pharmacist"}
          </h1>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <PharmacistForm
            pharmacist={pharmacist}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </DashboardLayout>
  );
} 