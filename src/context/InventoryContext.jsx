import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchInventoryItems, updateInventoryItem } from '../services/api';

// Create the context
const InventoryContext = createContext();

// Custom hook to use the inventory context
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
};

// Provider component
export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch inventory items on mount
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInventoryItems();
      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (id, updates) => {
    setError(null);
    try {
      const updatedItem = await updateInventoryItem(id, updates);
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? updatedItem : item))
      );
      return updatedItem;
    } catch (err) {
      setError(err.message || 'Failed to update item');
      throw err;
    }
  }, []);

  const addItem = useCallback((newItem) => {
    const id = Math.max(0, ...items.map((i) => i.id)) + 1;
    const item = {
      ...newItem,
      id,
    };
    setItems((prevItems) => [...prevItems, item]);
    return item;
  }, [items]);

  const deleteItem = useCallback((id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const decreaseQuantity = useCallback((id, quantity) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity - quantity);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  }, []);

  const value = {
    items,
    loading,
    error,
    loadInventory,
    updateItem,
    addItem,
    deleteItem,
    decreaseQuantity,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};
