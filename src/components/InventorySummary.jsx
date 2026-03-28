import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const InventorySummary = React.memo(({ items }) => {
  const { user } = useAuth();
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const lowStockCount = items.filter((item) => item.quantity > 0 && item.quantity < item.reorderLevel).length;
  const outOfStockCount = items.filter((item) => item.quantity === 0).length;

  const showTotalValue = user?.role !== 'staff';

  const summaryStats = [
    {
      label: 'Total Items',
      value: totalItems,
      icon: '📦',
      className: 'stat-total',
    },
    {
      label: 'Total Quantity',
      value: totalQuantity,
      icon: '📊',
      className: 'stat-quantity',
    },
    ...(showTotalValue
      ? [
          {
            label: 'Total Value',
            value: `₹${totalValue.toFixed(2)}`,
            icon: '💰',
            className: 'stat-total',
          },
        ]
      : []),
    {
      label: 'Low Stock',
      value: lowStockCount,
      icon: '⚠️',
      className: 'stat-warning',
    },
    {
      label: 'Out of Stock',
      value: outOfStockCount,
      icon: '❌',
      className: 'stat-danger',
    },
  ];

  return (
    <section className="inventory-summary" role="region" aria-label="Inventory summary">
      <h2>Inventory Overview</h2>
      <div className="summary-grid">
        {summaryStats.map((stat) => (
          <div
            key={stat.label}
            className={`summary-card ${stat.className}`}
            role="article"
            aria-label={`${stat.label}: ${stat.value}`}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3>{stat.label}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

InventorySummary.displayName = 'InventorySummary';

export default InventorySummary;
