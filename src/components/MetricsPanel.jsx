import React, { useEffect, useState } from 'react';
import { fetchInventoryMetrics } from '../services/api';
import '../styles/dashboard.css';

const MetricsPanel = React.memo(() => {
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

  if (loading) {
    return <div className="metrics-panel loading">Loading metrics...</div>;
  }

  if (error) {
    return (
      <div className="metrics-panel error" role="alert">
        <p>Failed to load metrics: {error}</p>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const metricsData = [
    {
      label: 'Stock Health',
      value: `${Math.round(
        ((metrics.totalItems - metrics.lowStockItems) / metrics.totalItems) * 100
      )}%`,
      color: 'metric-green',
      icon: '✓',
    },
    {
      label: 'Inventory Turnover',
      value: (metrics.totalValue / 1000).toFixed(1) + 'K',
      color: 'metric-blue',
      icon: '↻',
    },
    {
      label: 'Alert Items',
      value: metrics.lowStockItems + metrics.outOfStock,
      color: 'metric-red',
      icon: '⚠',
    },
  ];

  return (
    <section className="metrics-panel" role="region" aria-label="Inventory metrics">
      <h2>Key Metrics</h2>
      <div className="metrics-grid">
        {metricsData.map((metric) => (
          <div
            key={metric.label}
            className={`metric-card ${metric.color}`}
            role="article"
            aria-label={`${metric.label}: ${metric.value}`}
          >
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-content">
              <h3>{metric.label}</h3>
              <p className="metric-value">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="metrics-details">
        <h3>Categories</h3>
        <p className="categories-list">{metrics.categories.join(', ')}</p>
      </div>
    </section>
  );
});

MetricsPanel.displayName = 'MetricsPanel';

export default MetricsPanel;
