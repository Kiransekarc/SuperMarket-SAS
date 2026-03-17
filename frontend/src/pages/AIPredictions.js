import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getAuthItem } from "../utils/authStorage";
import "./AIPredictions.css";

const urgencyConfig = {
  critical: { label: "Critical", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", icon: "fas fa-exclamation-circle" },
  warning:  { label: "Warning",  color: "#f97316", bg: "#fff7ed", border: "#fed7aa", icon: "fas fa-exclamation-triangle" },
  ok:       { label: "Healthy",  color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0", icon: "fas fa-check-circle" },
};

const trendIcon = (trend) => {
  if (trend === "rising")  return <span style={{ color: "#10b981" }}><i className="fas fa-arrow-trend-up"></i> Rising</span>;
  if (trend === "falling") return <span style={{ color: "#ef4444" }}><i className="fas fa-arrow-trend-down"></i> Falling</span>;
  return <span style={{ color: "#64748b" }}><i className="fas fa-minus"></i> Stable</span>;
};

const AIPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | critical | warning | ok
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAuthItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/sales/ai-predictions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPredictions(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("AI Predictions error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPredictions(); }, [fetchPredictions]);

  const filtered = predictions.filter(p => {
    if (filter !== "all" && p.urgency !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.productName.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    all: predictions.length,
    critical: predictions.filter(p => p.urgency === "critical").length,
    warning: predictions.filter(p => p.urgency === "warning").length,
    ok: predictions.filter(p => p.urgency === "ok").length,
  };

  return (
    <div className="aip-page">
      {/* Hero */}
      <div className="aip-hero">
        <div className="aip-hero-blob"></div>
        <div className="aip-hero-content">
          <div className="aip-hero-icon"><i className="fas fa-brain"></i></div>
          <div>
            <h1>AI Demand Predictions</h1>
            <p>Smart stock forecasting based on your real sales velocity and trends</p>
          </div>
        </div>
        <button className="aip-refresh-btn" onClick={fetchPredictions} disabled={loading}>
          <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}></i>
          {loading ? "Analyzing..." : "Refresh"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="aip-summary-row">
        {[
          { key: "all",      label: "Total Products", icon: "fas fa-boxes",              color: "#3b82f6" },
          { key: "critical", label: "Critical",        icon: "fas fa-exclamation-circle", color: "#ef4444" },
          { key: "warning",  label: "Needs Attention", icon: "fas fa-exclamation-triangle", color: "#f97316" },
          { key: "ok",       label: "Healthy Stock",   icon: "fas fa-check-circle",       color: "#10b981" },
        ].map(({ key, label, icon, color }) => (
          <button
            key={key}
            className={`aip-summary-card ${filter === key ? "active" : ""}`}
            style={{ "--accent": color }}
            onClick={() => setFilter(key)}
          >
            <div className="aip-summary-icon"><i className={icon} style={{ color }}></i></div>
            <div className="aip-summary-num" style={{ color }}>{counts[key]}</div>
            <div className="aip-summary-label">{label}</div>
          </button>
        ))}
      </div>

      {/* Search + last updated */}
      <div className="aip-toolbar">
        <div className="aip-search">
          <i className="fas fa-search"></i>
          <input
            type="search"
            placeholder="Search product, brand or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {lastUpdated && (
          <span className="aip-updated">
            <i className="fas fa-clock"></i> Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="aip-loading">
          <i className="fas fa-brain fa-spin"></i>
          <p>Analyzing sales patterns...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="aip-empty">
          <i className="fas fa-robot"></i>
          <p>No predictions match your filter.</p>
        </div>
      ) : (
        <div className="aip-grid">
          {filtered.map(p => {
            const urg = urgencyConfig[p.urgency];
            return (
              <div key={p.productId} className="aip-card" style={{ "--urg-color": urg.color, "--urg-bg": urg.bg, "--urg-border": urg.border }}>
                {/* Card Header */}
                <div className="aip-card-header">
                  <div className="aip-card-img">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.productName} onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                      : null}
                    <div className="aip-card-img-fallback" style={{ display: p.imageUrl ? "none" : "flex" }}>
                      <i className="fas fa-box"></i>
                    </div>
                  </div>
                  <div className="aip-card-title-block">
                    <div className="aip-card-name">{p.productName}</div>
                    <div className="aip-card-meta">{p.brand} · {p.category}</div>
                  </div>
                  <div className="aip-urgency-badge" style={{ background: urg.bg, color: urg.color, border: `1px solid ${urg.border}` }}>
                    <i className={urg.icon}></i> {urg.label}
                  </div>
                </div>

                {/* Insight Banner */}
                <div className="aip-insight" style={{ background: urg.bg, borderLeft: `3px solid ${urg.color}` }}>
                  <i className={urg.icon} style={{ color: urg.color }}></i>
                  <span>{p.insight}</span>
                </div>

                {/* Stats Grid */}
                <div className="aip-stats">
                  <div className="aip-stat">
                    <div className="aip-stat-label">Current Stock</div>
                    <div className="aip-stat-val" style={{ color: p.urgency === "critical" ? "#ef4444" : p.urgency === "warning" ? "#f97316" : "#0f172a" }}>
                      {p.currentStock}
                    </div>
                  </div>
                  <div className="aip-stat">
                    <div className="aip-stat-label">Sold (30d)</div>
                    <div className="aip-stat-val">{p.sold30d}</div>
                  </div>
                  <div className="aip-stat">
                    <div className="aip-stat-label">Sold (7d)</div>
                    <div className="aip-stat-val">{p.sold7d}</div>
                  </div>
                  <div className="aip-stat">
                    <div className="aip-stat-label">Trend</div>
                    <div className="aip-stat-val" style={{ fontSize: "13px" }}>{trendIcon(p.trend)}</div>
                  </div>
                  <div className="aip-stat">
                    <div className="aip-stat-label">Predicted (7d)</div>
                    <div className="aip-stat-val" style={{ color: "#3b82f6" }}>{p.predictedNext7d}</div>
                  </div>
                  <div className="aip-stat">
                    <div className="aip-stat-label">Days Left</div>
                    <div className="aip-stat-val">{p.daysOfStock !== null ? p.daysOfStock : "∞"}</div>
                  </div>
                </div>

                {/* Stock Bar */}
                <div className="aip-stock-bar-wrap">
                  <div className="aip-stock-bar-labels">
                    <span>Stock Level</span>
                    <span>{p.currentStock} / {Math.max(p.currentStock, p.reorderLevel * 3)}</span>
                  </div>
                  <div className="aip-stock-bar-track">
                    <div
                      className="aip-stock-bar-fill"
                      style={{
                        width: `${Math.min(100, (p.currentStock / Math.max(p.currentStock, p.reorderLevel * 3)) * 100)}%`,
                        background: urg.color
                      }}
                    ></div>
                    <div
                      className="aip-stock-bar-reorder"
                      style={{ left: `${Math.min(100, (p.reorderLevel / Math.max(p.currentStock, p.reorderLevel * 3)) * 100)}%` }}
                      title={`Reorder at ${p.reorderLevel}`}
                    ></div>
                  </div>
                  <div className="aip-stock-bar-hint">Reorder level: {p.reorderLevel}</div>
                </div>

                {/* Restock Recommendation */}
                {p.recommendedRestock > 0 && (
                  <div className="aip-restock">
                    <i className="fas fa-cart-plus"></i>
                    Recommended restock: <strong>{p.recommendedRestock} units</strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIPredictions;
