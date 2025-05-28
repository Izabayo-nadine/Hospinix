import { useState, useEffect } from "react";
import DoctorService from "../../services/doctor.service";
import DataService from "../../services/data.service";

const PrescriptionForm = ({ prescription = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    patientId: "",
    diagnosis: "",
    notes: "",
    status: "ACTIVE",
    medications: [],
  });

  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for new medication being added
  const [newMedication, setNewMedication] = useState({
    medicineId: "",
    dosage: "",
    frequency: "",
    duration: 7,
    instructions: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients and medicines in parallel
        const [patientsData, medicinesData] = await Promise.all([
          DataService.getAllPatients(),
          DataService.getAllMedicines(),
        ]);

        setPatients(patientsData);
        setMedicines(medicinesData);

        // If prescription data is provided, populate the form for editing
        if (prescription) {
          setIsEdit(true);
          setFormData({
            patientId: prescription.patientId || "",
            diagnosis: prescription.diagnosis || "",
            notes: prescription.notes || "",
            status: prescription.status || "ACTIVE",
            medications: prescription.medications || [],
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setErrors((prev) => ({
          ...prev,
          form: "Failed to load data. Please refresh the page and try again.",
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [prescription]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user makes changes
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleMedicationChange = (e) => {
    const { name, value } = e.target;
    setNewMedication((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user makes changes
    if (errors[`medication_${name}`]) {
      setErrors((prev) => ({
        ...prev,
        [`medication_${name}`]: "",
      }));
    }
  };

  const addMedication = () => {
    // Validate medication
    const medicationErrors = {};

    if (!newMedication.medicineId)
      medicationErrors.medication_medicineId = "Medicine is required";
    if (!newMedication.dosage.trim())
      medicationErrors.medication_dosage = "Dosage is required";
    if (!newMedication.frequency.trim())
      medicationErrors.medication_frequency = "Frequency is required";

    if (Object.keys(medicationErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        ...medicationErrors,
      }));
      return;
    }

    // Find the medicine details
    const selectedMedicine = medicines.find(
      (med) => med.medicineId === newMedication.medicineId
    );

    // Add to medications list
    setFormData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          ...newMedication,
          medicineName: selectedMedicine?.name || "Unknown Medicine",
        },
      ],
    }));

    // Reset new medication form
    setNewMedication({
      medicineId: "",
      dosage: "",
      frequency: "",
      duration: 7,
      instructions: "",
    });
  };

  const removeMedication = (index) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.patientId) newErrors.patientId = "Patient is required";
    if (!formData.diagnosis.trim())
      newErrors.diagnosis = "Diagnosis is required";
    if (formData.medications.length === 0)
      newErrors.medications = "At least one medication is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Make API call based on whether we're adding or updating
      let response;
      if (isEdit) {
        response = await DoctorService.updatePrescription(
          prescription.prescriptionId,
          formData
        );
      } else {
        response = await DoctorService.createPrescription(formData);
      }

      // Call the success callback with the response data
      onSuccess(response);
    } catch (err) {
      console.error("Error saving prescription:", err);

      // Handle specific error messages from the API
      if (err.response && err.response.data && err.response.data.message) {
        setErrors((prev) => ({
          ...prev,
          form: err.response.data.message,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: "An error occurred while saving the prescription. Please try again.",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Prescription" : "Create New Prescription"}
      </h2>

      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient Selection */}
          <div className="mb-4 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Patient
            </label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              disabled={isEdit} // Cannot change patient in edit mode
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                errors.patientId ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.patientId} value={patient.patientId}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className="mt-1 text-xs text-red-500">{errors.patientId}</p>
            )}
          </div>

          {/* Diagnosis */}
          <div className="mb-4 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Diagnosis
            </label>
            <input
              type="text"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                errors.diagnosis ? "border-red-500" : ""
              }`}
              placeholder="Enter diagnosis"
            />
            {errors.diagnosis && (
              <p className="mt-1 text-xs text-red-500">{errors.diagnosis}</p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-4 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
              placeholder="Any additional instructions or notes"
            ></textarea>
          </div>

          {/* Status (for editing) */}
          {isEdit && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
              >
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        {/* Medications Section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Medications
          </h3>

          {errors.medications && (
            <p className="mb-2 text-xs text-red-500">{errors.medications}</p>
          )}

          {/* List of added medications */}
          {formData.medications.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Medicine
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Dosage
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Frequency
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Duration
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Instructions
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.medications.map((medication, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {medication.medicineName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {medication.dosage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {medication.frequency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {medication.duration} days
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {medication.instructions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add new medication form */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-800 mb-3">
              Add Medication
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Medicine Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Medicine
                </label>
                <select
                  name="medicineId"
                  value={newMedication.medicineId}
                  onChange={handleMedicationChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                    errors.medication_medicineId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Medicine</option>
                  {medicines.map((medicine) => (
                    <option
                      key={medicine.medicineId}
                      value={medicine.medicineId}
                    >
                      {medicine.name}
                    </option>
                  ))}
                </select>
                {errors.medication_medicineId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.medication_medicineId}
                  </p>
                )}
              </div>

              {/* Dosage */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Dosage
                </label>
                <input
                  type="text"
                  name="dosage"
                  value={newMedication.dosage}
                  onChange={handleMedicationChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                    errors.medication_dosage ? "border-red-500" : ""
                  }`}
                  placeholder="e.g., 1 tablet, 5ml"
                />
                {errors.medication_dosage && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.medication_dosage}
                  </p>
                )}
              </div>

              {/* Frequency */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Frequency
                </label>
                <input
                  type="text"
                  name="frequency"
                  value={newMedication.frequency}
                  onChange={handleMedicationChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                    errors.medication_frequency ? "border-red-500" : ""
                  }`}
                  placeholder="e.g., Twice daily, Every 8 hours"
                />
                {errors.medication_frequency && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.medication_frequency}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Duration (days)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={newMedication.duration}
                  onChange={handleMedicationChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                />
              </div>

              {/* Instructions */}
              <div className="mb-4 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Instructions
                </label>
                <input
                  type="text"
                  name="instructions"
                  value={newMedication.instructions}
                  onChange={handleMedicationChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
                  placeholder="e.g., Take with food, Avoid alcohol"
                />
              </div>
            </div>

            <div className="mt-2">
              <button
                type="button"
                onClick={addMedication}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add to Prescription
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Prescription"
              : "Create Prescription"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;
