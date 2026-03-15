import React from "react";
import ProductForm from "../components/ProductForm";
import InventoryTable from "../components/InventoryTable";
import { exportToCSV } from "../utils/exportCSV";
import "../App.css";

const ProductsPage = ({ products, fetchProducts }) => {
  const inventoryData = products.map((p) => ({
    Name: p.name,
    Brand: p.brand,
    Category: p.category,
    Stock: p.stock,
    ReorderLevel: p.reorderLevel
  }));

  return (
    <div className="products-page">
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
            📦 Product Management
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>
            Manage supermarket products, stock levels, and inventory health
          </p>
        </div>

        <button
          onClick={() => exportToCSV(inventoryData, "inventory_data")}
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
          📥 Export Inventory
        </button>
      </div>

      {/* ADD PRODUCT SECTION */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 5px 0", fontSize: "18px", fontWeight: "600" }}>
            ➕ Add / Update Product
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
            Add new products or update stock for existing ones
          </p>
        </div>

        <ProductForm onProductAdded={fetchProducts} />
      </div>

      {/* INVENTORY TABLE SECTION */}
      <div className="card">
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 5px 0", fontSize: "18px", fontWeight: "600" }}>
            📊 Inventory Status
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
            Monitor stock levels and take action on low inventory
          </p>
        </div>

        <InventoryTable products={products} refresh={fetchProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;