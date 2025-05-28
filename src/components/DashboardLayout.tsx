"use client";

import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";

type DashboardLayoutProps = {
  userType: 'admin' | 'doctor' | 'pharmacist' | 'receptionist';
  children: ReactNode;
  title: string;
};

export default function DashboardLayout({ 
  userType, 
  children, 
  title,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Get the current user from localStorage
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      // If no user is found, redirect to login
      router.push('/login');
      return;
    }

    // Verify that the user has the correct role for this dashboard
    if (currentUser.role.toLowerCase() !== userType.toLowerCase()) {
      router.push('/login');
      return;
    }

    setUser(currentUser);
  }, [userType, router]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      try {
        // TODO: Implement image upload to backend
        console.log('Uploading image:', file);
        const response = await AuthService.uploadProfileImage(user.id, file);
        
        // Assuming the backend returns the updated user object or the new image URL
        if (response && response.imageUrl) {
          // Update the user state with the new profile image URL
          setUser((prevUser: any | null) => ({
            ...prevUser,
            profileImage: response.imageUrl
          }));
          console.log('Profile image uploaded and user state updated.', response.imageUrl);
        } else {
           console.warn('Image upload successful, but no imageUrl returned:', response);
           // Optionally, refetch user data here if backend doesn't return the URL
        }

      } catch (error) {
        console.error('Error uploading image:', error);
        // Optionally, display an error message to the user
      }
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    router.push('/login');
  };

  if (!user) {
    return null; // or a loading spinner
  }

  const fullName = `${user.firstName}`;

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
              {/* Left section with logo and title */}
              <div className="flex items-center space-x-4">
                {/* Sidebar toggle for mobile */}
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden text-gray-500 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Logo and title */}
                {/* <Link href={`/${userType}`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                  <div className="relative h-8 w-8">
                    <Image src="/logo.svg" alt="Hospinix Logo" fill className="rounded-lg" />
                  </div>
                  <h1 className="text-xl font-bold text-indigo-600">Hospinix</h1>
                </Link> */}
                
                <h2 className="text-lg font-medium text-gray-700 hidden md:block">{title}</h2>
              </div>
              
              {/* Right section with profile and logout */}
              <div className="flex items-center space-x-4">
                {/* Profile dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 group focus:outline-none"
                  >
                    <div className="relative">
                      {user.profileImage ? (
                        <Image 
                          src={user.profileImage} 
                          alt="Profile" 
                          width={40} 
                          height={40} 
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                          {user.firstName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <label className="absolute bottom-0 right-0 bg-indigo-500 rounded-full p-1 cursor-pointer hover:bg-indigo-600 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      </label>
                    </div>
                    <div className="hidden md:block">
                      <span className="text-sm font-medium text-gray-700 block">{fullName}</span>
                      <span className="text-xs text-gray-500 block">{user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile dropdown menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
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