"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import DoctorService from "@/services/doctor.service";

export default function RoomDetail() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id;
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoom, setEditedRoom] = useState(null);

  useEffect(() => {
    // Check for success message in URL
    const searchParams = new URLSearchParams(window.location.search);
    const successParam = searchParams.get('success');
    
    if (successParam === 'assigned') {
      setSuccess('Patient was successfully assigned to this room');
      // Remove success from URL after displaying
      router.replace(`/doctor/rooms/${roomId}`);
    }

    const fetchRoom = async () => {
      try {
        setLoading(true);
        // Get room from the API or mock data via the service
        const roomData = await DoctorService.getRoomById(roomId);
        console.log("Successfully loaded room data:", roomData);
        setRoom(roomData);
        setEditedRoom(roomData);
      } catch (err) {
        console.error("Error fetching room:", err);
        setError("Failed to load room data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId, router]);

  const handleUpdateRoom = async () => {
    try {
      setLoading(true);
      await DoctorService.updateRoom(roomId, editedRoom);
      setRoom(editedRoom);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating room:", err);
      setError("Failed to update room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      setLoading(true);
      await DoctorService.updateRoomStatus(roomId, newStatus);
      
      // Refresh room data
      const updatedRoom = await DoctorService.getRoomById(roomId);
      setRoom(updatedRoom);
      setEditedRoom(updatedRoom);
    } catch (err) {
      console.error("Error updating room status:", err);
      setError("Failed to update room status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPatient = () => {
    router.push(`/doctor/rooms/${roomId}/assign`);
  };

  if (loading) {
    return (
      <DashboardLayout userType="doctor" title="Room Details">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-500">Loading room data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="doctor" title="Room Details">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
          <button
            onClick={() => router.back()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!room) {
    return (
      <DashboardLayout userType="doctor" title="Room Details">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-4 text-gray-500">
            Room not found or could not be loaded.
          </div>
          <button
            onClick={() => router.back()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="doctor" title={`Room ${room.number}`}>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          {success && (
            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-6">
              {success}
            </div>
          )}
          
          {room.mock && (
            <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md mb-6">
              <p className="font-medium">Using sample data</p>
              <p className="text-sm">This room data is being shown for demonstration purposes only.</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {room.name} <span className="text-gray-500">({room.id})</span>
            </h2>
            <div className="space-x-2">
              {!isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Edit Details
                  </button>
                  {room.status === "Available" || room.status === "Partially Occupied" ? (
                    <button 
                      onClick={handleAssignPatient}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Assign Patient
                    </button>
                  ) : null}
                  <button 
                    onClick={() => router.back()}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                  >
                    Back
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleUpdateRoom}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditedRoom(room);
                    }}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Room Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Room Name
                        </label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded-md py-2 px-4 w-full"
                          value={editedRoom.name}
                          onChange={(e) => setEditedRoom({...editedRoom, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ward
                        </label>
                        <select
                          className="border border-gray-300 rounded-md py-2 px-4 w-full"
                          value={editedRoom.ward}
                          onChange={(e) => setEditedRoom({...editedRoom, ward: e.target.value})}
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
                          className="border border-gray-300 rounded-md py-2 px-4 w-full"
                          value={editedRoom.type}
                          onChange={(e) => setEditedRoom({...editedRoom, type: e.target.value})}
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
                          className="border border-gray-300 rounded-md py-2 px-4 w-full"
                          value={editedRoom.capacity}
                          onChange={(e) => setEditedRoom({...editedRoom, capacity: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="w-1/3 text-gray-600">Room Number:</span>
                        <span className="w-2/3 font-medium">{room.number}</span>
                      </div>
                      <div className="flex">
                        <span className="w-1/3 text-gray-600">Ward:</span>
                        <span className="w-2/3 font-medium">{room.ward}</span>
                      </div>
                      <div className="flex">
                        <span className="w-1/3 text-gray-600">Type:</span>
                        <span className="w-2/3 font-medium">{room.type}</span>
                      </div>
                      <div className="flex">
                        <span className="w-1/3 text-gray-600">Capacity:</span>
                        <span className="w-2/3 font-medium">{room.capacity}</span>
                      </div>
                      <div className="flex">
                        <span className="w-1/3 text-gray-600">Occupancy:</span>
                        <span className="w-2/3 font-medium">{room.occupancy}/{room.capacity}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-1/3 text-gray-600">Status:</span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${room.status === "Full" ? "bg-red-100 text-red-800" : 
                          room.status === "Available" ? "bg-green-100 text-green-800" : 
                          room.status === "Partially Occupied" ? "bg-blue-100 text-blue-800" : 
                          room.status === "Maintenance" ? "bg-yellow-100 text-yellow-800" : 
                          "bg-gray-100 text-gray-800"}`}>
                          {room.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {!isEditing && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Change Status</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleChangeStatus("Available")}
                      className={`px-3 py-1 rounded text-sm ${
                        room.status === "Available" ? "bg-green-200 text-green-800" : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                      disabled={room.status === "Available"}
                    >
                      Available
                    </button>
                    <button 
                      onClick={() => handleChangeStatus("Maintenance")}
                      className={`px-3 py-1 rounded text-sm ${
                        room.status === "Maintenance" ? "bg-yellow-200 text-yellow-800" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      }`}
                      disabled={room.status === "Maintenance"}
                    >
                      Maintenance
                    </button>
                    <button 
                      onClick={() => handleChangeStatus("Reserved")}
                      className={`px-3 py-1 rounded text-sm ${
                        room.status === "Reserved" ? "bg-purple-200 text-purple-800" : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                      }`}
                      disabled={room.status === "Reserved"}
                    >
                      Reserved
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Features</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {isEditing ? (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Select features for this room:</p>
                      <div className="space-y-2">
                        {["Oxygen Supply", "Call Button", "Television", "Private Bathroom", "Negative Pressure", 
                          "Ventilator", "Cardiac Monitor", "Dialysis Access", "Child-Friendly Decor", 
                          "Birthing Bed", "Infant Warmer", "Fetal Monitor"].map((feature) => (
                          <div key={feature} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`feature-${feature}`}
                              checked={editedRoom.features?.includes(feature) || false}
                              onChange={(e) => {
                                let newFeatures = [...(editedRoom.features || [])];
                                if (e.target.checked) {
                                  newFeatures.push(feature);
                                } else {
                                  newFeatures = newFeatures.filter(f => f !== feature);
                                }
                                setEditedRoom({...editedRoom, features: newFeatures});
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
                  ) : (
                    <div>
                      {room.features && room.features.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {room.features.map((feature, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {feature}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No features specified for this room.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {isEditing ? (
                    <textarea
                      className="border border-gray-300 rounded-md py-2 px-4 w-full h-24"
                      value={editedRoom.notes || ""}
                      onChange={(e) => setEditedRoom({...editedRoom, notes: e.target.value})}
                      placeholder="Add notes about this room..."
                    />
                  ) : (
                    <p className="text-gray-700">
                      {room.notes || "No notes available for this room."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 