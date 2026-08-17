import { useState, useEffect } from "react";
import DoctorService from "../../services/doctor.service";
import AppointmentForm from "../../components/forms/AppointmentForm";
import PrescriptionForm from "../../components/forms/PrescriptionForm";

const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [modalProps, setModalProps] = useState({});
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all required data in parallel
        const [dashboardStats, appointments, prescriptions] = await Promise.all(
          [
            DoctorService.getDashboardStats(),
            DoctorService.getAppointments({ status: "SCHEDULED" }),
            DoctorService.getPrescriptions({ status: "ACTIVE" }),
          ]
        );

        setStats(dashboardStats);
        setUpcomingAppointments(appointments.slice(0, 5)); // Show only first 5 appointments
        setPendingPrescriptions(prescriptions.slice(0, 5)); // Show only first 5 prescriptions
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const openModal = (modalType, props = {}) => {
    setActiveModal(modalType);
    setModalProps(props);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalProps({});
  };

  const handleFormSuccess = async (data) => {
    closeModal();
    // Refresh dashboard data after successful form submission
    try {
      const [dashboardStats, appointments, prescriptions] = await Promise.all([
        DoctorService.getDashboardStats(),
        DoctorService.getAppointments({ status: "SCHEDULED" }),
        DoctorService.getPrescriptions({ status: "ACTIVE" }),
      ]);

      setStats(dashboardStats);
      setUpcomingAppointments(appointments.slice(0, 5));
      setPendingPrescriptions(prescriptions.slice(0, 5));
    } catch (err) {
      console.error("Failed to refresh dashboard data:", err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading dashboard...
      </div>
    );
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!stats) return null;

  // Mock data for demonstration purposes
  const mockStats = {
    totalPatients: stats.totalPatients || 120,
    completedAppointments: stats.completedAppointments || 45,
    pendingAppointments: stats.pendingAppointments || 15,
    activePrescriptions: stats.activePrescriptions || 30,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Doctor Dashboard</h1>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => openModal("scheduleAppointment")}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
          >
            Schedule Appointment
          </button>
          <button
            onClick={() => openModal("createPrescription")}
            className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
          >
            Create Prescription
          </button>
          <button
            onClick={() => openModal("bedAssignment")}
            className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow"
          >
            Bed Assignment
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Dashboard Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Patients"
            value={mockStats.totalPatients}
            icon="🧑‍🤝‍🧑"
            color="bg-blue-100"
          />
          <StatCard
            title="Completed Appointments"
            value={mockStats.completedAppointments}
            icon="✅"
            color="bg-green-100"
          />
          <StatCard
            title="Pending Appointments"
            value={mockStats.pendingAppointments}
            icon="⏳"
            color="bg-yellow-100"
          />
          <StatCard
            title="Active Prescriptions"
            value={mockStats.activePrescriptions}
            icon="📋"
            color="bg-purple-100"
          />
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {upcomingAppointments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAppointments.map((appointment, index) => (
                  <tr key={appointment.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patientName || "John Doe"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {appointment.dateTime || "2023-06-15 10:30 AM"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {appointment.reason || "Regular checkup"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Complete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No upcoming appointments
            </div>
          )}
        </div>
      </div>

      {/* Recent Prescriptions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Prescriptions</h2>
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {pendingPrescriptions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingPrescriptions.map((prescription, index) => (
                  <tr key={prescription.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {prescription.patientName || "Jane Smith"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {prescription.date || "2023-06-10"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {prescription.diagnosis || "Acute bronchitis"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No recent prescriptions
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-1">
              {/* Schedule Appointment Modal */}
              {activeModal === "scheduleAppointment" && (
                <AppointmentForm
                  onSuccess={handleFormSuccess}
                  onCancel={closeModal}
                  {...modalProps}
                />
              )}

              {/* Create Prescription Modal */}
              {activeModal === "createPrescription" && (
                <PrescriptionForm
                  onSuccess={handleFormSuccess}
                  onCancel={closeModal}
                  {...modalProps}
                />
              )}

              {/* Bed Assignment Modal */}
              {activeModal === "bedAssignment" && (
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-4">Bed Assignment</h2>
                  <p className="text-gray-600 mb-4">
                    This feature is currently under development.
                  </p>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for stats
const StatCard = ({ title, value, icon, color }) => (
  <div className={`${color} p-4 rounded-lg shadow flex items-center`}>
    <div className="text-3xl mr-4">{icon}</div>
    <div>
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <p className="text-2xl font-bold">{value || 0}</p>
    </div>
  </div>
);

export default DoctorDashboard;
