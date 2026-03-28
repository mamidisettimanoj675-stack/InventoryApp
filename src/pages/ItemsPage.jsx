import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_NAMES } from '../constants/categories';
import InventoryItem from '../components/InventoryItem';
import '../styles/dashboard.css';

const ItemsPage = ({ searchTerm: sharedSearchTerm, setSearchTerm: sharedSetSearchTerm }) => {
  const { items, loading, error, deleteItem, addItem } = useInventory();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const searchTerm = sharedSearchTerm ?? localSearchTerm;
  const setSearchTerm = sharedSetSearchTerm || setLocalSearchTerm;
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    quantity: 0,
    unit: 'pieces',
    price: 0,
    category: CATEGORY_NAMES[0],
    reorderLevel: 5,
    status: 'in-stock',
    thumbnail: '',
  });

  // Use fixed category names only
  const categories = ['all', ...CATEGORY_NAMES];

  const filteredItems = items.filter((item) => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' || name === 'reorderLevel'
        ? parseFloat(value)
        : value,
    }));
  };

  const handleAddItem = () => {
    if (!newItem.name.trim() || !newItem.sku.trim()) {
      alert('Please fill in required fields (name and SKU)');
      return;
    }
    addItem({
      ...newItem,
      status: newItem.quantity === 0 ? 'out-of-stock' : 'in-stock',
    });
    setNewItem({
      name: '',
      sku: '',
      quantity: 0,
      unit: 'pieces',
      price: 0,
      category: '',
      reorderLevel: 5,
      status: 'in-stock',
    });
    setShowForm(false);
  };

  if (error) {
    return (
      <div className="page-container" role="alert">
        <h1>Inventory Items</h1>
        <div className="error-message">
          <p>Error loading inventory: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container items-page">
      <header className="page-header">
        <h1>Inventory Items</h1>
        <p className="page-subtitle">Manage and edit your inventory items</p>
      </header>

      <div className="page-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search inventory items"
          />
        </div>

        <div className="filter-section">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
            aria-label="Filter items by status"
          >
            <option value="all">All Items</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
            aria-label="Filter items by category"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          aria-label="Add new inventory item"
        >
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <div className="add-item-form">
          <h3>Add New Item</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="new-name">Name *</label>
              <input
                id="new-name"
                type="text"
                name="name"
                placeholder="Item name"
                value={newItem.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-sku">SKU *</label>
              <input
                id="new-sku"
                type="text"
                name="sku"
                placeholder="SKU"
                value={newItem.sku}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-quantity">Quantity</label>
              <input
                id="new-quantity"
                type="number"
                name="quantity"
                value={newItem.quantity}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-price">Price ($)</label>
              <input
                id="new-price"
                type="number"
                step="0.01"
                name="price"
                value={newItem.price}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-category">Category</label>
              <select
                id="new-category"
                name="category"
                value={newItem.category}
                onChange={handleInputChange}
              >
                {CATEGORY_NAMES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="new-thumbnail">Image URL</label>
              <input
                id="new-thumbnail"
                type="text"
                name="thumbnail"
                placeholder="Image URL"
                value={newItem.thumbnail}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-reorder">Reorder Level</label>
              <input
                id="new-reorder"
                type="number"
                name="reorderLevel"
                value={newItem.reorderLevel}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleAddItem}>
              Add Item
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner" role="status" aria-label="Loading items">
          <div className="spinner"></div>
          <p>Loading items...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="items-grid">
          {filteredItems.map((item) => (
            <InventoryItem
              key={item.id}
              item={item}
              onEdit={() => {}}
              onDelete={deleteItem}
              userRole={user.role}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state" role="status">
          <p>No items found. {searchTerm && 'Try adjusting your search.'}</p>
        </div>
      )}
    </div>
  );
};

export default ItemsPage;
