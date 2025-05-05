"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DoctorService from "@/services/doctor.service";

export default function DoctorRooms() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [wardFilter, setWardFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    number: "",
    name: "",
    ward: "General Ward",
    type: "Standard",
    capacity: 2,
    features: []
  });
  
  // Fetch rooms data from the API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const filters = {
          ward: wardFilter !== "all" ? wardFilter : undefined,
          type: typeFilter !== "all" ? typeFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchQuery || undefined
        };
        
        const roomsData = await DoctorService.getRooms(filters);
        setRooms(roomsData);
        setError("");
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Failed to load room data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [wardFilter, typeFilter, statusFilter, searchQuery]);

  // Get unique ward names and room types for filter options
  const wardOptions = ["all", ...new Set(rooms.map(room => room.ward))];
  const typeOptions = ["all", ...new Set(rooms.map(room => room.type))];

  // Get filtered rooms based on search and filters
  const getFilteredRooms = () => {
    return rooms.filter(room => 
      (wardFilter === "all" || room.ward === wardFilter) &&
      (typeFilter === "all" || room.type === typeFilter) &&
      (statusFilter === "all" || room.status === statusFilter) &&
      (searchQuery === "" || 
        room.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const filteredRooms = getFilteredRooms();

  // Handle adding a new room
  const handleAddRoom = async () => {
    try {
      setLoading(true);
      await DoctorService.addRoom(newRoom);
      setShowAddModal(false);
      setNewRoom({
        number: "",
        name: "",
        ward: "General Ward",
        type: "Standard",
        capacity: 2,
        features: []
      });
      
      // Refresh rooms data
      const roomsData = await DoctorService.getRooms();
      setRooms(roomsData);
      setError("");
    } catch (err) {
      console.error("Error adding room:", err);
      setError("Failed to add room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle updating room status
  const handleUpdateStatus = async (roomId, newStatus) => {
    try {
      await DoctorService.updateRoomStatus(roomId, newStatus);
      
      // Refresh rooms data
      const roomsData = await DoctorService.getRooms();
      setRooms(roomsData);
    } catch (err) {
      console.error("Error updating room status:", err);
      setError("Failed to update room status. Please try again.");
    }
  };

  // Get status color class based on room status
  const getStatusColorClass = (status) => {
    switch (status) {
      case "Full":
        return "bg-red-100 text-red-800";
      case "Available":
        return "bg-green-100 text-green-800";
      case "Partially Occupied":
        return "bg-blue-100 text-blue-800";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "Reserved":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate occupancy percentage
  const calculateOccupancy = (room) => {
    if (room.capacity === 0) return "0%";
    return `${Math.round((room.occupancy / room.capacity) * 100)}%`;
  };

  // Handle view room details
  const handleViewRoomDetails = (roomId) => {
    router.push(`/doctor/rooms/${roomId}`);
  };

  // Handle assigning patient to room
  const handleAssignPatient = (roomId) => {
    router.push(`/doctor/rooms/${roomId}/assign`);
  };

  return (
    <DashboardLayout userType="doctor" title="Room Management">
      <div className="bg-white shadow rounded-lg p-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Hospital Rooms</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search room number or name..."
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex space-x-2">
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
              >
                <option value="all">All Wards</option>
                {wardOptions.filter(ward => ward !== "all").map(ward => (
                  <option key={ward} value={ward}>{ward}</option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {typeOptions.filter(type => type !== "all").map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Partially Occupied">Partially Occupied</option>
                <option value="Full">Full</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Reserved">Reserved</option>
              </select>
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                onClick={() => setShowAddModal(true)}
              >
                Add New Room
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Loading room data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRooms.map((room) => (
                    <tr key={room.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.ward}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{room.capacity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="mr-2">{room.occupancy}/{room.capacity}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${room.status === "Full" ? "bg-red-500" : room.status === "Partially Occupied" ? "bg-blue-500" : "bg-green-500"}`}
                              style={{ width: calculateOccupancy(room) }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(room.status)}`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        <div className="flex flex-wrap gap-1">
                          {room.features && room.features.map((feature, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => handleViewRoomDetails(room.id)}
                        >
                          View Details
                        </button>
                        {room.status === "Available" || room.status === "Partially Occupied" ? (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleAssignPatient(room.id)}
                          >
                            Assign Patient
                          </button>
                        ) : null}
                        {room.status === "Maintenance" ? (
                          <button 
                            className="text-yellow-600 hover:text-yellow-900"
                            onClick={() => handleUpdateStatus(room.id, "Available")}
                          >
                            Set Available
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredRooms.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No rooms found matching your criteria.
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredRooms.length}</span> of <span className="font-medium">{rooms.length}</span> rooms
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-gray-50">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Room</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md py-2 px-4 w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={newRoom.number}
                  onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md py-2 px-4 w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ward
                </label>
                <select
                  className="border border-gray-300 rounded-md py-2 px-4 w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={newRoom.ward}
                  onChange={(e) => setNewRoom({...newRoom, ward: e.target.value})}
                >
                  <option value="General Ward">General Ward</option>
                  <option value="ICU">ICU</option>
                  <option value="Pediatric Ward">Pediatric Ward</option>
                  <option value="Maternity Ward">Maternity Ward</option>
                  <option value="Emergency Ward">Emergency Ward</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <select
                  className="border border-gray-300 rounded-md py-2 px-4 w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
                >
                  <option value="Standard">Standard</option>
                  <option value="Isolation">Isolation</option>
                  <option value="Intensive Care">Intensive Care</option>
                  <option value="Pediatric">Pediatric</option>
                  <option value="Maternity">Maternity</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="border border-gray-300 rounded-md py-2 px-4 w-full focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom({...newRoom, capacity: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Features
                </label>
                <p className="text-sm text-gray-500 mb-2">Select features for this room:</p>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {["Oxygen Supply", "Call Button", "Television", "Private Bathroom", "Negative Pressure", 
                    "Ventilator", "Cardiac Monitor", "Dialysis Access", "Child-Friendly Decor", 
                    "Birthing Bed", "Infant Warmer", "Fetal Monitor"].map((feature) => (
                    <div key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`feature-${feature}`}
                        checked={newRoom.features?.includes(feature) || false}
                        onChange={(e) => {
                          let newFeatures = [...(newRoom.features || [])];
                          if (e.target.checked) {
                            newFeatures.push(feature);
                          } else {
                            newFeatures = newFeatures.filter(f => f !== feature);
                          }
                          setNewRoom({...newRoom, features: newFeatures});
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`feature-${feature}`} className="ml-2 block text-sm text-gray-700">
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddRoom}
                disabled={!newRoom.number || !newRoom.name || loading}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  !newRoom.number || !newRoom.name || loading
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? "Adding..." : "Add Room"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 