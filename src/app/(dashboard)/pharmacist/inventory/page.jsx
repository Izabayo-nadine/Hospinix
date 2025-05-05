import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';
import PharmacistService from '@/services/pharmacist.service';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [searchQuery, categoryFilter, stockFilter, expiryFilter, inventory]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await PharmacistService.getInventory();
      setInventory(data);
      setFilteredInventory(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError('Failed to load inventory. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterInventory = () => {
    let filtered = [...inventory];

    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.manufacturer.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== '') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter(item => item.quantityInStock <= item.reorderLevel);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(item => item.quantityInStock === 0);
    } else if (stockFilter === 'available') {
      filtered = filtered.filter(item => item.quantityInStock > 0);
    }

    // Expiry filter
    if (expiryFilter === 'expired') {
      const today = new Date();
      filtered = filtered.filter(item => new Date(item.expiryDate) < today);
    } else if (expiryFilter === 'expiringSoon') {
      const today = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(today.getMonth() + 3);
      filtered = filtered.filter(
        item => {
          const expiryDate = new Date(item.expiryDate);
          return expiryDate > today && expiryDate <= threeMonthsLater;
        }
      );
    }

    setFilteredInventory(filtered);
  };

  const handleAddItem = (newItem) => {
    setInventory([...inventory, newItem]);
    setShowAddModal(false);
  };

  const handleEditItem = (updatedItem) => {
    setInventory(
      inventory.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
    setShowEditModal(false);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      await PharmacistService.deleteInventoryItem(selectedItem.id);
      setInventory(inventory.filter((item) => item.id !== selectedItem.id));
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Failed to delete inventory item:', err);
      setError('Failed to delete inventory item. Please try again.');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStockFilter('');
    setExpiryFilter('');
  };

  // Get unique categories for filter dropdown
  const categories = [...new Set(inventory.map(item => item.category))];

  // For demo purposes, using hardcoded data initially
  // In production, remove this and use the actual API data
  useEffect(() => {
    if (inventory.length === 0 && !loading) {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setFullYear(today.getFullYear() + 2);
      
      const soonExpiryDate = new Date();
      soonExpiryDate.setMonth(today.getMonth() + 2);
      
      const expiredDate = new Date();
      expiredDate.setMonth(today.getMonth() - 1);
      
      const demoInventory = [
        {
          id: 1,
          name: 'Paracetamol 500mg',
          sku: 'MED-PARA-500',
          category: 'Pain Relief',
          description: 'Pain reliever and fever reducer',
          dosage: '500mg',
          form: 'Tablet',
          manufacturer: 'Johnson & Johnson',
          batchNumber: 'BN20231001',
          expiryDate: futureDate.toISOString().split('T')[0],
          quantityInStock: 350,
          reorderLevel: 50,
          unitPrice: 5.99,
          location: 'Shelf A-12',
          supplier: 'MedSupply Inc.',
          lastRestocked: '2023-09-15'
        },
        {
          id: 2,
          name: 'Amoxicillin 250mg',
          sku: 'MED-AMOX-250',
          category: 'Antibiotics',
          description: 'Antibiotic to treat bacterial infections',
          dosage: '250mg',
          form: 'Capsule',
          manufacturer: 'Pfizer',
          batchNumber: 'BN20230815',
          expiryDate: soonExpiryDate.toISOString().split('T')[0],
          quantityInStock: 45,
          reorderLevel: 50,
          unitPrice: 12.50,
          location: 'Shelf B-03',
          supplier: 'PharmaCorp',
          lastRestocked: '2023-08-01'
        },
        {
          id: 3,
          name: 'Lisinopril 10mg',
          sku: 'MED-LISI-10',
          category: 'Cardiovascular',
          description: 'Used to treat high blood pressure',
          dosage: '10mg',
          form: 'Tablet',
          manufacturer: 'Novartis',
          batchNumber: 'BN20230630',
          expiryDate: expiredDate.toISOString().split('T')[0],
          quantityInStock: 0,
          reorderLevel: 30,
          unitPrice: 8.75,
          location: 'Shelf C-08',
          supplier: 'MedSupply Inc.',
          lastRestocked: '2023-06-15'
        },
        {
          id: 4,
          name: 'Ibuprofen 400mg',
          sku: 'MED-IBUP-400',
          category: 'Pain Relief',
          description: 'Anti-inflammatory pain reliever',
          dosage: '400mg',
          form: 'Tablet',
          manufacturer: 'GSK',
          batchNumber: 'BN20231110',
          expiryDate: futureDate.toISOString().split('T')[0],
          quantityInStock: 200,
          reorderLevel: 40,
          unitPrice: 7.25,
          location: 'Shelf A-15',
          supplier: 'PharmaCorp',
          lastRestocked: '2023-10-10'
        },
        {
          id: 5,
          name: 'Cetirizine 10mg',
          sku: 'MED-CETI-10',
          category: 'Allergy & Sinus',
          description: 'Antihistamine for allergy relief',
          dosage: '10mg',
          form: 'Tablet',
          manufacturer: 'Bayer',
          batchNumber: 'BN20231005',
          expiryDate: futureDate.toISOString().split('T')[0],
          quantityInStock: 120,
          reorderLevel: 30,
          unitPrice: 9.99,
          location: 'Shelf D-22',
          supplier: 'MedSupply Inc.',
          lastRestocked: '2023-09-25'
        }
      ];
      setInventory(demoInventory);
      setFilteredInventory(demoInventory);
    }
  }, [inventory, loading]);

  const getStockStatusBadge = (item) => {
    if (item.quantityInStock === 0) {
      return <Badge color="red">Out of Stock</Badge>;
    } else if (item.quantityInStock <= item.reorderLevel) {
      return <Badge color="yellow">Low Stock</Badge>;
    } else {
      return <Badge color="green">In Stock</Badge>;
    }
  };

  const getExpiryStatusBadge = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);
    
    if (expiry < today) {
      return <Badge color="red">Expired</Badge>;
    } else if (expiry <= threeMonthsLater) {
      return <Badge color="yellow">Expiring Soon</Badge>;
    } else {
      return <Badge color="green">Valid</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Item
          </Button>
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
                  placeholder="Search inventory by name, SKU or manufacturer..."
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
                    Category
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Status
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="available">In Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Status
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={expiryFilter}
                    onChange={(e) => setExpiryFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="expired">Expired</option>
                    <option value="expiringSoon">Expiring Soon</option>
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

          {/* Inventory Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
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
                      Loading inventory...
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No items found. {searchQuery || categoryFilter || stockFilter || expiryFilter ? 'Try different filter settings.' : 'Add an item to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.category}</div>
                        <div className="text-sm text-gray-500">{item.manufacturer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantityInStock} units</div>
                        <div className="mt-1">{getStockStatusBadge(item)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(item.expiryDate).toLocaleDateString()}</div>
                        <div className="mt-1">{getExpiryStatusBadge(item.expiryDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowEditModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      <Dialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Inventory Item"
      >
        {/* Form would go here - for brevity, not implementing the entire form */}
        <div className="p-6">
          <p className="mb-4">
            The inventory add form would go here. It would include fields for all item properties.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Mock adding a new item
                const newItem = {
                  id: inventory.length + 1,
                  name: 'New Medication',
                  sku: `MED-NEW-${inventory.length + 1}`,
                  category: 'Pain Relief',
                  description: 'New medication description',
                  dosage: '100mg',
                  form: 'Tablet',
                  manufacturer: 'Generic Pharma',
                  batchNumber: `BN${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}`,
                  expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
                  quantityInStock: 100,
                  reorderLevel: 20,
                  unitPrice: 10.99,
                  location: 'Shelf E-10',
                  supplier: 'MedSupply Inc.',
                  lastRestocked: new Date().toISOString().split('T')[0],
                };
                handleAddItem(newItem);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Inventory Item"
      >
        {selectedItem && (
          <div className="p-6">
            <p className="mb-4">
              The inventory edit form would go here. It would be pre-filled with the selected item's data.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Mock updating an item
                  const updatedItem = {
                    ...selectedItem,
                    quantityInStock: selectedItem.quantityInStock + 50,
                    lastRestocked: new Date().toISOString().split('T')[0],
                  };
                  handleEditItem(updatedItem);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* View Item Modal */}
      <Dialog
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Inventory Item Details"
      >
        {selectedItem && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{selectedItem.name}</h2>
              <div className="flex flex-wrap gap-2">
                {getStockStatusBadge(selectedItem)}
                {getExpiryStatusBadge(selectedItem.expiryDate)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Basic Information</h3>
                <p className="mt-1 text-sm text-gray-900">SKU: {selectedItem.sku}</p>
                <p className="mt-1 text-sm text-gray-900">Category: {selectedItem.category}</p>
                <p className="mt-1 text-sm text-gray-900">Form: {selectedItem.form}</p>
                <p className="mt-1 text-sm text-gray-900">Dosage: {selectedItem.dosage}</p>
                <p className="mt-1 text-sm text-gray-900">Unit Price: ${selectedItem.unitPrice.toFixed(2)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Stock Information</h3>
                <p className="mt-1 text-sm text-gray-900">Quantity: {selectedItem.quantityInStock} units</p>
                <p className="mt-1 text-sm text-gray-900">Reorder Level: {selectedItem.reorderLevel} units</p>
                <p className="mt-1 text-sm text-gray-900">Location: {selectedItem.location}</p>
                <p className="mt-1 text-sm text-gray-900">Last Restocked: {new Date(selectedItem.lastRestocked).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Manufacturing Information</h3>
                <p className="mt-1 text-sm text-gray-900">Manufacturer: {selectedItem.manufacturer}</p>
                <p className="mt-1 text-sm text-gray-900">Batch Number: {selectedItem.batchNumber}</p>
                <p className="mt-1 text-sm text-gray-900">Expiry Date: {new Date(selectedItem.expiryDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Supplier Information</h3>
                <p className="mt-1 text-sm text-gray-900">Supplier: {selectedItem.supplier}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedItem.description}</p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Delete"
      >
        {selectedItem && (
          <div className="p-6">
            <p className="mb-4">
              Are you sure you want to delete <strong>{selectedItem.name}</strong> from inventory? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </DashboardLayout>
  );
} 