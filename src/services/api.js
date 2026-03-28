import axios from 'axios';
import { CATEGORY_NAMES } from '../constants/categories';

// Cache for inventory data
let cachedInventoryData = []; 
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Create axios instance
const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Transform dummyjson product to inventory item format
const normalizeCategory = (category) => {
  if (!category || typeof category !== 'string') {
    return null;
  }
  const normalized = category.trim().toLowerCase();
  return CATEGORY_NAMES.find((name) => name.toLowerCase() === normalized) || null;
};

const transformProduct = (product) => {
  const reorderLevel = Math.max(5, Math.ceil(product.stock * 0.1)); // Reorder when stock is 10% or below
  const quantity = product.stock || 0;
  let status = 'in-stock';
  
  if (quantity === 0) {
    status = 'out-of-stock';
  } else if (quantity < reorderLevel) {
    status = 'low-stock';
  }

  // Convert price from USD to INR (1 USD ≈ 83.5 INR)
  const priceInRupees = parseFloat((product.price * 83.5).toFixed(2));

  return {
    id: product.id,
    name: product.title,
    sku: `SKU-${product.id}`,
    quantity,
    unit: 'pieces',
    price: priceInRupees,
    category: normalizeCategory(product.category),
    status,
    reorderLevel,
    lastUpdated: new Date().toISOString(),
    description: product.description,
    rating: product.rating,
    thumbnail: product.thumbnail,
  };
};

// Fetch all inventory items from dummyjson
export const fetchInventoryItems = async () => {
  try {
    const now = Date.now();
    
    // Use cache if available and not expired
    if (cachedInventoryData.length > 0 && now - lastFetchTime < CACHE_DURATION) {
      return cachedInventoryData;
    }

    const response = await api.get('/products?limit=192');
    
    if (!response.data.products || !Array.isArray(response.data.products)) {
      throw new Error('Invalid API response format');
    }

    const items = response.data.products
      .filter((product) => normalizeCategory(product.category))
      .map(transformProduct);
    cachedInventoryData = items;
    lastFetchTime = now;

    return items;
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw new Error(`Failed to fetch inventory items: ${error.message}`);
  }
};

// Fetch a single inventory item
export const fetchInventoryItem = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    
    if (!response.data.id) {
      throw new Error('Invalid product data');
    }

    return transformProduct(response.data);
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    throw new Error(`Failed to fetch item: ${error.message}`);
  }
};

// Update inventory item (local update - dummyjson doesn't persist)
export const updateInventoryItem = async (id, updates) => {
  try {
    // Find item in cache
    const itemIndex = cachedInventoryData.findIndex((i) => i.id === id);
    if (itemIndex === -1) {
      throw new Error('Item not found in inventory');
    }

    // Update cache (note: dummyjson API doesn't persist changes)
    const updatedItem = {
      ...cachedInventoryData[itemIndex],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    // Recalculate status based on quantity
    if (updatedItem.quantity === 0) {
      updatedItem.status = 'out-of-stock';
    } else if (updatedItem.quantity < updatedItem.reorderLevel) {
      updatedItem.status = 'low-stock';
    } else {
      updatedItem.status = 'in-stock';
    }

    cachedInventoryData[itemIndex] = updatedItem;

    return updatedItem;
  } catch (error) {
    console.error(`Error updating item ${id}:`, error);
    throw new Error(`Failed to update item: ${error.message}`);
  }
};

// Create new inventory item (local only - not persisted to dummyjson)
export const createInventoryItem = async (itemData) => {
  try {
    const maxId = Math.max(0, ...cachedInventoryData.map((i) => i.id));
    
    const newItem = {
      id: maxId + 1,
      name: itemData.name,
      sku: itemData.sku || `SKU-${maxId + 1}`,
      quantity: itemData.quantity || 0,
      unit: itemData.unit || 'pieces',
      price: itemData.price || 0,
      category: normalizeCategory(itemData.category) || CATEGORY_NAMES[0],
      reorderLevel: itemData.reorderLevel || 5,
      lastUpdated: new Date().toISOString(),
      status: itemData.quantity === 0 ? 'out-of-stock' : 'in-stock',
      description: itemData.description || '',
      rating: itemData.rating || 0,
      thumbnail: itemData.thumbnail || '',
    };

    // Recalculate status
    if (newItem.quantity === 0) {
      newItem.status = 'out-of-stock';
    } else if (newItem.quantity < newItem.reorderLevel) {
      newItem.status = 'low-stock';
    } else {
      newItem.status = 'in-stock';
    }

    cachedInventoryData.push(newItem);

    return newItem;
  } catch (error) {
    console.error('Error creating item:', error);
    throw new Error(`Failed to create item: ${error.message}`);
  }
};

// Delete inventory item (local only)
export const deleteInventoryItem = async (id) => {
  try {
    const index = cachedInventoryData.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }

    cachedInventoryData.splice(index, 1);

    return { id };
  } catch (error) {
    console.error(`Error deleting item ${id}:`, error);
    throw new Error(`Failed to delete item: ${error.message}`);
  }
};

// Get inventory summary/metrics
export const fetchInventoryMetrics = async () => {
  try {
    // Fetch fresh data if cache is empty
    if (cachedInventoryData.length === 0) {
      await fetchInventoryItems();
    }

    const totalItems = cachedInventoryData.length;
    const totalQuantity = cachedInventoryData.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = cachedInventoryData.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const lowStockItems = cachedInventoryData.filter((item) => item.quantity > 0 && item.quantity < item.reorderLevel).length;
    const outOfStock = cachedInventoryData.filter((item) => item.quantity === 0).length;
    const categories = [...new Set(cachedInventoryData.map((item) => item.category))];

    return {
      totalItems,
      totalQuantity,
      totalValue: parseFloat(totalValue.toFixed(2)),
      lowStockItems,
      outOfStock,
      categories: categories.sort(),
    };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw new Error(`Failed to fetch metrics: ${error.message}`);
  }
};

export default api;
