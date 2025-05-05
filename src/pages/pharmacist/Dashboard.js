import { useState, useEffect } from "react";
import PharmacistService from "../../services/pharmacist.service";
import MedicineForm from "../../components/forms/MedicineForm";
import CompanyForm from "../../components/forms/CompanyForm";
import DistributorForm from "../../components/forms/DistributorForm";

const PharmacistDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  const [modalProps, setModalProps] = useState({});
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all required data in parallel
        const [dashboardStats, prescriptions, medicines] = await Promise.all([
          PharmacistService.getDashboardStats(),
          PharmacistService.getPendingPrescriptions(),
          PharmacistService.getLowStockMedicines(),
        ]);

        setStats(dashboardStats);
        setPendingPrescriptions(prescriptions.slice(0, 5)); // Show only first 5 prescriptions
        setLowStockMedicines(medicines.slice(0, 5)); // Show only first 5 low stock medicines
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
      const [dashboardStats, prescriptions, medicines] = await Promise.all([
        PharmacistService.getDashboardStats(),
        PharmacistService.getPendingPrescriptions(),
        PharmacistService.getLowStockMedicines(),
      ]);

      setStats(dashboardStats);
      setPendingPrescriptions(prescriptions.slice(0, 5));
      setLowStockMedicines(medicines.slice(0, 5));
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
    totalMedicines: stats.totalMedicines || 0,
    totalCompanies: stats.totalCompanies || 0,
    lowStockItems: stats.lowStockItems || 0,
    pendingPrescriptions: stats.pendingPrescriptions || 0,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Pharmacist Dashboard</h1>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => openModal("addMedicine")}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
          >
            Add Medicine
          </button>
          <button
            onClick={() => openModal("addCompany")}
            className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
          >
            Add Company
          </button>
          <button
            onClick={() => openModal("addDistributor")}
            className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow"
          >
            Add Distributor
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Dashboard Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Medicines"
            value={mockStats.totalMedicines}
            icon="💊"
            color="bg-blue-100"
          />
          <StatCard
            title="Total Companies"
            value={mockStats.totalCompanies}
            icon="🏢"
            color="bg-green-100"
          />
          <StatCard
            title="Low Stock Items"
            value={mockStats.lowStockItems}
            icon="⚠️"
            color="bg-yellow-100"
          />
          <StatCard
            title="Pending Prescriptions"
            value={mockStats.pendingPrescriptions}
            icon="📋"
            color="bg-purple-100"
          />
        </div>
      </div>

      {/* Pending Prescriptions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Pending Prescriptions</h2>
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {pendingPrescriptions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                        {prescription.doctorName || "Dr. Johnson"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {prescription.date || "2023-06-10"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Fill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No pending prescriptions
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Medicines */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Low Stock Medicines</h2>
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {lowStockMedicines.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockMedicines.map((medicine, index) => (
                  <tr key={medicine.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {medicine.name || "Amoxicillin 500mg"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-500 font-bold">
                        {medicine.stock || "5 boxes"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {medicine.company || "Pharma Inc."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Order
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No low stock medicines
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="p-1">
              {/* Add Medicine Modal */}
              {activeModal === "addMedicine" && (
                <MedicineForm
                  onSuccess={handleFormSuccess}
                  onCancel={closeModal}
                  {...modalProps}
                />
              )}

              {/* Add Company Modal */}
              {activeModal === "addCompany" && (
                <CompanyForm
                  onSuccess={handleFormSuccess}
                  onCancel={closeModal}
                  {...modalProps}
                />
              )}

              {/* Add Distributor Modal */}
              {activeModal === "addDistributor" && (
                <DistributorForm
                  onSuccess={handleFormSuccess}
                  onCancel={closeModal}
                  {...modalProps}
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

export default PharmacistDashboard;
