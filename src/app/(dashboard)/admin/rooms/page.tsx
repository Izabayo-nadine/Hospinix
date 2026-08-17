"use client";
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function RoomsPage() {
  return (
    <DashboardLayout userType="admin" title="Rooms Management">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Rooms Management</h1>
        <p className="text-gray-500">Rooms management feature is coming soon.</p>
      </div>
    </DashboardLayout>
  );
}