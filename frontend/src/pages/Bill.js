import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSaleById } from "../services/api";
import { toast } from "react-toastify";
import { getAuthItem } from "../utils/authStorage";
import "./Bill.css";
import "./Dashboard.css";

const Bill = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lookupId, setLookupId] = useState("");
  const [recentSales, setRecentSales] = useState([]);
  const [voidLoading, setVoidLoading] = useState(false);
  const navigate = useNavigate();
  const printRef = useRef(null);

  const userRole = getAuthItem("role");
  const isAdmin = userRole === "admin";

  const handleVoidSale = async () => {
    if (!window.confirm("Are you sure you want to void this sale? Stock will be restored and this cannot be undone.")) return;
    setVoidLoading(true);
    try {
      const token = getAuthItem("token");
      const response = await fetch(`http://localhost:5000/api/sales/${sale._id}/void`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to void sale");
      toast.success("Sale voided. Stock has been restored.");
      setSale({ ...sale, voided: true, voidedAt: new Date().toISOString() });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setVoidLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      getSaleById(id)
        .then((res) => setSale(res.data))
        .catch((err) => {
          console.error("Fetch bill error", err);
          toast.error("Unable to load bill. Make sure ID is correct.");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Fetch recent transactions
  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/sales", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setRecentSales(data.slice(0, 5)); // Get last 5 transactions
      } catch (error) {
        console.error("Error fetching recent sales:", error);
      }
    };
    fetchRecentSales();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const element = printRef.current;
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `bill_${sale?._id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    toast.info("Generating PDF...", { autoClose: 2000 });
    // Use the global window.html2pdf loaded from CDN
    window.html2pdf().set(opt).from(element).save();
  };

  const handleLookup = () => {
    if (lookupId.trim()) {
      navigate(`/bill/${lookupId.trim()}`);
    }
  };

  return (
    <div className="bill-page-container">
      {/* Search Hero Box */}
      {!id && (
        <div className="bill-hero">
          <h1>Supermarket SAS</h1>
          <p>Instantly retrieve, print, and download digital invoices securely.</p>
          <div className="bill-search-form">
            <div className="bill-search-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Enter unique Bill ID..."
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              />
            </div>
            <button className="btn-search-bill" onClick={handleLookup}>
              Find Bill
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", flexDirection: "column" }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: "40px", color: "#3b82f6", marginBottom: "16px" }}></i>
          <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "600" }}>Retrieving secure invoice...</span>
        </div>
      )}

      {/* Empty State Rich Content */}
      {!id && !loading && !sale && (
        <div className="bill-dashboard-placeholder">
          {/* Quick Stats Grid */}
          <div className="placeholder-stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                <i className="fas fa-file-invoice-dollar"></i>
              </div>
              <div className="stat-details">
                <h3>Today's Invoices</h3>
                <p>24 Generated</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-details">
                <h3>System Status</h3>
                <p>All Systems Operational</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                <i className="fas fa-print"></i>
              </div>
              <div className="stat-details">
                <h3>Printer Connection</h3>
                <p>Online & Ready</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "30px" }}>
            {/* Recent Transactions Table - Same as Dashboard */}
            <div className="table-panel-modern">
              <div className="panel-header-modern" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <h3><i className="fas fa-list-alt"></i> Recent Transactions</h3>
                <button
                  className="filter-badge"
                  onClick={() => navigate('/transactions')}
                  style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  View All <i className="fas fa-arrow-right"></i>
                </button>
              </div>

              <div className="table-responsive">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Items Purchased</th>
                      <th>Date & Time</th>
                      <th>Payment Method</th>
                      <th>Total Amount</th>
                      <th style={{ textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                          <i className="fas fa-receipt" style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}></i>
                          <p style={{ margin: 0 }}>No recent transactions found.</p>
                        </td>
                      </tr>
                    ) : (
                      recentSales.map((sale) => {
                        const paymentMethod = sale.paymentMethod || 'cash';
                        const paymentIcons = { cash: 'fa-money-bill-wave', card: 'fa-credit-card', upi: 'fa-mobile-alt' };

                        return (
                          <tr key={sale._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/bill/${sale._id}`)}>
                            <td>
                              <div className="table-item-primary">
                                <div className="table-item-icon">
                                  <i className="fas fa-shopping-bag"></i>
                                </div>
                                <div className="table-item-details">
                                  <strong>#{sale._id.slice(-6).toUpperCase()}</strong>
                                  <span>{sale.items?.length || 0} unique item(s)</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '300px' }}>
                                {sale.items?.slice(0, 3).map((item, idx) => {
                                  const productName = item.product?.name || 'Unknown Item';
                                  return (
                                    <span key={idx} style={{
                                      fontSize: '12px', color: '#475569', background: '#f1f5f9',
                                      padding: '4px 8px', borderRadius: '6px', fontWeight: '600',
                                      border: '1px solid #e2e8f0'
                                    }}>
                                      {item.quantity}x {productName}
                                    </span>
                                  );
                                })}
                                {sale.items?.length > 3 && (
                                  <span style={{
                                    fontSize: '12px', color: '#64748b', background: '#f8fafc',
                                    padding: '4px 8px', borderRadius: '6px', fontWeight: '600',
                                    border: '1px solid #e2e8f0'
                                  }}>
                                    +{sale.items.length - 3} more
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="table-item-details">
                                <strong>{new Date(sale.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                                <span>{new Date(sale.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '600' }}>
                                <i className={`fas ${paymentIcons[paymentMethod]}`}></i>
                                {paymentMethod.toUpperCase()}
                              </div>
                            </td>
                            <td>
                              <strong style={{ fontSize: '15px' }}>₹{(sale.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <span className="status-badge status-completed">
                                <i className="fas fa-check-circle"></i> Completed
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Display */}
      {sale && !loading && (
        <div className="invoice-wrapper">
          {/* Voided Banner */}
          {sale.voided && (
            <div className="voided-banner">
              <i className="fas fa-ban"></i>
              <div>
                <strong>SALE VOIDED</strong>
                <span>This transaction has been cancelled. Stock has been restored.</span>
              </div>
            </div>
          )}

          {/* Top Actions */}
          <div className="invoice-actions">
            {!sale.voided && (
              <>
                <button className="btn-invoice-action btn-print" onClick={handlePrint}>
                  <i className="fas fa-print"></i> Print Receipt
                </button>
                <button className="btn-invoice-action btn-download" onClick={handleDownloadPdf}>
                  <i className="fas fa-arrow-down"></i> Download PDF
                </button>
              </>
            )}
            {isAdmin && !sale.voided && (
              <button
                className="btn-invoice-action btn-void"
                onClick={handleVoidSale}
                disabled={voidLoading}
              >
                {voidLoading
                  ? <><i className="fas fa-spinner fa-spin"></i> Voiding...</>
                  : <><i className="fas fa-ban"></i> Void Sale</>
                }
              </button>
            )}
          </div>

          {/* The Receipt Container */}
          <div className={`receipt-card${sale.voided ? " receipt-voided" : ""}`} ref={printRef}>
            {sale.voided && (
              <div className="void-watermark">VOIDED</div>
            )}
            <div className="receipt-header">
              <div className="company-info">
                <div className="logo-box">
                  <i className="fas fa-shopping-basket"></i>
                </div>
                <h2 className="company-name">SUPERMARKET SAS</h2>
                <p className="company-address">123 Commerce Blvd, Tech City, TX 75001</p>
                <p className="company-address">Email: support@supermarketsas.com</p>
                <p className="company-address">Phone: 1-800-SUPERMARKET</p>
              </div>

              <div className="bill-meta">
                <h1 className="invoice-title">INVOICE</h1>
                <div className="meta-group">
                  <span className="meta-label">Bill No:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span className="meta-value" style={{ fontFamily: "monospace", fontSize: "18px", fontWeight: "800" }}>#{sale._id.slice(-8).toUpperCase()}</span>
                    <span style={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace", letterSpacing: "1px" }}>ID: {sale._id}</span>
                  </div>
                </div>
                <div className="meta-group">
                  <span className="meta-label">Date:</span>
                  <span className="meta-value">{new Date(sale.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="meta-group">
                  <span className="meta-label">Total:</span>
                  <span className="meta-value highlight">₹{sale.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="client-info-grid">
              <div className="info-card">
                <h3><i className="fas fa-user"></i> Billed To</h3>
                {sale.customerName ? (
                  <>
                    <h4 className="client-name">{sale.customerName}</h4>
                    {sale.customerPhone && (
                      <p className="client-detail"><i className="fas fa-phone"></i> {sale.customerPhone}</p>
                    )}
                    {sale.customerAddress && (
                      <p className="client-detail"><i className="fas fa-map-marker-alt"></i> {sale.customerAddress}</p>
                    )}
                  </>
                ) : (
                  <>
                    <h4 className="client-name" style={{ fontStyle: "italic", color: "#64748b" }}>Walk-in Customer</h4>
                    <p className="client-detail"><i className="fas fa-cash-register"></i> Point of Sale Transaction</p>
                  </>
                )}
              </div>

              <div className="info-card">
                <h3><i className="fas fa-credit-card"></i> Payment Details</h3>
                <p className="client-detail"><i className="fas fa-wallet"></i> Method: <strong style={{ textTransform: "capitalize", marginLeft: "4px" }}>{sale.paymentMethod || "Cash"}</strong></p>
                <div className={`payment-status-badge${sale.voided ? " payment-status-voided" : ""}`}>
                  {sale.voided
                    ? <><i className="fas fa-ban" style={{ marginRight: "6px" }}></i> VOIDED</>
                    : <><i className="fas fa-check-circle" style={{ marginRight: "6px" }}></i> PAID IN FULL</>
                  }
                </div>
              </div>
            </div>

            <table className="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="cell-center">Qty</th>
                  <th className="cell-right">Unit Price</th>
                  <th className="cell-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="product-cell">
                      {it.product?.imageUrl ? (
                        <img
                          src={it.product.imageUrl}
                          alt={it.product.name}
                          className="product-photo"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="product-icon-placeholder">
                          <i className="fas fa-box"></i>
                        </div>
                      )}
                      <div>
                        <h4 className="product-name">{it.product?.name || "Unknown Product"}</h4>
                        {it.product?.brand && <span className="product-brand">{it.product.brand}</span>}
                      </div>
                    </td>
                    <td className="cell-center">
                      <span className="qty-badge">{it.quantity}</span>
                    </td>
                    <td className="cell-right price-text">₹{it.price.toFixed(2)}</td>
                    <td className="cell-right total-text">₹{(it.price * it.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="receipt-calculations">
              <div className="calc-box">
                <div className="calc-row">
                  <span>Subtotal</span>
                  <span>₹{sale.totalAmount.toFixed(2)}</span>
                </div>
                <div className="calc-row">
                  <span>Tax (0%)</span>
                  <span>₹0.00</span>
                </div>
                <div className="calc-row grand-total">
                  <span>Total Due</span>
                  <span>₹{sale.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="receipt-footer">
              <i className="fas fa-barcode"></i>
              <p>Thank you for shopping at Supermarket SAS!</p>
              <p style={{ fontSize: "12px", marginTop: "4px" }}>Keep this receipt for your records.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bill;
