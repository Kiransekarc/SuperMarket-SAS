import React, { useState, useEffect, useCallback } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import axios from "axios";
import { getAuthItem } from "../utils/authStorage";
import "./Analytics.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = ({ products, analytics, onUpdate }) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [pieData, setPieData] = useState({ labels: [], datasets: [] });
  const [chartFilter, setChartFilter] = useState('quantity'); // 'quantity' or 'revenue'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredAnalytics, setFilteredAnalytics] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [topCustomers, setTopCustomers] = useState([]);
  const [tableView, setTableView] = useState('products');
  const [aiPredictions, setAiPredictions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null); // { title: string, items: array }

  useEffect(() => {
    const fetchTopCustomers = async () => {
      try {
        const token = getAuthItem("token");
        const res = await axios.get("http://localhost:5000/api/customers/top?limit=10", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTopCustomers(res.data);
      } catch (err) {
        console.error("Error fetching top customers:", err);
      }
    };
    fetchTopCustomers();
  }, []);

  const fetchAIPredictions = useCallback(async () => {
    setAiLoading(true);
    try {
      const token = getAuthItem("token");
      const res = await axios.get("http://localhost:5000/api/sales/ai-predictions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiPredictions(res.data);
    } catch (err) {
      console.error("AI Predictions error:", err.response?.data || err.message);
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => { fetchAIPredictions(); }, [fetchAIPredictions]);

  // Function to fetch filtered analytics
  const fetchFilteredAnalytics = async () => {
    if (!startDate || !endDate) {
      return;
    }

    setIsFiltering(true);
    try {
      const token = getAuthItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate }
      };

      const response = await axios.get("http://localhost:5000/api/analytics", config);
      setFilteredAnalytics(response.data);
    } catch (err) {
      console.error("Error fetching filtered analytics:", err);
    } finally {
      setIsFiltering(false);
    }
  };

  // Clear date filter
  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilteredAnalytics([]);
  };

  // Use filtered analytics if available, otherwise use all analytics
  const activeAnalytics = filteredAnalytics.length > 0 ? filteredAnalytics : analytics;

  useEffect(() => {
    if (activeAnalytics.length > 0) {
      // Filter out analytics for deleted products
      const validAnalytics = activeAnalytics.filter(item => {
        const product = products.find(p => p._id === item._id);
        return product !== undefined;
      });

      // Sort based on current filter
      const sortedAnalytics = [...validAnalytics].sort(
        chartFilter === 'quantity'
          ? (a, b) => b.totalQuantitySold - a.totalQuantitySold
          : (a, b) => b.totalRevenue - a.totalRevenue
      );
      const top10 = sortedAnalytics.slice(0, 10);

      const labels = top10.map((item) => {
        const product = products.find((p) => p._id === item._id);
        return product ? `${product.name}` : "Unknown";
      });

      const quantities = top10.map((item) => item.totalQuantitySold);
      const revenues = top10.map((item) => item.totalRevenue);

      // Gradient Bar Chart - Dynamic based on filter
      setChartData({
        labels,
        datasets: [
          {
            label: chartFilter === 'quantity' ? "Units Sold" : "Revenue (₹)",
            data: chartFilter === 'quantity' ? quantities : revenues,
            backgroundColor: [
              'rgba(16, 185, 129, 0.8)',
              'rgba(37, 99, 235, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(14, 165, 233, 0.8)',
              'rgba(34, 197, 94, 0.8)',
            ],
            borderRadius: 10,
            borderWidth: 0,
          },
        ],
      });

      // Vibrant Pie Chart - BY CATEGORY
      // Group analytics by category
      const categoryRevenue = {};
      validAnalytics.forEach(item => {
        const product = products.find(p => p._id === item._id);
        if (product && product.category) {
          const category = product.category;
          if (!categoryRevenue[category]) {
            categoryRevenue[category] = 0;
          }
          categoryRevenue[category] += item.totalRevenue;
        }
      });

      // Sort categories by revenue
      const sortedCategories = Object.entries(categoryRevenue)
        .sort((a, b) => b[1] - a[1]);

      const categoryLabels = sortedCategories.map(([category]) => category);
      const categoryRevenues = sortedCategories.map(([, revenue]) => revenue);

      setPieData({
        labels: categoryLabels,
        datasets: [
          {
            label: "Revenue",
            data: categoryRevenues,
            backgroundColor: [
              '#3b82f6', // Blue
              '#ef4444', // Red
              '#10b981', // Green
              '#f59e0b', // Orange
              '#8b5cf6', // Purple
              '#ec4899', // Pink
              '#14b8a6', // Teal
              '#f97316', // Deep Orange
              '#06b6d4', // Cyan
              '#84cc16', // Lime
            ],
            borderColor: '#fff',
            borderWidth: 3,
            hoverOffset: 15,
          },
        ],
      });
    }
  }, [activeAnalytics, products, chartFilter]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleFont: { size: 14, weight: '700' },
        bodyFont: { size: 13 },
        padding: 15,
        cornerRadius: 12,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
        ticks: { font: { size: 12, weight: '600' }, color: '#6b7280' },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11, weight: '500' },
          color: '#6b7280',
          maxRotation: 45,
          minRotation: 45
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 12, weight: '600' },
          color: '#1a1a1a',
          padding: 15,
          boxWidth: 20,
          boxHeight: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleFont: { size: 14, weight: '700' },
        bodyFont: { size: 13 },
        padding: 15,
        cornerRadius: 12,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ₹${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
    },
  };

  const validAnalytics = activeAnalytics.filter(item =>
    products.find(p => p._id === item._id)
  );

  const totalRevenue = validAnalytics.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalUnitsSold = validAnalytics.reduce((sum, item) => sum + item.totalQuantitySold, 0);
  const avgRevenuePerProduct = validAnalytics.length > 0 ? totalRevenue / validAnalytics.length : 0;
  const topProduct = [...validAnalytics].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];

  return (
    <div className="analytics-page-container">
      {/* Animated Page Header */}
      <div className="analytics-hero">
        <h1>
          <i className="fas fa-chart-line"></i>
          Business Intelligence
        </h1>
        <p>
          Real-time performance metrics, product tracking, and comprehensive revenue analytics for Supermarket SAS.
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="analytics-filter-bar">
        <div className="filter-label">
          <i className="fas fa-calendar-alt"></i>
          Date Range Filter:
        </div>

        <div className="date-input-group">
          <label>From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="date-input-group">
          <label>To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button
          className="btn-filter-action btn-apply-filter"
          onClick={fetchFilteredAnalytics}
          disabled={!startDate || !endDate || isFiltering}
        >
          {isFiltering ? (
            <><i className="fas fa-spinner fa-spin"></i> Filtering...</>
          ) : (
            <><i className="fas fa-filter"></i> Apply</>
          )}
        </button>

        {filteredAnalytics.length > 0 && (
          <button
            className="btn-filter-action btn-clear-filter"
            onClick={clearDateFilter}
          >
            <i className="fas fa-times"></i> Clear Filter
          </button>
        )}

        {filteredAnalytics.length > 0 && (
          <div className="active-filter-badge">
            <i className="fas fa-check-circle"></i> Showing Filtered Results
          </div>
        )}
      </div>

      {/* Stunning KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-bg-glow" style={{ background: 'var(--accent-gradient)' }}></div>
          <div className="kpi-content">
            <p className="kpi-title">Total Revenue</p>
            <h2 className="kpi-value" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ₹{totalRevenue.toFixed(2)}
            </h2>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--accent-gradient)' }}>
            <span style={{ fontSize: '28px', fontWeight: '700' }}>₹</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-bg-glow" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}></div>
          <div className="kpi-content">
            <p className="kpi-title">Total Units Sold</p>
            <h2 className="kpi-value" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {totalUnitsSold}
            </h2>
          </div>
          <div className="kpi-icon-box" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <i className="fas fa-box-open"></i>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-bg-glow" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}></div>
          <div className="kpi-content">
            <p className="kpi-title">Avg Revenue / Product</p>
            <h2 className="kpi-value" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ₹{avgRevenuePerProduct.toFixed(2)}
            </h2>
          </div>
          <div className="kpi-icon-box" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <i className="fas fa-chart-pie"></i>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-bg-glow" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}></div>
          <div className="kpi-content">
            <p className="kpi-title">Top Product</p>
            <h2 className="kpi-value" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '24px', marginTop: '10px' }}>
              {topProduct ? products.find(p => p._id === topProduct._id)?.name.slice(0, 15) || "N/A" : "N/A"}
            </h2>
          </div>
          <div className="kpi-icon-box" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }}>
            <i className="fas fa-crown"></i>
          </div>
        </div>
      </div>

      {/* Charts Section with Modern Design */}
      <div className="charts-grid">
        {/* Bar Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <div>
              <h3 className="chart-title"><i className="fas fa-chart-bar" style={{ color: "#10b981" }}></i> Product Performance</h3>
              <p className="chart-subtitle">
                {chartFilter === 'quantity' ? 'Showing top products by units sold' : 'Showing top products by total cash revenue'}
              </p>
            </div>

            <div className="chart-toggles">
              <button
                className={`btn-chart-toggle ${chartFilter === 'quantity' ? 'active' : ''}`}
                onClick={() => setChartFilter('quantity')}
              >
                <i className="fas fa-box"></i> QTY
              </button>
              <button
                className={`btn-chart-toggle ${chartFilter === 'revenue' ? 'active' : ''}`}
                onClick={() => setChartFilter('revenue')}
              >
                <span style={{ fontSize: '16px', fontWeight: '700' }}>₹</span> REV
              </button>
            </div>
          </div>

          <div style={{ height: "380px" }}>
            {chartData.labels.length > 0 ? (
              <Bar data={chartData} options={barOptions} />
            ) : (
              <div className="chart-empty-state">
                <i className="fas fa-chart-bar"></i>
                <p>No performance data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <div>
              <h3 className="chart-title"><i className="fas fa-chart-pie" style={{ color: "#059669" }}></i> Revenue Split</h3>
              <p className="chart-subtitle">Distribution of income across product categories</p>
            </div>
          </div>

          <div style={{ height: "380px" }}>
            {pieData.labels.length > 0 ? (
              <Doughnut data={pieData} options={pieOptions} />
            ) : (
              <div className="chart-empty-state">
                <i className="fas fa-chart-pie"></i>
                <p>No category revenue data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Demand Insights */}
      {(() => {
        // Find critical items (stock is 0 or less than reorder level)
        const outOfStock = products.filter(p => p.stock <= 0);
        const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.reorderLevel);
        const critical = outOfStock.length > 0 ? outOfStock : lowStock;
        
        // Find rising trend from AI predictions
        const rising = aiPredictions.filter(p => p.trend === 'rising');
        
        // Find dead stock or falling trend
        const deadStock = aiPredictions.filter(p => p.sold30d === 0 || p.trend === 'falling');

        // Festival insights logic - checking for Sweets, Biscuits, or Snacks categories
        const festivalProducts = products.filter(p =>
          ['Sweets', 'Biscuits', 'Snacks'].some(category => p.category?.toLowerCase().includes(category.toLowerCase()))
        );

        return (
          <div className="ai-insights-section">
            <h3 className="section-title">
              <i className="fas fa-magic"></i> AI Insights
            </h3>
            
            <div className="ai-insights-grid">
              {/* Demand Prediction Card */}
              <div className="insight-card prediction-card">
                <div className="card-header">
                  <i className="fas fa-chart-line card-icon"></i>
                  <h4>Prediction</h4>
                </div>
                <div className="card-body">
                  {rising.length > 0 ? (
                    <p>Demand for <strong>{rising.slice(0, 3).map(p => p.productName).join(', ')}</strong> 
                      {rising.length > 3 && (
                        <span 
                          className="clickable-insight-link" 
                          onClick={() => setSelectedInsight({ title: "Trending Products", items: rising, type: 'rising' })}
                        >
                          {' '}and {rising.length - 3} others
                        </span>
                      )} expected to increase next week.
                    </p>
                  ) : (
                    <p>Steady demand expected across most products next week.</p>
                  )}
                </div>
              </div>

              {/* Low Stock Alert Card */}
              <div className="insight-card alert-card">
                <div className="card-header">
                  <i className="fas fa-exclamation-triangle card-icon"></i>
                  <h4>Alert</h4>
                </div>
                <div className="card-body">
                  {outOfStock.length > 0 ? (
                    <p><strong>{outOfStock[0].name}</strong> is currently <strong>out of stock</strong>!</p>
                  ) : lowStock.length > 0 ? (
                    <p><strong>{lowStock[0].name}</strong> stock is running low ({lowStock[0].stock} remaining).</p>
                  ) : (
                    <p>All product stocks are currently at healthy levels.</p>
                  )}
                </div>
              </div>

              {/* Dead Stock Action Card */}
              <div className="insight-card discount-card">
                <div className="card-header">
                  <i className="fas fa-tags card-icon"></i>
                  <h4>Action Required</h4>
                </div>
                <div className="card-body">
                  {deadStock.length > 0 ? (
                    <p><strong>{deadStock.slice(0, 3).map(p => p.productName).join(', ')}</strong>
                      {deadStock.length > 3 && (
                        <span 
                          className="clickable-insight-link" 
                          onClick={() => setSelectedInsight({ title: "Slow-Moving Products", items: deadStock, type: 'falling' })}
                        >
                          {' '}and {deadStock.length - 3} others
                        </span>
                      )} have slow sales. Consider running a discount promotion.
                    </p>
                  ) : (
                    <p>All products are currently moving well!</p>
                  )}
                </div>
              </div>

              {/* Festival Insight Card */}
              <div className="insight-card festival-card">
                <div className="card-header">
                  <i className="fas fa-gift card-icon"></i>
                  <h4>Festival Insight</h4>
                </div>
                <div className="card-body">
                  {festivalProducts.length > 0 ? (
                    <p>Categories like <strong>Sweets & Snacks</strong> may see higher demand during upcoming festivals. Consider stocking up!</p>
                  ) : (
                    <p>Sweets, biscuits, and snacks may have higher demand during upcoming festivals.</p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Insight Details Modal */}
            {selectedInsight && (
              <div className="ai-insight-modal-overlay" onClick={() => setSelectedInsight(null)}>
                <div className="ai-insight-modal" onClick={e => e.stopPropagation()}>
                  <div className="ai-insight-modal-header">
                    <h4>{selectedInsight.title}</h4>
                    <button className="btn-close-modal" onClick={() => setSelectedInsight(null)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="ai-insight-modal-body">
                    <p className="ai-insight-modal-desc">
                      {selectedInsight.type === 'rising' 
                        ? 'These products are currently showing strong upward sales trends based on recent 7-day and 30-day data.'
                        : 'These products have had zero sales in the last 30 days or a declining sales trend. Consider marking them down.'}
                    </p>
                    <ul className="ai-insight-list">
                      {selectedInsight.items.map((item, index) => (
                        <li key={item._id || index} className="ai-insight-list-item">
                          <div className="ai-insight-item-name">
                            <i className="fas fa-box" style={{ color: '#94a3b8', marginRight: '8px' }}></i>
                            <strong>{item.productName}</strong>
                          </div>
                          <div className="ai-insight-item-stats">
                            <span className="ai-stat-badge">
                                {selectedInsight.type === 'rising' ? (
                                    <><i className="fas fa-arrow-trend-up" style={{ color: '#10b981' }}></i> Trending</>
                                ) : (
                                    <><i className="fas fa-arrow-trend-down" style={{ color: '#ef4444' }}></i> Slow Moving</>
                                )}
                            </span>
                            <span className="ai-stat-badge">Sold (30d): {item.sold30d}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}


      {/* Detailed Analytics Tables Section */}
      <div className="analytics-table-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 className="chart-title" style={{ margin: 0 }}>
            {tableView === 'products' ? (
              <><i className="fas fa-table" style={{ color: "#3b82f6", marginRight: "8px" }}></i> Detailed Product Analytics</>
            ) : (
              <><i className="fas fa-users" style={{ color: "#f59e0b", marginRight: "8px" }}></i> Top Customers (By Volume)</>
            )}
          </h3>

          <div className="chart-toggles">
            <button
              className={`btn-chart-toggle ${tableView === 'products' ? 'active' : ''}`}
              onClick={() => setTableView('products')}
            >
              <i className="fas fa-box"></i> Products
            </button>
            <button
              className={`btn-chart-toggle ${tableView === 'customers' ? 'active' : ''}`}
              onClick={() => setTableView('customers')}
            >
              <i className="fas fa-users"></i> Customers
            </button>
          </div>
        </div>

        <div className="table-responsive">
          {tableView === 'products' ? (
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product Name</th>
                  <th>Brand</th>
                  <th>Units Sold</th>
                  <th>Total Revenue</th>
                  <th>Avg. Price</th>
                </tr>
              </thead>
              <tbody>
                {[...validAnalytics]
                  .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
                  .map((item, index) => {
                    const product = products.find((p) => p._id === item._id);
                    if (!product) return null;

                    return (
                      <tr key={index}>
                        <td className={`rank-badge rank-${index < 3 ? index + 1 : 'normal'}`}>
                          #{index + 1}
                        </td>
                        <td className="product-name-cell">{product?.name || "Unknown"}</td>
                        <td>{product?.brand || "N/A"}</td>
                        <td className="metric-highlight">{item.totalQuantitySold}</td>
                        <td className="revenue-highlight">₹{item.totalRevenue.toFixed(2)}</td>
                        <td>₹{(item.totalRevenue / item.totalQuantitySold).toFixed(2)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          ) : (
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Customer Name</th>
                  <th>Mobile Number</th>
                  <th>Total Items</th>
                  <th>Total Spent</th>
                  <th>Rewards Tier</th>
                  <th>Loyalty Points</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      <i className="fas fa-info-circle"></i> No customer data available yet
                    </td>
                  </tr>
                ) : (
                  topCustomers.map((customer, index) => (
                    <tr key={customer._id}>
                      <td className={`rank-badge rank-${index < 3 ? index + 1 : 'normal'}`}>
                        #{index + 1}
                      </td>
                      <td className="product-name-cell">
                        {customer.name || "Unknown"}
                        {customer.memberTier === 'Platinum' && <i className="fas fa-gem" style={{ color: '#06b6d4', marginLeft: '6px' }} title="Platinum Member"></i>}
                        {customer.memberTier === 'Gold' && <i className="fas fa-trophy" style={{ color: '#fbbf24', marginLeft: '6px' }} title="Gold Member"></i>}
                      </td>
                      <td>{customer.phone}</td>
                      <td>{customer.totalItemsPurchased}</td>
                      <td className="revenue-highlight">₹{(customer.totalAmountSpent || 0).toFixed(2)}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold',
                          background: customer.memberTier === 'Platinum' ? '#cffafe' :
                            customer.memberTier === 'Gold' ? '#fef3c7' :
                              customer.memberTier === 'Silver' ? '#f1f5f9' : '#fff7ed',
                          color: customer.memberTier === 'Platinum' ? '#0891b2' :
                            customer.memberTier === 'Gold' ? '#d97706' :
                              customer.memberTier === 'Silver' ? '#475569' : '#c2410c',
                          border: `1px solid ${customer.memberTier === 'Platinum' ? '#67e8f9' :
                              customer.memberTier === 'Gold' ? '#fde68a' :
                                customer.memberTier === 'Silver' ? '#e2e8f0' : '#ffedd5'}`
                        }}>
                          {customer.memberTier || 'Bronze'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '700', color: '#b45309' }}>{Math.floor(customer.loyaltyPoints || 0)}</span>
                          <i className="fas fa-star" style={{ color: '#fbbf24', fontSize: '12px' }}></i>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
