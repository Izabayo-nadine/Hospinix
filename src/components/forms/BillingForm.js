import { useState, useEffect } from "react";
import DataService from "../../services/data.service";
import ReceptionistService from "../../services/receptionist.service";

const BillingForm = ({ invoice = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    patientId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "PENDING",
    totalAmount: 0,
    paidAmount: 0,
    paymentMethod: "CASH",
    notes: "",
    items: [],
  });

  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([
    { id: "CONS-GEN", name: "General Consultation", price: 50 },
    { id: "CONS-SPEC", name: "Specialist Consultation", price: 100 },
    { id: "LAB-BLOOD", name: "Blood Test", price: 45 },
    { id: "LAB-URINE", name: "Urine Analysis", price: 30 },
    { id: "XRAY", name: "X-Ray", price: 120 },
    { id: "SCAN-ULT", name: "Ultrasound", price: 150 },
    { id: "SCAN-CT", name: "CT Scan", price: 300 },
    { id: "SCAN-MRI", name: "MRI", price: 450 },
    { id: "PROC-MIN", name: "Minor Procedure", price: 200 },
    { id: "PROC-MAJ", name: "Major Procedure", price: 500 },
    { id: "MED-DISP", name: "Medication Dispensing", price: 25 },
    { id: "ROOM-STD", name: "Standard Room (per day)", price: 150 },
    { id: "ROOM-PVT", name: "Private Room (per day)", price: 300 },
  ]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for new item being added
  const [newItem, setNewItem] = useState({
    serviceId: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients
        const patientsData = await DataService.getAllPatients();
        setPatients(patientsData);

        // If invoice data is provided, populate the form for editing
        if (invoice) {
          setIsEdit(true);
          setFormData({
            patientId: invoice.patientId || "",
            invoiceDate: invoice.invoiceDate
              ? new Date(invoice.invoiceDate).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            dueDate: invoice.dueDate
              ? new Date(invoice.dueDate).toISOString().split("T")[0]
              : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
            status: invoice.status || "PENDING",
            totalAmount: invoice.totalAmount || 0,
            paidAmount: invoice.paidAmount || 0,
            paymentMethod: invoice.paymentMethod || "CASH",
            notes: invoice.notes || "",
            items: invoice.items || [],
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
  }, [invoice]);

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

  const handleItemChange = (e) => {
    const { name, value } = e.target;

    if (name === "serviceId") {
      const selectedService = services.find((service) => service.id === value);
      if (selectedService) {
        setNewItem((prev) => ({
          ...prev,
          serviceId: value,
          description: selectedService.name,
          unitPrice: selectedService.price,
        }));
      } else {
        setNewItem((prev) => ({
          ...prev,
          serviceId: value,
        }));
      }
    } else {
      setNewItem((prev) => ({
        ...prev,
        [name]:
          name === "quantity" || name === "unitPrice" || name === "discount"
            ? parseFloat(value) || 0
            : value,
      }));
    }

    // Clear error for this field when user makes changes
    if (errors[`item_${name}`]) {
      setErrors((prev) => ({
        ...prev,
        [`item_${name}`]: "",
      }));
    }
  };

  const addItem = () => {
    // Validate item
    const itemErrors = {};

    if (!newItem.serviceId) itemErrors.item_serviceId = "Service is required";
    if (!newItem.description.trim())
      itemErrors.item_description = "Description is required";
    if (newItem.quantity <= 0)
      itemErrors.item_quantity = "Quantity must be greater than 0";
    if (newItem.unitPrice <= 0)
      itemErrors.item_unitPrice = "Unit price must be greater than 0";
    if (newItem.discount < 0)
      itemErrors.item_discount = "Discount cannot be negative";

    if (Object.keys(itemErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        ...itemErrors,
      }));
      return;
    }

    // Calculate item total
    const itemTotal =
      newItem.quantity * newItem.unitPrice * (1 - newItem.discount / 100);

    // Add to items list
    const newItemWithTotal = {
      ...newItem,
      total: parseFloat(itemTotal.toFixed(2)),
    };

    setFormData((prev) => {
      const updatedItems = [...prev.items, newItemWithTotal];
      const totalAmount = updatedItems.reduce(
        (sum, item) => sum + item.total,
        0
      );

      return {
        ...prev,
        items: updatedItems,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
      };
    });

    // Reset new item form
    setNewItem({
      serviceId: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
    });
  };

  const removeItem = (index) => {
    setFormData((prev) => {
      const updatedItems = prev.items.filter((_, i) => i !== index);
      const totalAmount = updatedItems.reduce(
        (sum, item) => sum + item.total,
        0
      );

      return {
        ...prev,
        items: updatedItems,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
      };
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.patientId) newErrors.patientId = "Patient is required";
    if (!formData.invoiceDate)
      newErrors.invoiceDate = "Invoice date is required";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";
    if (formData.items.length === 0)
      newErrors.items = "At least one item is required";
    if (formData.paidAmount > formData.totalAmount) {
      newErrors.paidAmount = "Paid amount cannot exceed total amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Update payment status based on paid amount
      let status = formData.status;
      if (formData.paidAmount >= formData.totalAmount) {
        status = "PAID";
      } else if (formData.paidAmount > 0) {
        status = "PARTIAL";
      } else {
        status = "PENDING";
      }

      const invoiceData = {
        ...formData,
        status,
      };

      // Make API call based on whether we're adding or updating
      let response;
      if (isEdit) {
        response = await ReceptionistService.updateInvoice(
          invoice.invoiceId,
          invoiceData
        );
      } else {
        response = await ReceptionistService.createInvoice(invoiceData);
      }

      // Call the success callback with the response data
      onSuccess(response);
    } catch (err) {
      console.error("Error saving invoice:", err);

      // Handle specific error messages from the API
      if (err.response && err.response.data && err.response.data.message) {
        setErrors((prev) => ({
          ...prev,
          form: err.response.data.message,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: "An error occurred while saving the invoice. Please try again.",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  const balance = formData.totalAmount - formData.paidAmount;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Invoice" : "Create New Invoice"}
      </h2>

      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Patient Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Patient *
            </label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              disabled={isEdit}
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Invoice #
            </label>
            <input
              type="text"
              value={invoice ? invoice.invoiceNumber : "Auto-generated"}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 px-4 py-2.5 text-gray-900"
            />
          </div>

          {/* Dates */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Invoice Date *
            </label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                errors.invoiceDate ? "border-red-500" : ""
              }`}
            />
            {errors.invoiceDate && (
              <p className="mt-1 text-xs text-red-500">{errors.invoiceDate}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Due Date *
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                errors.dueDate ? "border-red-500" : ""
              }`}
            />
            {errors.dueDate && (
              <p className="mt-1 text-xs text-red-500">{errors.dueDate}</p>
            )}
          </div>

          {/* Payment Details */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
            >
              <option value="CASH">Cash</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="INSURANCE">Insurance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Payment Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
            >
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Paid Amount
            </label>
            <input
              type="number"
              name="paidAmount"
              value={formData.paidAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                errors.paidAmount ? "border-red-500" : ""
              }`}
            />
            {errors.paidAmount && (
              <p className="mt-1 text-xs text-red-500">{errors.paidAmount}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Total Amount
            </label>
            <input
              type="number"
              value={formData.totalAmount}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 px-4 py-2.5 text-gray-900"
            />
          </div>

          {/* Notes */}
          <div className="mb-4 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900"
              placeholder="Additional information or payment instructions"
            ></textarea>
          </div>
        </div>

        {/* Bill Items Section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bill Items</h3>

          {errors.items && (
            <p className="mb-2 text-xs text-red-500">{errors.items}</p>
          )}

          {/* List of added items */}
          {formData.items.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Unit Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Discount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.discount}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        ${item.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
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

          {/* Add new item form */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-800 mb-3">Add Item</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Service
                </label>
                <select
                  name="serviceId"
                  value={newItem.serviceId}
                  onChange={handleItemChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                    errors.item_serviceId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ${service.price.toFixed(2)}
                    </option>
                  ))}
                </select>
                {errors.item_serviceId && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.item_serviceId}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={newItem.description}
                  onChange={handleItemChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                    errors.item_description ? "border-red-500" : ""
                  }`}
                  placeholder="Service description"
                />
                {errors.item_description && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.item_description}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={newItem.quantity}
                  onChange={handleItemChange}
                  min="1"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                    errors.item_quantity ? "border-red-500" : ""
                  }`}
                />
                {errors.item_quantity && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.item_quantity}
                  </p>
                )}
              </div>

              {/* Unit Price */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Unit Price ($)
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  value={newItem.unitPrice}
                  onChange={handleItemChange}
                  min="0"
                  step="0.01"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                    errors.item_unitPrice ? "border-red-500" : ""
                  }`}
                />
                {errors.item_unitPrice && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.item_unitPrice}
                  </p>
                )}
              </div>

              {/* Discount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={newItem.discount}
                  onChange={handleItemChange}
                  min="0"
                  max="100"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5 text-gray-900 ${
                    errors.item_discount ? "border-red-500" : ""
                  }`}
                />
                {errors.item_discount && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.item_discount}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-2">
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Item
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
              ? "Update Invoice"
              : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingForm;
