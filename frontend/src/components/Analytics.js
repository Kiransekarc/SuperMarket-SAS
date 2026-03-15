import React, { useEffect, useState } from "react";
import { getSalesAnalytics, getProducts } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { exportToCSV } from "../utils/exportCSV";

const COLORS = ["#1976d2", "#388e3c", "#f9a825", "#d32f2f", "#7b1fa2"];

const Analytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [products, setProducts] = useState([]);

  // 🔎 Filters
  const [useFilters, setUseFilters] = useState(false);
  const [category, setCategory] = useState("All");
  const [metric, setMetric] = useState("quantity");
  const [year, setYear] = useState("All");

  useEffect(() => {
    getSalesAnalytics().then((res) => setAnalytics(res.data));
    getProducts().then((res) => setProducts(res.data));
  }, []);

  // 🔹 SAFE MERGE (NO UNKNOWN)
  const data = analytics
    .map((item) => {
      const product = products.find((p) => p._id === item._id);
      if (!product) return null;

      const saleDate = new Date(item.lastSoldDate || Date.now());
      const saleYear = saleDate.getFullYear();
      const saleMonth = saleDate.toLocaleString('default', { month: 'short' });

      return {
        name: `${product.name} (${product.brand})`,
        category: product.category || "Others",
        quantity: item.totalQuantitySold,
        revenue: item.totalRevenue,
        year: saleYear,
        month: saleMonth,
        period: `${saleMonth} ${saleYear}`
      };
    })
    .filter(Boolean);

  // 🔹 FILTERED DATA
  const filteredData = data.filter((item) => {
    return (
      (!useFilters ||
        (category === "All" || item.category === category)) &&
      (year === "All" || item.year === Number(year))
    );
  });

  // 🔹 KPI CALCULATIONS
  const totalQuantity = data.reduce((s, d) => s + d.quantity, 0);
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const topProduct = [...data].sort((a, b) => b.quantity - a.quantity)[0];

  // 🔹 PIE DATA
  const categoryMap = {};
  data.forEach((item) => {
    categoryMap[item.category] =
      (categoryMap[item.category] || 0) + item.revenue;
  });

  const pieData = Object.keys(categoryMap).map((c) => ({
    category: c,
    revenue: categoryMap[c]
  }));

  const categories = ["All", ...new Set(data.map((d) => d.category))];
  const years = ["All", ...new Set(data.map((d) => d.year))];

  // KPI Card Component
  const KPICard = ({ icon, title, value, color, subtext }) => (
    <div
      className="card"
      style={{
        flex: 1,
        textAlign: "center",
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        border: `2px solid ${color}20`,
        minWidth: "200px"
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "10px",
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px auto"
        }}
      >
        <span style={{ fontSize: "24px", color: color }}>{icon}</span>
      </div>

      <h4 style={{ margin: "0 0 8px 0", color: "#666", fontSize: "13px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {title}
      </h4>
      <p
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: color,
          margin: "0 0 8px 0",
          lineHeight: "1.2"
        }}
      >
        {value}
      </p>
      {subtext && (
        <p style={{ fontSize: "12px", color: "#888", margin: "0" }}>
          {subtext}
        </p>
      )}
    </div>
  );

  return (
    <>
      {/* PAGE HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #1976d2, #1565c0)",
          color: "#fff",
          padding: "25px",
          borderRadius: "10px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px"
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "28px" }}>
            📊 Sales Analytics Dashboard
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>
            Track sales performance, revenue trends, and product insights
          </p>
        </div>

        <button
          onClick={() => exportToCSV(data, "sales_analytics_report.csv")}
          style={{
            background: "#ffffff",
            color: "#1976d2",
            border: "2px solid #ffffff",
            padding: "10px 18px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#e3f2fd";
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 10px rgba(0,0,0,0.25)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#ffffff";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
          }}
        >
          📥 Download Report
        </button>
      </div>

      {/* KPI SECTION */}
      <div style={{ marginBottom: "25px" }}>
        <h3
          style={{
            marginBottom: "15px",
            color: "#333",
            fontSize: "18px",
            fontWeight: "600"
          }}
        >
          📈 Performance Overview
        </h3>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <KPICard
            icon="▣"
            title="Total Quantity Sold"
            value={totalQuantity.toLocaleString()}
            color="#1976d2"
            subtext="Units"
          />

          <KPICard
            icon="₹"
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            color="#388e3c"
            subtext="Earnings"
          />

          <KPICard
            icon="↗"
            title="Top Selling Product"
            value={
              topProduct ? (
                <span style={{ fontSize: "16px" }}>{topProduct.name}</span>
              ) : (
                "N/A"
              )
            }
            color="#f9a825"
            subtext={topProduct ? `${topProduct.quantity} units` : ""}
          />
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: useFilters ? "20px" : "0"
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 5px 0", fontSize: "18px", fontWeight: "600" }}>
              🔍 Advanced Filters
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
              Filter analytics by category, year, and metrics
            </p>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={useFilters}
              onChange={() => setUseFilters(!useFilters)}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {/* FILTER CONTROLS */}
        {useFilters && (
          <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", display: "block", marginBottom: "5px" }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%" }}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", display: "block", marginBottom: "5px" }}>
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{ width: "100%" }}
              >
                {years.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: "150px" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", display: "block", marginBottom: "5px" }}>
                Metric
              </label>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="quantity">Quantity Sold</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* BAR CHART SECTION */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 5px 0", fontSize: "18px", fontWeight: "600" }}>
            📊 Product-wise Performance
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
            Compare {metric === "quantity" ? "quantity sold" : "revenue generated"} across products
          </p>
        </div>

        <div style={{ width: "100%", height: 400, background: "#fafafa", borderRadius: "8px", padding: "20px" }}>
          <ResponsiveContainer>
            <BarChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorQuantity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1976d2" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#1976d2" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#388e3c" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#388e3c" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                angle={0}
                textAnchor="middle"
                height={60}
                interval={0}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                style={{ fontSize: '12px' }}
                label={{
                  value: metric === "quantity" ? "Units Sold" : "Revenue (₹)",
                  angle: -90,
                  position: 'left',
                  offset: 15,
                  style: { fontSize: '13px', fontWeight: '600', textAnchor: 'middle' }
                }}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '2px solid #1976d2',
                  borderRadius: '8px',
                  padding: '10px'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#1976d2' }}
                formatter={(value, name, props) => {
                  const formattedValue = metric === "revenue" ? `₹${value.toLocaleString()}` : value.toLocaleString();
                  return [formattedValue, props.payload.period ? `Period: ${props.payload.period}` : ''];
                }}
              />
              <Bar
                dataKey={metric}
                fill={metric === "quantity" ? "url(#colorQuantity)" : "url(#colorRevenue)"}
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PIE CHART SECTION */}
      <div className="card">
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 5px 0", fontSize: "18px", fontWeight: "600", textAlign: "center" }}>
            📈 Revenue Distribution by Category
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#666", textAlign: "center" }}>
            Category contribution towards overall revenue
          </p>
        </div>

        <div style={{ width: "100%", height: 450, background: "#fafafa", borderRadius: "8px", padding: "20px" }}>
          <ResponsiveContainer>
            <PieChart>
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={index} id={`pieGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.75} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={pieData}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="45%"
                outerRadius={150}
                innerRadius={60}
                paddingAngle={3}
                label={({ category, revenue, percent }) => {
                  const percentage = (percent * 100).toFixed(1);
                  return `${category}: ${percentage}%`;
                }}
                labelLine={{
                  stroke: '#999',
                  strokeWidth: 2
                }}
                animationDuration={1000}
              >
                {pieData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={`url(#pieGradient${i % COLORS.length})`}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '2px solid #1976d2',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: 'linear-gradient(135deg, #e3f2fd, #f5f9ff)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
            <strong>Total Categories:</strong> {pieData.length} |
            <strong> Total Revenue:</strong> ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>
    </>
  );
};

export default Analytics;