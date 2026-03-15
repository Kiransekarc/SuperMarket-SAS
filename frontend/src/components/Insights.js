import React from "react";
import "./Insights.css";

const Insights = ({ products, analytics }) => {
  const lowStockItems = products.filter(
    (p) => p.stock <= p.reorderLevel
  );

  const validAnalytics = analytics.filter(item => products.some(p => p._id === item._id));
  const sortedAnalytics = [...validAnalytics].sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);
  const leastSelling = sortedAnalytics.length > 0 ? sortedAnalytics[sortedAnalytics.length - 1] : null;

  return (
    <div className="insights-container">
      <h4 className="muted" style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600 }}>
        <i className="fas fa-lightbulb" style={{ marginRight: 8, color: '#f59e0b' }}></i>
        Smart AI Insights
      </h4>
      <div className="insights-flex">
        {lowStockItems.length > 0 && (
          <div className="insight-badge insight-warning">
            <span className="insight-icon">🚨</span>
            <span className="insight-text"><strong>{lowStockItems.length}</strong> items urgently need restocking today.</span>
          </div>
        )}

        {leastSelling && (
          <div className="insight-badge insight-info">
            <span className="insight-icon">📉</span>
            <span className="insight-text">Review underperforming product lines to free up capital.</span>
          </div>
        )}

        {lowStockItems.length === 0 && !leastSelling && (
          <div className="insight-badge insight-success">
            <span className="insight-icon">✅</span>
            <span className="insight-text">Inventory health is optimal. No action required.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
