import React, { useEffect, useState } from 'react';
import { fetchInventoryMetrics } from '../services/api';
import '../styles/dashboard.css';

const MetricsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchInventoryMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="page-container" role="alert">
        <h1>Metrics</h1>
        <div className="error-message">
          <p>Error loading metrics: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container metrics-page">
      <header className="page-header">
        <h1>Inventory Metrics</h1>
        <p className="page-subtitle">Detailed inventory performance analysis</p>
      </header>

      {loading ? (
        <div className="loading-spinner" role="status" aria-label="Loading metrics">
          <div className="spinner"></div>
          <p>Loading metrics...</p>
        </div>
      ) : metrics ? (
        <main className="metrics-content">
          <section className="metrics-section">
            <h2>Overview</h2>
            <div className="metrics-overview">
              <div className="metric-item">
                <h3>Total Items</h3>
                <p className="metric-number">{metrics.totalItems}</p>
              </div>
              <div className="metric-item">
                <h3>Total Quantity</h3>
                <p className="metric-number">{metrics.totalQuantity}</p>
              </div>
              <div className="metric-item">
                <h3>Total Value</h3>
                <p className="metric-number">₹{metrics.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </section>

          <section className="metrics-section">
            <h2>Stock Status</h2>
            <div className="metrics-status">
              <div className="status-item status-low">
                <h3>Low Stock Items</h3>
                <p className="status-number">{metrics.lowStockItems}</p>
              </div>
              <div className="status-item status-out">
                <h3>Out of Stock</h3>
                <p className="status-number">{metrics.outOfStock}</p>
              </div>
              <div className="status-item status-ok">
                <h3>In Stock</h3>
                <p className="status-number">
                  {metrics.totalItems - metrics.lowStockItems - metrics.outOfStock}
                </p>
              </div>
            </div>
          </section>

          <section className="metrics-section">
            <h2>Categories</h2>
            <div className="categories-container">
              {metrics.categories.map((category) => (
                <div key={category} className="category-tag">
                  {category}
                </div>
              ))}
            </div>
          </section>

          <button
            className="btn btn-primary"
            onClick={loadMetrics}
            aria-label="Refresh metrics data"
          >
            ↻ Refresh Metrics
          </button>
        </main>
      ) : null}
    </div>
  );
};

export default MetricsPage;
