import React, { useState, useEffect } from 'react';
import { Search, Check, X, Eye, Filter, Calendar } from 'lucide-react';
import PharmacistService from '@/services/pharmacist.service';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';

export default function DrugRequests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchQuery, statusFilter, urgencyFilter, dateFilter, requests]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await PharmacistService.getDrugRequests();
      setRequests(data);
      setFilteredRequests(data);
    } catch (err) {
      console.error('Failed to fetch drug requests:', err);
      setError('Failed to load drug requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.drugName.toLowerCase().includes(query) ||
          request.doctorName.toLowerCase().includes(query) ||
          request.patientName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== '') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Urgency filter
    if (urgencyFilter !== '') {
      filtered = filtered.filter(request => request.urgency === urgencyFilter);
    }

    // Date filter
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(request => new Date(request.requestDate) >= today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(request => new Date(request.requestDate) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(request => new Date(request.requestDate) >= monthAgo);
    }

    setFilteredRequests(filtered);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    try {
      await PharmacistService.approveDrugRequest(selectedRequest.id);
      
      setRequests(requests.map(request => 
        request.id === selectedRequest.id 
          ? { ...request, status: 'approved', approvedDate: new Date().toISOString() } 
          : request
      ));
      
      setShowApproveConfirm(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to approve drug request:', err);
      setError('Failed to approve the request. Please try again.');
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    
    try {
      await PharmacistService.rejectDrugRequest(selectedRequest.id, rejectReason);
      
      setRequests(requests.map(request => 
        request.id === selectedRequest.id 
          ? { ...request, status: 'rejected', rejectedDate: new Date().toISOString(), rejectionReason: rejectReason } 
          : request
      ));
      
      setShowRejectConfirm(false);
      setSelectedRequest(null);
      setRejectReason('');
    } catch (err) {
      console.error('Failed to reject drug request:', err);
      setError('Failed to reject the request. Please try again.');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setUrgencyFilter('');
    setDateFilter('');
  };

  // For demo purposes, using hardcoded data initially
  useEffect(() => {
    if (requests.length === 0 && !loading) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 6);
      
      const demoRequests = [
        {
          id: 1,
          drugName: 'Amoxicillin 500mg',
          drugForm: 'Capsule',
          drugStrength: '500mg',
          quantity: 30,
          frequency: '3 times daily',
          duration: '10 days',
          urgency: 'high',
          doctorId: 'D12345',
          doctorName: 'Dr. Sarah Johnson',
          patientId: 'P67890',
          patientName: 'Michael Wilson',
          patientAge: 45,
          patientGender: 'Male',
          diagnosis: 'Bacterial infection',
          notes: 'Patient has pneumonia, requires immediate treatment.',
          requestDate: today.toISOString(),
          status: 'pending',
          approvedDate: null,
          rejectedDate: null,
          rejectionReason: null
        },
        {
          id: 2,
          drugName: 'Lisinopril 10mg',
          drugForm: 'Tablet',
          drugStrength: '10mg',
          quantity: 30,
          frequency: 'Once daily',
          duration: '30 days',
          urgency: 'medium',
          doctorId: 'D45678',
          doctorName: 'Dr. Robert Chen',
          patientId: 'P12345',
          patientName: 'Emily Davis',
          patientAge: 58,
          patientGender: 'Female',
          diagnosis: 'Hypertension',
          notes: 'Patient is switching from another medication due to side effects.',
          requestDate: yesterday.toISOString(),
          status: 'approved',
          approvedDate: today.toISOString(),
          rejectedDate: null,
          rejectionReason: null
        },
        {
          id: 3,
          drugName: 'Metformin 850mg',
          drugForm: 'Tablet',
          drugStrength: '850mg',
          quantity: 60,
          frequency: 'Twice daily',
          duration: '30 days',
          urgency: 'medium',
          doctorId: 'D78901',
          doctorName: 'Dr. Maria Lopez',
          patientId: 'P23456',
          patientName: 'James Brown',
          patientAge: 62,
          patientGender: 'Male',
          diagnosis: 'Type 2 Diabetes',
          notes: 'New diagnosis, starting on medication.',
          requestDate: twoDaysAgo.toISOString(),
          status: 'rejected',
          approvedDate: null,
          rejectedDate: yesterday.toISOString(),
          rejectionReason: 'Out of stock. Suggested alternative: Metformin 500mg 3 times daily'
        },
        {
          id: 4,
          drugName: 'Sertraline 50mg',
          drugForm: 'Tablet',
          drugStrength: '50mg',
          quantity: 30,
          frequency: 'Once daily',
          duration: '30 days',
          urgency: 'low',
          doctorId: 'D12345',
          doctorName: 'Dr. Sarah Johnson',
          patientId: 'P34567',
          patientName: 'Lisa Taylor',
          patientAge: 36,
          patientGender: 'Female',
          diagnosis: 'Anxiety and Depression',
          notes: 'Patient is experiencing moderate symptoms of anxiety and depression.',
          requestDate: weekAgo.toISOString(),
          status: 'pending',
          approvedDate: null,
          rejectedDate: null,
          rejectionReason: null
        },
        {
          id: 5,
          drugName: 'Advair Diskus 250/50',
          drugForm: 'Inhaler',
          drugStrength: '250/50mcg',
          quantity: 1,
          frequency: 'Twice daily',
          duration: '30 days',
          urgency: 'high',
          doctorId: 'D78901',
          doctorName: 'Dr. Maria Lopez',
          patientId: 'P45678',
          patientName: 'John Garcia',
          patientAge: 42,
          patientGender: 'Male',
          diagnosis: 'Asthma',
          notes: 'Patient had recent asthma attack. Requires better maintenance therapy.',
          requestDate: yesterday.toISOString(),
          status: 'approved',
          approvedDate: today.toISOString(),
          rejectedDate: null,
          rejectionReason: null
        }
      ];
      setRequests(demoRequests);
      setFilteredRequests(demoRequests);
    }
  }, [requests, loading]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge color="yellow">Pending</Badge>;
      case 'approved':
        return <Badge color="green">Approved</Badge>;
      case 'rejected':
        return <Badge color="red">Rejected</Badge>;
      default:
        return <Badge color="gray">Unknown</Badge>;
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'high':
        return <Badge color="red">High</Badge>;
      case 'medium':
        return <Badge color="yellow">Medium</Badge>;
      case 'low':
        return <Badge color="blue">Low</Badge>;
      default:
        return <Badge color="gray">Standard</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Drug Requests</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
            <button 
              className="ml-2 font-bold"
              onClick={() => setError('')}
            >
              ✕
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by drug name, doctor, or patient..."
                  className="pl-10 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={16} />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                  >
                    <option value="">All Urgencies</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Date
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Requests Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Drug
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status/Urgency
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading drug requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No drug requests found. {searchQuery || statusFilter || urgencyFilter || dateFilter ? 'Try different filter settings.' : ''}
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.drugName}</div>
                            <div className="text-sm text-gray-500">{request.drugForm}, {request.drugStrength}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.doctorName}</div>
                        <div className="text-sm text-gray-500">ID: {request.doctorId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.patientName}</div>
                        <div className="text-sm text-gray-500">
                          {request.patientAge} years, {request.patientGender}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{getStatusBadge(request.status)}</div>
                        <div className="mt-1">{getUrgencyBadge(request.urgency)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(request.requestDate), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowApproveConfirm(true);
                              }}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Request Modal */}
      <Dialog
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Drug Request Details"
      >
        {selectedRequest && (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold mb-2">{selectedRequest.drugName}</h2>
                <div className="flex gap-2">
                  {getStatusBadge(selectedRequest.status)}
                  {getUrgencyBadge(selectedRequest.urgency)}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {selectedRequest.drugForm}, {selectedRequest.drugStrength}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Request Details</h3>
                <p className="mt-1 text-sm text-gray-900">Quantity: {selectedRequest.quantity}</p>
                <p className="mt-1 text-sm text-gray-900">Frequency: {selectedRequest.frequency}</p>
                <p className="mt-1 text-sm text-gray-900">Duration: {selectedRequest.duration}</p>
                <p className="mt-1 text-sm text-gray-900">
                  Requested: {new Date(selectedRequest.requestDate).toLocaleString()}
                </p>
                {selectedRequest.status === 'approved' && selectedRequest.approvedDate && (
                  <p className="mt-1 text-sm text-gray-900">
                    Approved: {new Date(selectedRequest.approvedDate).toLocaleString()}
                  </p>
                )}
                {selectedRequest.status === 'rejected' && selectedRequest.rejectedDate && (
                  <>
                    <p className="mt-1 text-sm text-gray-900">
                      Rejected: {new Date(selectedRequest.rejectedDate).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      Reason: {selectedRequest.rejectionReason}
                    </p>
                  </>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Doctor Information</h3>
                <p className="mt-1 text-sm text-gray-900">Name: {selectedRequest.doctorName}</p>
                <p className="mt-1 text-sm text-gray-900">ID: {selectedRequest.doctorId}</p>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4">Patient Information</h3>
                <p className="mt-1 text-sm text-gray-900">Name: {selectedRequest.patientName}</p>
                <p className="mt-1 text-sm text-gray-900">ID: {selectedRequest.patientId}</p>
                <p className="mt-1 text-sm text-gray-900">
                  Age: {selectedRequest.patientAge}, Gender: {selectedRequest.patientGender}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500">Diagnosis</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedRequest.diagnosis}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedRequest.notes}</p>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
              
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setShowApproveConfirm(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setShowRejectConfirm(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                  >
                    <X size={16} />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Dialog>

      {/* Approve Confirmation Modal */}
      <Dialog
        open={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        title="Confirm Approval"
      >
        {selectedRequest && (
          <div className="p-6">
            <p className="mb-4">
              Are you sure you want to approve the request for <strong>{selectedRequest.drugName}</strong> ({selectedRequest.quantity} {selectedRequest.drugForm}) for patient <strong>{selectedRequest.patientName}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveRequest}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Check size={16} />
                Approve
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Reject Confirmation Modal */}
      <Dialog
        open={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        title="Confirm Rejection"
      >
        {selectedRequest && (
          <div className="p-6">
            <p className="mb-4">
              Are you sure you want to reject the request for <strong>{selectedRequest.drugName}</strong> for patient <strong>{selectedRequest.patientName}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rejection
              </label>
              <textarea
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please provide a reason for rejecting this request..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectRequest}
                disabled={!rejectReason.trim()}
                className={`px-4 py-2 text-white rounded-md flex items-center gap-2 ${
                  rejectReason.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-red-400 cursor-not-allowed'
                }`}
              >
                <X size={16} />
                Reject
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </DashboardLayout>
  );
} 