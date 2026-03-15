import React, { useState } from "react";
import SalesForm from "../components/SalesForm";
import RecentSales from "../components/RecentSales";

const SalesPage = ({ onSaleAdded }) => {
  const [refresh, setRefresh] = useState(false);

  const handleSaleAdded = () => {
    onSaleAdded();
    setRefresh(!refresh);
  };

  return (
    <>
      {/* PAGE HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #1976d2, #1565c0)",
          color: "#fff",
          padding: "25px",
          borderRadius: "10px",
          marginBottom: "20px"
        }}
      >
        <h2 style={{ margin: "0 0 8px 0", fontSize: "28px" }}>
          💰 Sales Management
        </h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>
          Record new sales transactions and track recent activity
        </p>
      </div>

      {/* SALES ENTRY SECTION */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 5px 0", fontSize: "18px", fontWeight: "600" }}>
            ➕ New Sale Entry
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
            Add products to the cart and complete the transaction
          </p>
        </div>
        
        <SalesForm onSaleAdded={handleSaleAdded} />
      </div>

      {/* RECENT SALES SECTION */}
      <div className="card">
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 5px 0", fontSize: "18px", fontWeight: "600" }}>
            📋 Recent Transactions
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
            View and manage recent sales activity
          </p>
        </div>
        
        <RecentSales refresh={refresh} />
      </div>
    </>
  );
};

export default SalesPage;