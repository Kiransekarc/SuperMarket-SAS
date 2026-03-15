import React, { useEffect, useState } from "react";
import { getRecentSales, getSalesByDateRange } from "../services/api";
import "../App.css";

const paymentBadgeClass = (mode) => {
  if (mode === "Cash") return "badge cash";
  if (mode === "UPI") return "badge upi";
  return "badge card";
};

const RecentSales = ({ refresh }) => {
  const [sales, setSales] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchRecent = () => {
    getRecentSales().then((res) => setSales(res.data));
  };

  const applyFilter = () => {
    if (!startDate || !endDate) return;
    getSalesByDateRange(startDate, endDate).then((res) =>
      setSales(res.data)
    );
  };

  useEffect(() => {
    fetchRecent();
  }, [refresh]);

  return (
    <div className="card">
      <h3 className="section-title">🧾 Recent Sales</h3>

      {/* FILTER BAR */}
      <div className="filter-bar">
        {/* ROW 1: DATE INPUTS */}
        <div className="filter-row">
          <div className="filter-group">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* ROW 2: BUTTONS (NEW LINE) */}
        <div className="filter-buttons">
          <button className="primary-btn" onClick={applyFilter}>
            Apply
          </button>
          <button className="secondary-btn" onClick={fetchRecent}>
            Reset
          </button>
        </div>
      </div>





      {/* TABLE */}
      {sales.length === 0 ? (
        <p>No sales found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td>{s.product}</td>
                  <td>{s.quantity}</td>
                  <td>₹ {s.amount}</td>
                  <td>
                    <span className={paymentBadgeClass(s.paymentMode)}>
                      {s.paymentMode}
                    </span>
                  </td>
                  <td>
                    {new Date(s.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentSales;
