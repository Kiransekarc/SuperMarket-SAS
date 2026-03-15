import React, { useEffect, useState } from "react";
import { getProducts, addSale } from "../services/api";
import { toast } from "react-toastify";
import "../App.css";

const SalesForm = ({ onSaleAdded }) => {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");

  useEffect(() => {
    getProducts().then((res) => setProducts(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addSale({
        productId,
        quantity: Number(quantity),
        paymentMode
      });

      toast.success("Sale recorded successfully");
      setProductId("");
      setQuantity("");
      onSaleAdded();
    } catch {
      toast.error("Failed to record sale");
    }
  };

  return (
    <div className="card">
      <h3 className="section-title">💰 Sales Entry</h3>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.brand}) — Stock: {p.stock}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Payment Mode</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-btn">
            ➕ Add Sale
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesForm;
