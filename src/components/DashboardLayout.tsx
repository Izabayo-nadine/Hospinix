"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Image from "next/image";
import Link from "next/link";

type DashboardLayoutProps = {
  userType: 'admin' | 'doctor' | 'pharmacist' | 'receptionist';
  children: ReactNode;
  title: string;
};

export default function DashboardLayout({ userType, children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 transform bg-indigo-800 transition duration-300 ease-in-out lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar userType={userType} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              {/* Sidebar toggle for mobile */}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              
              {/* User dropdown */}
              <div className="flex items-center">
                <div className="relative">
                  <button className="flex items-center space-x-2 group">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                      {userType.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden md:block">{userType.charAt(0).toUpperCase() + userType.slice(1)}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 