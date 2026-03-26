import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAuthItem } from "../utils/authStorage";
import BarcodeCamera from "../components/BarcodeCamera";
import "./Sales.css";

const Sales = ({ products, onUpdate }) => {
  const [cart, setCart] = useState([]);
  const cartListRef = useRef(null);

  useEffect(() => {
    if (cartListRef.current) {
      cartListRef.current.scrollLeft = cartListRef.current.scrollWidth;
    }
  }, [cart]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [searchTerm, setSearchTerm] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showOnlyOffers, setShowOnlyOffers] = useState(false);
  const [sortBy, setSortBy] = useState("name-asc"); // Sorting state
  const [qtyPopup, setQtyPopup] = useState(null); // { product, inputVal }

  // customer details for invoice
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  const navigate = useNavigate();

  // Calculate discounted price for a product
  const getDiscountedPrice = (product) => {
    let finalPrice = product.price || 0;
    const now = new Date();

    if (product.discountType && product.discountValue && product.discountStartDate && product.discountEndDate) {
      const startDate = new Date(product.discountStartDate);
      const endDate = new Date(product.discountEndDate);
      endDate.setHours(23, 59, 59, 999);

      if (now >= startDate && now <= endDate) {
        if (product.discountType === "percentage") {
          const discountAmount = finalPrice * (product.discountValue / 100);
          finalPrice = finalPrice - discountAmount;
        } else if (product.discountType === "fixed") {
          finalPrice = finalPrice - product.discountValue;
        }
        finalPrice = Math.max(0, finalPrice);
      }
    }

    return finalPrice;
  };

  // quantity parameter lets us add more than one at once (not really needed here)
  const addToCart = (product, quantity = 1) => {
    const discountedPrice = getDiscountedPrice(product);
    const existing = cart.find((item) => item.product._id === product._id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity, price: discountedPrice }]);
    }
    toast.success(`${product.name} added to cart!`);
  };

  // click handler — show qty popup if already in cart, else add once
  const handleProductClick = (product) => {
    const existing = cart.find((item) => item.product._id === product._id);
    if (existing) {
      setQtyPopup({ product, inputVal: String(existing.quantity) });
    } else {
      addToCart(product);
    }
  };

  const handleQtyPopupConfirm = () => {
    if (!qtyPopup) return;
    const qty = parseInt(qtyPopup.inputVal, 10);
    if (!qty || qty <= 0) { setQtyPopup(null); return; }
    const max = qtyPopup.product.stock;
    if (qty > max) { toast.error(`Only ${max} in stock`); return; }
    setCart(cart.map((item) =>
      item.product._id === qtyPopup.product._id
        ? { ...item, quantity: qty }
        : item
    ));
    toast.success(`Quantity updated to ${qty}`);
    setQtyPopup(null);
  };

  const handleBarcodeScan = (scannedText) => {
    if (!scannedText) return;
    try {
      const normalize = (v) => String(v ?? "").trim().toUpperCase();
      const normalizeDigits = (v) => normalize(v).replace(/[^\d]/g, "");

      const scannedNorm = normalize(scannedText);
      const scannedDigits = normalizeDigits(scannedText);

      const productObj = (products || []).find((p) => {
        const pid = normalize(p?.productId);
        if (!pid) return false;
        if (pid === scannedNorm) return true;
        if (scannedDigits && scannedDigits.length >= 4) {
          return normalizeDigits(pid) === scannedDigits;
        }
        return false;
      });

      if (!productObj) {
        toast.error(`Unrecognized barcode: ${scannedNorm || scannedText}`);
        return;
      }

      addToCart(productObj);
      toast.success(`${productObj.name} added via barcode!`);
      setIsScannerOpen(false);
    } catch (err) {
      console.error("Barcode scan error:", err);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.product._id !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.product._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product._id !== productId));
    toast.info("Item removed from cart");
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Fetch customer by phone number
  const fetchCustomerByPhone = async (phone) => {
    if (!phone || phone.length < 10) return;
    
    setIsLoadingCustomer(true);
    try {
      const token = getAuthItem("token");
      console.log("Fetching customer with phone:", phone);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/customers/phone/${phone}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Customer found:", response.data);
      if (response.data) {
        setCustomerName(response.data.name || "");
        setCustomerAddress(response.data.address || "");
        toast.success(`Welcome back, ${response.data.name}!`);
      }
    } catch (err) {
      console.error("Customer lookup error:", err.response || err);
      if (err.response?.status === 404) {
        // Customer not found - clear name and address for new customer
        setCustomerName("");
        setCustomerAddress("");
        toast.info("New customer - please enter details");
      } else {
        console.error("Error fetching customer:", err);
        toast.error("Error checking customer details");
      }
    } finally {
      setIsLoadingCustomer(false);
    }
  };

  const handlePhoneChange = (phone) => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    setCustomerPhone(cleanPhone);
    
    // Auto-fetch when phone number is 10 digits
    if (cleanPhone.length === 10) {
      fetchCustomerByPhone(cleanPhone);
    } else if (cleanPhone.length > 10) {
      // Clear fields if more than 10 digits
      setCustomerName("");
      setCustomerAddress("");
    }
  };

  const handleInitiateCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    setShowCustomerModal(true);
  };

  const handleCheckout = async () => {
    if (!customerPhone || customerPhone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!customerName) {
      toast.error("Please enter customer name");
      return;
    }

    try {
      const token = getAuthItem("token");
      const saleData = {
        items: cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: calculateTotal(),
        paymentMethod,
        customerName,
        customerPhone,
        customerAddress,
      };

      console.log("Sending sale data:", saleData);

      const response = await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/sales`, saleData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Sale completed:", response.data);
      toast.success("Transaction completed successfully!");
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setShowCustomerModal(false);
      await onUpdate(); // Refresh products to show updated stock
      // navigate to invoice view
      navigate(`/bill/${response.data._id}`);
    } catch (err) {
      console.error("Sale error:", err.response || err);
      const errorMsg = err.response?.data?.error || "Failed to complete sale";
      toast.error(errorMsg);
    }
  };

  // Filter out products with zero or undefined stock
  const availableProducts = (products || []).filter(p => p && p.stock > 0);
  
  const filteredProducts = availableProducts.filter((p) => {
    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesSearch = (
        (p.name || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
      if (!matchesSearch) return false;
    }

    // Offer filter - show only products with active discounts
    if (showOnlyOffers) {
      const now = new Date();
      if (p.discountType && p.discountValue && p.discountStartDate && p.discountEndDate) {
        const startDate = new Date(p.discountStartDate);
        const endDate = new Date(p.discountEndDate);
        endDate.setHours(23, 59, 59, 999);
        
        const hasActiveDiscount = now >= startDate && now <= endDate;
        if (!hasActiveDiscount) return false;
      } else {
        return false; // No discount at all
      }
    }

    return true;
  });

  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return (a.name || "").localeCompare(b.name || "");
      case "name-desc":
        return (b.name || "").localeCompare(a.name || "");
      case "price-asc":
        return (a.price || 0) - (b.price || 0);
      case "price-desc":
        return (b.price || 0) - (a.price || 0);
      case "stock-asc":
        return (a.stock || 0) - (b.stock || 0);
      case "stock-desc":
        return (b.stock || 0) - (a.stock || 0);
      default:
        return 0;
    }
  });

  // Debug log
  console.log("Available products:", availableProducts);

  return (
    <div className="sales-page-container">
      {/* Premium Hero Banner */}
      <div className="sales-hero">
        <div className="hero-text">
          <h1>Point of Sale</h1>
          <p>Process transactions and manage the checkout queue</p>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="sales-action-bar">
        {/* Search and Scan Row */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="search-wrapper" style={{ flex: 1 }}>
            <i className="fas fa-search"></i>
            <input
              type="search"
              placeholder="Search by name, brand, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            style={{
              border: "none",
              borderRadius: "12px",
              padding: "14px 20px",
              background: "#3b82f6",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.2)";
            }}
          >
            <i className="fas fa-barcode"></i>
            <span>Scan Barcode</span>
          </button>
        </div>
      </div>

      {/* Full Width Products Grid */}
      <div className="products-container-fullwidth">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <h3 className="section-title" style={{ margin: 0 }}>
            <i className="fas fa-boxes" style={{ color: "#3b82f6" }}></i>
            Items Available ({availableProducts.length})
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Sort Dropdown */}
            <div className="sort-dropdown-wrapper">
              <i className="fas fa-sort-amount-down"></i>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-dropdown"
              >
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock-asc">Stock: Low to High</option>
                <option value="stock-desc">Stock: High to Low</option>
              </select>
            </div>

            {/* Show Offers Only Toggle */}
            <button
              type="button"
              onClick={() => setShowOnlyOffers(!showOnlyOffers)}
              style={{
                border: showOnlyOffers ? "2px solid #ef4444" : "2px solid #e2e8f0",
                borderRadius: "12px",
                padding: "10px 16px",
                background: showOnlyOffers ? "#fef2f2" : "white",
                color: showOnlyOffers ? "#ef4444" : "#64748b",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
            >
              <i className={`fas ${showOnlyOffers ? "fa-check-circle" : "fa-tag"}`}></i>
              {showOnlyOffers ? "Showing Offers" : "Show Offers Only"}
            </button>
          </div>
        </div>

        {availableProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <i className="fas fa-dolly-flatbed" style={{ fontSize: "64px", marginBottom: "20px", color: "#cbd5e1" }}></i>
            <h4 style={{ fontSize: "20px", fontWeight: "700", color: "#64748b", margin: "0 0 8px 0" }}>Inventory Empty</h4>
            <p style={{ fontSize: "15px", color: "#94a3b8", margin: 0 }}>Add products with verifiable stock first.</p>
          </div>
        ) : (
          <div className="sales-grid-fullwidth">
            {sortedProducts.map((product) => {
              if (!product || !product._id) return null;

              const isLowStock = product.stock <= product.reorderLevel;
              const discountedPrice = getDiscountedPrice(product);
              const hasDiscount = discountedPrice < product.price;

              return (
                <div key={product._id} className="pos-product-card" onClick={() => handleProductClick(product)}>
                  <div className="pos-image-container">
                    {isLowStock ? (
                      <div className="pos-stock-badge stock-warning">
                        <i className="fas fa-exclamation-triangle"></i> Low: {product.stock}
                      </div>
                    ) : (
                      <div className="pos-stock-badge stock-healthy">
                        <i className="fas fa-check-circle"></i> {product.stock} left
                      </div>
                    )}

                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="pos-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <i className="fas fa-box pos-image-placeholder" style={{ display: product.imageUrl ? 'none' : 'block' }}></i>
                  </div>

                  <div className="pos-details">
                    <div className="pos-brand">{product.brand || "Generics"}</div>
                    <h4 className="pos-title">{product.name || "Unnamed Item"}</h4>

                    <div className="pos-footer">
                      {hasDiscount ? (
                        <div className="pos-price">
                          <span style={{ textDecoration: 'line-through', fontSize: '12px', color: '#94a3b8', marginRight: '6px' }}>
                            ₹{product.price.toFixed(2)}
                          </span>
                          <span style={{ color: '#ef4444', fontWeight: '700' }}>
                            ₹{discountedPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <div className="pos-price">₹{(product.price || 0).toFixed(2)}</div>
                      )}
                      <div className="pos-add-btn">
                        <i className="fas fa-plus"></i>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      {cart.length > 0 && (
        <div className="floating-cart-bar">
          <div className="floating-cart-bar-left">
            <div className="floating-cart-icon-wrap">
              <i className="fas fa-cart-shopping"></i>
              <span className="floating-cart-count">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="floating-cart-items-list" ref={cartListRef}>
              {cart.map((item) => (
                <div key={item.product._id} className="floating-cart-chip">
                  <span className="chip-qty">{item.quantity}×</span>
                  <span className="chip-name">{item.product.name}</span>
                  <span className="chip-price">₹{(item.price * item.quantity).toFixed(0)}</span>
                  <button className="chip-remove" onClick={(e) => { e.stopPropagation(); removeFromCart(item.product._id); }} title="Remove">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="floating-cart-bar-right">
            <div className="floating-cart-divider"></div>
            <div className="floating-cart-total-wrap">
              <span className="floating-cart-total-label">Total</span>
              <span className="floating-cart-total-amount">₹{calculateTotal().toFixed(2)}</span>
            </div>
            <button className="floating-cart-checkout-btn" onClick={() => setShowCartModal(true)}>
              View Cart <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCartModal && (
        <div className="modal-overlay" onClick={() => setShowCartModal(false)}>
          <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="modal-header">
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:42, height:42, background:"linear-gradient(135deg,#3b82f6,#2563eb)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <i className="fas fa-shopping-basket" style={{ color:"white", fontSize:17 }}></i>
                </div>
                <div>
                  <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:"#0f172a" }}>Current Order</h2>
                  <p style={{ margin:0, fontSize:12, color:"#64748b", fontWeight:500 }}>
                    {cart.reduce((s,i) => s + i.quantity, 0)} items &nbsp;&#xB7;&nbsp; {cart.length} product{cart.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => setShowCartModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Scrollable items list */}
            <div className="modal-body">
              {[...cart].sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity)).map((item) => (
                <div key={item.product._id} className="cart-item">
                  <div className="cart-item-header">
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:38, height:38, background:"#f1f5f9", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
                        {item.product.imageUrl
                          ? <img src={item.product.imageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={(e) => { e.target.style.display="none"; }} />
                          : <i className="fas fa-box" style={{ color:"#94a3b8", fontSize:14 }}></i>
                        }
                      </div>
                      <div>
                        <h4 className="cart-item-title">{item.product.name}</h4>
                        <p className="cart-item-price">&#x20B9;{(item.price || 0).toFixed(2)} per unit &nbsp;·&nbsp; qty {item.quantity}</p>
                      </div>
                    </div>
                    <button className="btn-remove-item" onClick={() => removeFromCart(item.product._id)} title="Remove item">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-controls">
                      <button className="btn-qty" onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>&#x2212;</button>
                      <span className="qty-display">{item.quantity}</span>
                      <button className="btn-qty" onClick={() => updateQuantity(item.product._id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>+</button>
                    </div>
                    <div className="cart-item-total">&#x20B9;{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky bottom panel — always visible without scrolling */}
            <div className="cart-modal-bottom">
              {/* Payment Method */}
              <div className="cart-payment-row">
                <span className="cart-payment-label">Payment</span>
                <div className="payment-method-grid">
                  {[
                    { value:"cash", icon:"fas fa-money-bill-wave", label:"Cash",  sub:"Physical currency", color:"#10b981" },
                    { value:"card", icon:"fas fa-credit-card",     label:"Card",  sub:"Debit / Credit",    color:"#3b82f6" },
                    { value:"upi",  icon:"fas fa-mobile-alt",      label:"UPI",   sub:"GPay / PhonePe",    color:"#8b5cf6" },
                  ].map((m) => (
                    <button key={m.value} type="button"
                      className={`payment-method-card ${paymentMethod === m.value ? "payment-method-active" : ""}`}
                      style={{ "--pm-color": m.color }}
                      onClick={() => setPaymentMethod(m.value)}
                    >
                      <div className="pm-icon-wrap"><i className={m.icon}></i></div>
                      <span className="pm-label">{m.label}</span>
                      <span className="pm-sub">{m.sub}</span>
                      {paymentMethod === m.value && <div className="pm-check"><i className="fas fa-check"></i></div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grand Total + Actions */}
              <div className="cart-modal-footer-row">
                <div className="cart-grand-total">
                  <span>Total</span>
                  <strong>&#x20B9;{calculateTotal().toFixed(2)}</strong>
                </div>
                <div className="cart-footer-btns">
                  <button className="btn-modal-cancel" onClick={() => setShowCartModal(false)}>
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                  <button className="btn-modal-confirm"
                    onClick={() => { setShowCartModal(false); handleInitiateCheckout(); }}
                  >
                    <i className="fas fa-cash-register"></i> Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* Customer Details Modal */}
      {showCustomerModal && (
        <div className="modal-overlay" onClick={() => setShowCustomerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="btn-close-modal" onClick={() => setShowCustomerModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group-modal">
                <label>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="tel"
                  className="form-input-modal"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                  autoFocus
                />
                {isLoadingCustomer && (
                  <small style={{ color: '#3b82f6', marginTop: '4px', display: 'block' }}>
                    <i className="fas fa-spinner fa-spin"></i> Checking customer...
                  </small>
                )}
              </div>

              <div className="form-group-modal">
                <label>Customer Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input-modal"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full Name"
                  disabled={isLoadingCustomer}
                />
              </div>

              <div className="form-group-modal">
                <label>Address (Optional)</label>
                <textarea
                  className="form-input-modal"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Delivery / Billing Address"
                  rows="3"
                  disabled={isLoadingCustomer}
                />
              </div>

              <div className="modal-summary">
                <div className="summary-row">
                  <span>Payment Method:</span>
                  <strong>{paymentMethod.toUpperCase()}</strong>
                </div>
                <div className="summary-row">
                  <span>Total Amount:</span>
                  <strong style={{ color: '#10b981', fontSize: '20px' }}>₹{calculateTotal().toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setShowCustomerModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-modal-confirm" 
                onClick={handleCheckout}
                disabled={isLoadingCustomer || !customerPhone || !customerName}
              >
                <i className="fas fa-check-circle"></i> Confirm & Print Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {isScannerOpen && (
        <BarcodeCamera
          onScanSuccess={handleBarcodeScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      {/* Quick Quantity Popup */}
      {qtyPopup && (
        <div className="qty-popup-overlay" onClick={() => setQtyPopup(null)}>
          <div className="qty-popup" onClick={(e) => e.stopPropagation()}>
            <div className="qty-popup-header">
              <div className="qty-popup-icon"><i className="fas fa-box"></i></div>
              <div>
                <p className="qty-popup-name">{qtyPopup.product.name}</p>
                <p className="qty-popup-sub">₹{getDiscountedPrice(qtyPopup.product).toFixed(2)} each · {qtyPopup.product.stock} in stock</p>
              </div>
              <button className="qty-popup-close" onClick={() => setQtyPopup(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="qty-popup-body">
              <button className="qty-popup-btn" onClick={() => setQtyPopup(p => ({ ...p, inputVal: String(Math.max(1, parseInt(p.inputVal||1) - 1)) }))}>−</button>
              <input
                className="qty-popup-input"
                type="number"
                min="1"
                max={qtyPopup.product.stock}
                value={qtyPopup.inputVal}
                onChange={(e) => setQtyPopup(p => ({ ...p, inputVal: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleQtyPopupConfirm()}
                autoFocus
              />
              <button className="qty-popup-btn" onClick={() => setQtyPopup(p => ({ ...p, inputVal: String(Math.min(p.product.stock, parseInt(p.inputVal||0) + 1)) }))}>+</button>
            </div>
            <div className="qty-popup-total">
              Total: <strong>₹{(getDiscountedPrice(qtyPopup.product) * (parseInt(qtyPopup.inputVal) || 0)).toFixed(2)}</strong>
            </div>
            <button className="qty-popup-confirm" onClick={handleQtyPopupConfirm}>
              <i className="fas fa-check"></i> Set Quantity
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
