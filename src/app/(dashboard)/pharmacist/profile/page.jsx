import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Clock, 
  Edit,
  Bell,
  Lock,
  Settings
} from 'lucide-react';

export default function PharmacistProfile() {
  // Mock data for the pharmacist profile
  const pharmacist = {
    name: "Dr. Rebecca Chen",
    email: "rebecca.chen@medclinic.com",
    phone: "+1 (555) 987-6543",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    address: "123 Health Avenue, Suite 405, Medical District, CA 90210",
    dateJoined: "2018-05-15",
    licenseNumber: "PHR-54321",
    certification: "Board Certified Pharmacotherapy Specialist (BCPS)",
    certificationDate: "2017-03-10",
    certificationExpiry: "2023-03-10",
    education: [
      {
        degree: "Doctor of Pharmacy (Pharm.D)",
        institution: "University of California, San Francisco",
        year: "2016"
      },
      {
        degree: "Bachelor of Science in Chemistry",
        institution: "University of Washington",
        year: "2012"
      }
    ],
    specialties: ["Geriatric Pharmacy", "Anticoagulation Management", "Diabetes Education"],
    workingHours: {
      monday: "8:00 AM - 4:00 PM",
      tuesday: "8:00 AM - 4:00 PM",
      wednesday: "10:00 AM - 6:00 PM",
      thursday: "8:00 AM - 4:00 PM",
      friday: "8:00 AM - 4:00 PM",
      saturday: "OFF",
      sunday: "OFF"
    },
    notifications: {
      lowStockAlert: true,
      expiringMedicationAlert: true,
      newRequestAlert: true,
      systemUpdates: false
    },
    preferences: {
      theme: "light",
      language: "English",
      defaultView: "inventory"
    }
  };

  // Calculate if certification is expired or expiring soon
  const today = new Date();
  const expiryDate = new Date(pharmacist.certificationExpiry);
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(today.getMonth() + 6);
  
  const isCertificationExpired = expiryDate < today;
  const isCertificationExpiringSoon = !isCertificationExpired && expiryDate < sixMonthsFromNow;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Button className="flex items-center gap-2">
            <Edit size={16} />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card className="col-span-1 p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                <img 
                  src={pharmacist.avatar} 
                  alt={pharmacist.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-semibold">{pharmacist.name}</h2>
              <p className="text-gray-500 text-sm">Pharmacist</p>
              
              <div className="flex gap-2 mt-3">
                <Badge color="blue">Verified</Badge>
                {isCertificationExpired ? (
                  <Badge color="red">Certification Expired</Badge>
                ) : isCertificationExpiringSoon ? (
                  <Badge color="yellow">Certification Expiring Soon</Badge>
                ) : (
                  <Badge color="green">Certified</Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-gray-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{pharmacist.email}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{pharmacist.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm">{pharmacist.address}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date Joined</p>
                  <p>{formatDate(pharmacist.dateJoined)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Professional Credentials */}
          <Card className="col-span-1 lg:col-span-2 p-6">
            <h2 className="text-lg font-semibold mb-4">Professional Information</h2>
            
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">License Number</h3>
                  <p className="font-medium">{pharmacist.licenseNumber}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Certification</h3>
                  <p className="font-medium">{pharmacist.certification}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Certified</h3>
                  <p>{formatDate(pharmacist.certificationDate)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Certification Expiry</h3>
                  <p className={isCertificationExpired ? "text-red-500 font-medium" : ""}>
                    {formatDate(pharmacist.certificationExpiry)}
                    {isCertificationExpiringSoon && !isCertificationExpired && (
                      <span className="ml-2 text-yellow-500 text-sm">(Renew soon)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="text-md font-semibold mb-3">Education</h3>
            <div className="mb-6 space-y-3">
              {pharmacist.education.map((edu, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-sm">{edu.institution}, {edu.year}</p>
                </div>
              ))}
            </div>
            
            <h3 className="text-md font-semibold mb-3">Specialties</h3>
            <div className="mb-6 flex flex-wrap gap-2">
              {pharmacist.specialties.map((specialty, index) => (
                <Badge key={index} color="blue">{specialty}</Badge>
              ))}
            </div>
            
            <h3 className="text-md font-semibold mb-3">Working Hours</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {Object.entries(pharmacist.workingHours).map(([day, hours]) => (
                <div key={day} className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium capitalize">{day}</p>
                  <p className="text-sm">{hours}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Settings and Preferences */}
          <Card className="col-span-1 lg:col-span-3 p-6">
            <h2 className="text-lg font-semibold mb-4">Settings & Preferences</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="flex items-center text-md font-medium mb-3">
                  <Bell size={18} className="mr-2 text-gray-500" />
                  Notification Preferences
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="lowStock" className="text-sm">Low stock alerts</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input 
                        type="checkbox" 
                        id="lowStock" 
                        className="sr-only"
                        checked={pharmacist.notifications.lowStockAlert}
                        readOnly
                      />
                      <div className={`block w-10 h-6 rounded-full ${
                        pharmacist.notifications.lowStockAlert ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        pharmacist.notifications.lowStockAlert ? 'transform translate-x-4' : ''
                      }`}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label htmlFor="expiringMed" className="text-sm">Expiring medication alerts</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input 
                        type="checkbox" 
                        id="expiringMed" 
                        className="sr-only"
                        checked={pharmacist.notifications.expiringMedicationAlert}
                        readOnly
                      />
                      <div className={`block w-10 h-6 rounded-full ${
                        pharmacist.notifications.expiringMedicationAlert ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        pharmacist.notifications.expiringMedicationAlert ? 'transform translate-x-4' : ''
                      }`}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label htmlFor="newRequest" className="text-sm">New drug request alerts</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input 
                        type="checkbox" 
                        id="newRequest" 
                        className="sr-only"
                        checked={pharmacist.notifications.newRequestAlert}
                        readOnly
                      />
                      <div className={`block w-10 h-6 rounded-full ${
                        pharmacist.notifications.newRequestAlert ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        pharmacist.notifications.newRequestAlert ? 'transform translate-x-4' : ''
                      }`}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label htmlFor="sysUpdates" className="text-sm">System updates</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input 
                        type="checkbox" 
                        id="sysUpdates" 
                        className="sr-only"
                        checked={pharmacist.notifications.systemUpdates}
                        readOnly
                      />
                      <div className={`block w-10 h-6 rounded-full ${
                        pharmacist.notifications.systemUpdates ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        pharmacist.notifications.systemUpdates ? 'transform translate-x-4' : ''
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="flex items-center text-md font-medium mb-3">
                  <Settings size={18} className="mr-2 text-gray-500" />
                  Application Preferences
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                    <select
                      id="theme"
                      className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={pharmacist.preferences.theme}
                      readOnly
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select
                      id="language"
                      className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={pharmacist.preferences.language}
                      readOnly
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Chinese">Chinese</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="defaultView" className="block text-sm font-medium text-gray-700 mb-1">Default Dashboard View</label>
                    <select
                      id="defaultView"
                      className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={pharmacist.preferences.defaultView}
                      readOnly
                    >
                      <option value="inventory">Inventory</option>
                      <option value="requests">Drug Requests</option>
                      <option value="analytics">Analytics</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="outline" className="flex items-center gap-2">
                <Lock size={16} />
                Change Password
              </Button>
              <Button className="flex items-center gap-2">
                <Settings size={16} />
                Save Preferences
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 