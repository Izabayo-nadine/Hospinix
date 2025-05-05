"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PharmacistService from "@/services/pharmacist.service";

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [distributors, setDistributors] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    distributorId: "",
    orderItems: [{ medicineId: "", quantity: "", unitPrice: "" }],
    expectedDeliveryDate: "",
    notes: "",
  });

  // Fetch distributors and medicines for dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch distributors from the API
        const distribData = await PharmacistService.getDistributors();
        const medsData = await PharmacistService.getMedicines();

        setDistributors(distribData || []);
        setMedicines(medsData || []);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load required data. Please refresh the page.");

        // Fallback medicine data
        setMedicines([
          { id: 1, medicineId: "MED-001", name: "Amoxicillin 500mg", price: 12.99 },
          { id: 2, medicineId: "MED-002", name: "Lisinopril 10mg", price: 15.49 },
          { id: 3, medicineId: "MED-003", name: "Metformin 850mg", price: 8.99 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDistributorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, distributorId: e.target.value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, expectedDeliveryDate: e.target.value });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, notes: e.target.value });
  };

  const handleOrderItemChange = (index: number, field: string, value: string) => {
    const newOrderItems = [...formData.orderItems];

    // If changing medicine, update the price if available
    if (field === "medicineId") {
      const selectedMedicine = medicines.find(
        (med: any) => (med.medicineId || med.id) === value
      );
      if (selectedMedicine && selectedMedicine.price) {
        newOrderItems[index] = {
          ...newOrderItems[index],
          medicineId: value,
          unitPrice: selectedMedicine.price.toString(),
        };
      } else {
        newOrderItems[index] = {
          ...newOrderItems[index],
          [field]: value,
        };
      }
    } else {
      newOrderItems[index] = {
        ...newOrderItems[index],
        [field]: value,
      };
    }

    setFormData({ ...formData, orderItems: newOrderItems });
  };

  const addOrderItem = () => {
    setFormData({
      ...formData,
      orderItems: [
        ...formData.orderItems,
        { medicineId: "", quantity: "", unitPrice: "" },
      ],
    });
  };

  const removeOrderItem = (index: number) => {
    const newOrderItems = [...formData.orderItems];
    newOrderItems.splice(index, 1);
    setFormData({ ...formData, orderItems: newOrderItems });
  };

  const calculateTotal = () => {
    return formData.orderItems
      .reduce((total: number, item: any) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return total + quantity * unitPrice;
      }, 0)
      .toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form
      if (!formData.distributorId) {
        throw new Error("Please select a distributor");
      }

      if (formData.orderItems.some((item: any) => !item.medicineId || !item.quantity)) {
        throw new Error("Please fill in all medicine and quantity fields");
      }

      // Format data
      const orderData = {
        ...formData,
        orderItems: formData.orderItems.map((item: any) => ({
          ...item,
          quantity: parseInt(item.quantity, 10),
          unitPrice: parseFloat(item.unitPrice),
        })),
        totalAmount: parseFloat(calculateTotal()),
      };

      // Submit the order to the API
      await PharmacistService.placeOrder(orderData);

      // Show success message
      alert("Order placed successfully!");

      // Redirect back to dashboard
      router.push("/pharmacist");
    } catch (err: any) {
      console.error("Failed to place order:", err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <DashboardLayout userType="pharmacist" title="Place New Order">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-6">Place New Order</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distributor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distributor*
              </label>
              <select
                value={formData.distributorId}
                onChange={handleDistributorChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Distributor</option>
                {distributors.map((distributor) => (
                  <option
                    key={distributor.id || distributor.distributorId}
                    value={distributor.distributorId || distributor.id}
                  >
                    {distributor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Expected Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={handleDateChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                min={new Date().toISOString().split('T')[0]} // Set min date to today
              />
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Order Items*</h2>
              <button
                type="button"
                onClick={addOrderItem}
                className="text-indigo-600 hover:text-indigo-900 text-sm"
              >
                + Add Item
              </button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.orderItems.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <select
                          value={item.medicineId}
                          onChange={(e) => handleOrderItemChange(index, "medicineId", e.target.value)}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select Medicine</option>
                          {medicines.map((medicine: any) => (
                            <option
                              key={medicine.id || medicine.medicineId}
                              value={medicine.medicineId || medicine.id}
                            >
                              {medicine.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleOrderItemChange(index, "quantity", e.target.value)}
                          required
                          min="1"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Quantity"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleOrderItemChange(index, "unitPrice", e.target.value)}
                          required
                          min="0.01"
                          step="0.01"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Unit Price"
                        />
                      </td>
                      <td className="px-4 py-2">
                        ${((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        {formData.orderItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOrderItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Total Row */}
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-4 py-2 text-right font-medium">
                      Total:
                    </td>
                    <td className="px-4 py-2 font-medium">
                      ${calculateTotal()}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={handleNotesChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Any special instructions for this order..."
            ></textarea>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
} 