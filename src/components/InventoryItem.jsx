import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useCart } from '../context/CartContext';
import '../styles/dashboard.css';

const InventoryItem = React.memo(({ item, onEdit, onDelete, userRole = 'user' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(item);
  const { updateItem } = useInventory();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  // Only managers can edit items, but staff can also edit
  const canEditItem = userRole === 'manager' || userRole === 'staff';
  const isUser = userRole === 'user';

  const getStatusClass = (status) => {
    return {
      'in-stock': 'status-in-stock',
      'low-stock': 'status-low-stock',
      'out-of-stock': 'status-out-of-stock',
    }[status] || '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateItem(item.id, formData);
      setIsEditing(false);
      onEdit?.(formData);
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData(item);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      onDelete?.(item.id);
    }
  };

  const handleAddToCart = () => {
    try {
      if (!item.quantity || item.quantity <= 0) {
        alert(`${item.name} is out of stock`);
        return;
      }
      addToCart(item, 1);
      alert(`${item.name} added to cart!`);
    } catch (error) {
      alert(error.message || 'Failed to add item to cart');
    }
  };

  const handleAddQuantity = async () => {
    const newQuantity = formData.quantity + 1;
    try {
      await updateItem(item.id, { quantity: newQuantity });
      setFormData((prev) => ({
        ...prev,
        quantity: newQuantity,
      }));
    } catch (error) {
      console.error('Failed to add quantity:', error);
      alert('Failed to add quantity. Please try again.');
    }
  };

  if (isEditing) {
    return (
      <div className="inventory-item inventory-item-edit">
        <div className="item-edit-form">
          <div className="form-group">
            <label htmlFor={`name-${item.id}`}>Name</label>
            <input
              id={`name-${item.id}`}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              aria-label="Item name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`quantity-${item.id}`}>Quantity</label>
              <input
                id={`quantity-${item.id}`}
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                aria-label="Item quantity"
              />
            </div>

            <div className="form-group">
              <label htmlFor={`price-${item.id}`}>Price ($)</label>
              <input
                id={`price-${item.id}`}
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                aria-label="Item price"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor={`category-${item.id}`}>Category</label>
            <input
              id={`category-${item.id}`}
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              aria-label="Item category"
            />
          </div>

          <div className="form-group">
            <label htmlFor={`thumbnail-${item.id}`}>Image URL</label>
            <input
              id={`thumbnail-${item.id}`}
              type="text"
              name="thumbnail"
              value={formData.thumbnail || ''}
              onChange={handleInputChange}
              aria-label="Item image URL"
            />
          </div>

          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              aria-label="Save changes"
            >
              Save
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCancel}
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-item" role="article">
      <div className="item-image-container">
        {item.thumbnail ? (
          <img 
            src={item.thumbnail} 
            alt={item.name}
            className="item-image"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="item-image-placeholder">
            <span>📦</span>
          </div>
        )}
      </div>
      <div className="item-header">
        <div className="item-info">
          <h3>{item.name}</h3>
          <p className="sku">SKU: {item.sku}</p>
          {item.category && <p className="category">Category: {item.category}</p>}
        </div>
        <div className={`status-badge ${getStatusClass(item.status)}`}>
          <span aria-label={`Status: ${item.status}`}>{item.status}</span>
        </div>
      </div>

      <div className="item-details">
        <div className="detail-row">
          <span className="label">Quantity:</span>
          <span className="value" aria-label={`Quantity: ${item.quantity} ${item.unit}`}>
            {item.quantity} {item.unit}
          </span>
        </div>

        <div className="detail-row">
          <span className="label">Price:</span>
          <span className="value" aria-label={`Price: ₹${item.price}`}>
            ₹{item.price.toFixed(2)}
          </span>
        </div>

        <div className="detail-row">
          <span className="label">Category:</span>
          <span className="value">{item.category}</span>
        </div>

        <div className="detail-row">
          <span className="label">Total Value:</span>
          <span className="value" aria-label={`Total value: ₹${(item.quantity * item.price).toFixed(2)}`}>
            ₹{(item.quantity * item.price).toFixed(2)}
          </span>
        </div>

        <div className="detail-row">
          <span className="label">Reorder Level:</span>
          <span className="value">{item.reorderLevel}</span>
        </div>
      </div>

      <div className="item-actions">
        {isUser && (
          <button
            className="btn btn-success"
            onClick={handleAddToCart}
            disabled={!item.quantity || item.quantity <= 0}
            aria-label={`Add ${item.name} to cart`}
          >
            {!item.quantity || item.quantity <= 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
          </button>
        )}
        {userRole === 'guest' && (
          <button
            className="btn btn-primary"
            onClick={handleLoginRedirect}
            aria-label={`Login to buy ${item.name}`}
          >
            Login to Buy
          </button>
        )}
        {userRole === 'staff' && (
          <button
            className="btn btn-primary"
            onClick={handleAddQuantity}
            aria-label={`Add quantity of ${item.name}`}
          >
            + Add Quantity
          </button>
        )}
        {canEditItem && (
          <button
            className="btn btn-edit"
            onClick={() => setIsEditing(true)}
            aria-label={`Edit ${item.name}`}
          >
            Edit
          </button>
        )}
        {(userRole === 'manager' || userRole === 'staff') && (
          <button
            className="btn btn-delete"
            onClick={handleDelete}
            aria-label={`Delete ${item.name}`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
});

InventoryItem.displayName = 'InventoryItem';

export default InventoryItem;
