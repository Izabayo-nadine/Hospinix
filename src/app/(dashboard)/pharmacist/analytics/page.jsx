import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Calendar, TrendingUp, ShoppingCart, AlertTriangle, FileText, Clock } from 'lucide-react';

export default function PharmacyAnalytics() {
  const [activeView, setActiveView] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Mock data for charts
  const dispensedMedicationsData = [
    { name: 'Antibiotics', value: 145 },
    { name: 'Antihypertensives', value: 120 },
    { name: 'Painkillers', value: 178 },
    { name: 'Antidiabetics', value: 87 },
    { name: 'Antihistamines', value: 65 }
  ];

  const stockLevelData = [
    { name: 'Critical', value: 12 },
    { name: 'Low', value: 25 },
    { name: 'Normal', value: 105 },
    { name: 'Excess', value: 18 }
  ];

  const requestTrendsData = [
    { name: 'Week 1', pending: 25, approved: 45, rejected: 5 },
    { name: 'Week 2', pending: 18, approved: 52, rejected: 8 },
    { name: 'Week 3', pending: 22, approved: 49, rejected: 6 },
    { name: 'Week 4', pending: 15, approved: 55, rejected: 4 }
  ];

  const revenueData = [
    { name: 'Jan', revenue: 12000 },
    { name: 'Feb', revenue: 14500 },
    { name: 'Mar', revenue: 13800 },
    { name: 'Apr', revenue: 15200 },
    { name: 'May', revenue: 16800 },
    { name: 'Jun', revenue: 14300 }
  ];

  const expiryWarningData = [
    { name: 'This Month', count: 15 },
    { name: '1-3 Months', count: 28 },
    { name: '3-6 Months', count: 35 },
    { name: '6-12 Months', count: 64 }
  ];

  const mostRequestedDrugsData = [
    { name: 'Amoxicillin', count: 42 },
    { name: 'Lisinopril', count: 38 },
    { name: 'Metformin', count: 35 },
    { name: 'Atorvastatin', count: 31 },
    { name: 'Albuterol', count: 28 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderStatCard = (title, value, icon, trend, description) => (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {trend && (
            <div className={`flex items-center mt-1 text-sm ${trend.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
              <TrendingUp size={14} className="mr-1" />
              <span>{trend} this {timeRange}</span>
            </div>
          )}
          {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
        </div>
        <div className="p-3 bg-blue-100 rounded-full">
          {icon}
        </div>
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pharmacy Analytics</h1>
          <div className="flex space-x-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* View Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveView('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('inventory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inventory Analytics
            </button>
            <button
              onClick={() => setActiveView('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Request Trends
            </button>
            <button
              onClick={() => setActiveView('financial')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'financial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Financial
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Overview Dashboard */}
            {activeView === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {renderStatCard("Total Medications Dispensed", "595", <ShoppingCart size={24} className="text-blue-500" />, "+12.3%", "Based on prescriptions filled")}
                  {renderStatCard("Pending Requests", "23", <Clock size={24} className="text-yellow-500" />, "-5.2%", "Waiting for approval")}
                  {renderStatCard("Low Stock Items", "37", <AlertTriangle size={24} className="text-red-500" />, "+8.7%", "Items needing reorder")}
                  {renderStatCard("Completed Requests", "412", <FileText size={24} className="text-green-500" />, "+15.1%", "Successfully processed")}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Dispensed Medications by Category</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dispensedMedicationsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {dispensedMedicationsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Inventory Stock Levels</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stockLevelData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Drug Request Trends (Monthly)</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={requestTrendsData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="pending" stackId="a" fill="#FFBB28" />
                          <Bar dataKey="approved" stackId="a" fill="#00C49F" />
                          <Bar dataKey="rejected" stackId="a" fill="#FF8042" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* Inventory Analytics */}
            {activeView === 'inventory' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {renderStatCard("Total Inventory Items", "160", <ShoppingCart size={24} className="text-blue-500" />, "+3.2%", "Unique medications")}
                  {renderStatCard("Items Expiring Soon", "15", <AlertTriangle size={24} className="text-red-500" />, "+5.8%", "Within next 30 days")}
                  {renderStatCard("Avg. Stock Turnover", "12.5 days", <Clock size={24} className="text-green-500" />, "-2.1%", "Time to deplete stock")}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Most Requested Medications</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={mostRequestedDrugsData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#0088FE" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Expiring Medications Timeline</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={expiryWarningData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#FF8042" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Inventory Category Distribution</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Antibiotics', value: 35 },
                              { name: 'Antihypertensives', value: 28 },
                              { name: 'Analgesics', value: 22 },
                              { name: 'Antidiabetics', value: 18 },
                              { name: 'Antihistamines', value: 15 },
                              { name: 'Others', value: 42 }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {dispensedMedicationsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* Request Trends */}
            {activeView === 'requests' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {renderStatCard("Total Requests", "201", <FileText size={24} className="text-blue-500" />, "+18.3%", "This period")}
                  {renderStatCard("Approval Rate", "87.2%", <FileText size={24} className="text-green-500" />, "+2.5%", "Improved from last period")}
                  {renderStatCard("Avg. Response Time", "3.2 hours", <Clock size={24} className="text-yellow-500" />, "-15.1%", "Time to process")}
                </div>

                <div className="grid grid-cols-1 gap-6 mb-8">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Request Status Breakdown</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { date: 'Mon', pending: 12, approved: 25, rejected: 3 },
                            { date: 'Tue', pending: 15, approved: 28, rejected: 2 },
                            { date: 'Wed', pending: 10, approved: 32, rejected: 4 },
                            { date: 'Thu', pending: 8, approved: 30, rejected: 2 },
                            { date: 'Fri', pending: 14, approved: 27, rejected: 3 },
                            { date: 'Sat', pending: 5, approved: 15, rejected: 1 },
                            { date: 'Sun', pending: 3, approved: 10, rejected: 0 }
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="pending" stroke="#FFBB28" activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="approved" stroke="#00C49F" />
                          <Line type="monotone" dataKey="rejected" stroke="#FF8042" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Requests by Urgency</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'High', value: 45 },
                              { name: 'Medium', value: 98 },
                              { name: 'Low', value: 58 }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#FF8042" />
                            <Cell fill="#FFBB28" />
                            <Cell fill="#00C49F" />
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Requests by Doctor</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Dr. Johnson', count: 45 },
                            { name: 'Dr. Chen', count: 38 },
                            { name: 'Dr. Lopez', count: 32 },
                            { name: 'Dr. Smith', count: 28 },
                            { name: 'Dr. Wilson', count: 25 }
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* Financial Dashboard */}
            {activeView === 'financial' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {renderStatCard("Monthly Revenue", "$42,580", <ShoppingCart size={24} className="text-green-500" />, "+10.3%", "From medication sales")}
                  {renderStatCard("Average Order Value", "$124.35", <ShoppingCart size={24} className="text-blue-500" />, "+5.2%", "Per prescription")}
                  {renderStatCard("Inventory Value", "$158,250", <ShoppingCart size={24} className="text-purple-500" />, "+2.8%", "Current stock")}
                </div>

                <div className="grid grid-cols-1 gap-6 mb-8">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Revenue Trends</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={revenueData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                          <Legend />
                          <Line type="monotone" dataKey="revenue" stroke="#0088FE" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Revenue by Category</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Antibiotics', value: 12500 },
                              { name: 'Antihypertensives', value: 9800 },
                              { name: 'Painkillers', value: 8500 },
                              { name: 'Antidiabetics', value: 7200 },
                              { name: 'Others', value: 4580 }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {dispensedMedicationsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Top 5 Revenue-Generating Medications</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Lipitor', value: 4850 },
                            { name: 'Humira', value: 4200 },
                            { name: 'Eliquis', value: 3800 },
                            { name: 'Januvia', value: 3200 },
                            { name: 'Xarelto', value: 2950 }
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" />
                          <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                          <Legend />
                          <Bar dataKey="value" fill="#00C49F" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 