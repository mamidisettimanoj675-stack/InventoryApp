import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_NAMES } from '../constants/categories';
import InventorySummary from '../components/InventorySummary';
import InventoryItem from '../components/InventoryItem';
import MetricsPanel from '../components/MetricsPanel';
import '../styles/dashboard.css';

const DashboardPage = ({ searchTerm: sharedSearchTerm, setSearchTerm: sharedSetSearchTerm }) => {
  const { items, loading, error } = useInventory();
  const { user } = useAuth();
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const searchTerm = sharedSearchTerm ?? localSearchTerm;
  const setSearchTerm = sharedSetSearchTerm || setLocalSearchTerm;
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'all';

  const categories = ['all', ...CATEGORY_NAMES];

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const userRole = user?.role || 'guest';
  const isGuest = userRole === 'guest';

  const handleCategoryChange = (value) => {
    if (value === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: value });
    }
  };

  if (error) {
    return (
      <div className="page-container" role="alert">
        <h1>Dashboard</h1>
        <div className="error-message">
          <p>Error loading inventory data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container dashboard-page">
      <header className="page-header">
        <h1>Inventory Monitoring Dashboard</h1>
        <p className="page-subtitle">Monitor and manage your inventory in real-time</p>
      </header>

      {loading ? (
        <div className="loading-spinner" role="status" aria-label="Loading inventory data">
          <div className="spinner"></div>
          <p>Loading inventory data...</p>
        </div>
      ) : (
        <main className="dashboard-content">
          {(userRole === 'user' || isGuest) ? (
            <>
              <div className="dashboard-intro">
                <h2>Available Products</h2>
                {isGuest && (
                  <p className="guest-note">Browse products freely. Login to add items to your cart.</p>
                )}
              </div>

              <div className="category-scroll-row">
                {CATEGORY_NAMES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="page-controls">
                <div className="search-section">
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    aria-label="Search products"
                  />
                </div>

                <div className="filter-section">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="filter-select"
                    aria-label="Filter products by category"
                  >
                    {/* {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))} */}
                  </select>
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="empty-state">
                  <p>No products found matching your criteria</p>
                </div>
              ) : (
                <div className="items-grid">
                  {filteredItems.map((item) => (
                    <InventoryItem
                      key={item.id}
                      item={item}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      userRole={userRole}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <InventorySummary items={items} />
              {userRole === 'manager' && <MetricsPanel />}
            </>
          )}
        </main>
      )}
    </div>
  );
};

export default DashboardPage;
