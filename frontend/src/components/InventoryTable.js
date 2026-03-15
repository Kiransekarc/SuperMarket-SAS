import React from "react";
import { archiveProduct, restoreProduct } from "../services/api";
import { toast } from "react-toastify";

const InventoryTable = ({ products = [], refresh }) => {
  const getStatus = (product) => {
    if (!product?.isActive) return { text: "Archived", color: "#9e9e9e" };
    if (product.stock <= product.reorderLevel / 2)
      return { text: "Critical", color: "#d32f2f" };
    if (product.stock <= product.reorderLevel)
      return { text: "Low", color: "#f9a825" };
    return { text: "Healthy", color: "#388e3c" };
  };

  const handleArchive = async (id) => {
    try {
      console.log("Starting archive for ID:", id);
      const response = await archiveProduct(id);
      console.log("Archive response:", response);
      
      toast.success("Product archived successfully");
      
      if (refresh) {
        await refresh();
      }
    } catch (err) {
      console.error("Archive error:", err);
      toast.error("Failed to archive product");
    }
  };

  const handleRestore = async (id) => {
    try {
      console.log("Starting restore for ID:", id);
      const response = await restoreProduct(id);
      console.log("Restore response:", response);
      
      toast.success("Product restored successfully");
      
      if (refresh) {
        await refresh();
      }
    } catch (err) {
      console.error("Restore error:", err);
      toast.error("Failed to restore product");
    }
  };

  if (!products.length) {
    return (
      <div className="card">
        <h3>Inventory Status</h3>
        <p>No products available.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Inventory Status</h3>

      <div style={{ overflowX: "auto" }}>
        <table width="100%" cellPadding="10">
          <thead>
            <tr>
              <th align="left">Product</th>
              <th align="left">Brand</th>
              <th align="center">Stock</th>
              <th align="center">Status</th>
              <th align="center">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => {
              if (!p) return null;

              const status = getStatus(p);

              return (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.brand}</td>
                  <td align="center">{p.stock}</td>
                  <td align="center" style={{ color: status.color, fontWeight: 600 }}>
                    {status.text}
                  </td>
                  <td align="center">
                    {p.isActive ? (
                      <button
                        className="btn-danger"
                        onClick={() => handleArchive(p._id)}
                      >
                        Archive
                      </button>
                    ) : (
                      <button
                        className="btn-success"
                        onClick={() => handleRestore(p._id)}
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;