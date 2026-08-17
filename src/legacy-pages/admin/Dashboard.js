import { useState, useEffect } from "react";
import AdminService from "../../services/admin.service";
import UserForm from "../../components/forms/UserForm";
import PatientForm from "../../components/forms/PatientForm";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [modalProps, setModalProps] = useState({});

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await AdminService.getDashboardStats();
        setStats(response);
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
        setError(
          "Failed to load dashboard statistics. Please refresh the page."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
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
    // Refresh dashboard stats after successful form submission
    try {
      const response = await AdminService.getDashboardStats();
      setStats(response);
    } catch (err) {
      console.error("Failed to refresh dashboard statistics:", err);
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => openModal("addDoctor", { role: "DOCTOR" })}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
          >
            Add Doctor
          </button>
          <button
            onClick={() => openModal("addPharmacist", { role: "PHARMACIST" })}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
          >
            Add Pharmacist
          </button>
          <button
            onClick={() =>
              openModal("addReceptionist", { role: "RECEPTIONIST" })
            }
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
          >
            Add Receptionist
          </button>
          <button
            onClick={() => openModal("addPatient")}
            className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
          >
            Add Patient
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Dashboard Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Doctors"
            value={stats.totalDoctors}
            icon="👨‍⚕️"
            color="bg-blue-100"
          />
          <StatCard
            title="Pharmacists"
            value={stats.totalPharmacists}
            icon="💊"
            color="bg-green-100"
          />
          <StatCard
            title="Receptionists"
            value={stats.totalReceptionists}
            icon="👩‍💼"
            color="bg-purple-100"
          />
          <StatCard
            title="Patients"
            value={stats.totalPatients}
            icon="🧑‍🦽"
            color="bg-yellow-100"
          />
          <StatCard
            title="Appointments"
            value={stats.totalAppointments}
            icon="📅"
            color="bg-red-100"
          />
          <StatCard
            title="Medicines"
            value={stats.totalMedicines}
            icon="💉"
            color="bg-indigo-100"
          />
          <StatCard
            title="Companies"
            value={stats.totalCompanies || 0}
            icon="🏢"
            color="bg-pink-100"
          />
          <StatCard
            title="Prescriptions"
            value={stats.totalPrescriptions}
            icon="📝"
            color="bg-orange-100"
          />
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500">
            Activity logs will be displayed here...
          </p>
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-1">
              {/* Add Doctor Modal */}
              {activeModal === "addDoctor" && (
                <UserForm
                  onSuccess={handleFormSuccess}
                  onCancel={closeModal}
                  {...modalProps}
                />
              )}

              {/* Add Pharmacist Modal */}
              {activeModal === "addPharmacist" && (
                <UserForm
                  onSuccess={handleFormSuccess}
                  onCancel={closeModal}
                  {...modalProps}
                />
              )}

              {/* Add Receptionist Modal */}
              {activeModal === "addReceptionist" && (
                <UserForm
                  onSuccess={handleFormSuccess}
                  onCancel={closeModal}
                  {...modalProps}
                />
              )}

              {/* Add Patient Modal */}
              {activeModal === "addPatient" && (
                <PatientForm
                  onSuccess={handleFormSuccess}
                  onCancel={closeModal}
                />
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

export default AdminDashboard;
