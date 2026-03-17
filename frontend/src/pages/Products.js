import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { getAuthItem } from "../utils/authStorage";
import { useLocation } from "react-router-dom";
import BarcodeCamera from "../components/BarcodeCamera";
import "./Products.css";

const Products = ({ products, onUpdate }) => {
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [expiryFilter, setExpiryFilter] = useState("all"); // all, expiring-soon, expired
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    brand: "",
    category: "",
    price: "",
    stock: "",
    reorderLevel: "",
    imageUrl: "", // New field for user requested product images
    discountType: "none",
    discountValue: "",
    discountStartDate: "",
    discountEndDate: "",
    expiryDate: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const role = getAuthItem("role");

  // Handle filter from navigation state
  useEffect(() => {
    if (location.state?.filter) {
      setExpiryFilter(location.state.filter);
      // Clear the state after setting the filter
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const now = new Date();
  const soonDate = new Date();
  soonDate.setDate(now.getDate() + 7);

  const filteredProducts = (products || []).filter((p) => {
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

    // Expiry filter
    if (expiryFilter === "expiring-soon") {
      if (!p.expiryDate) return false;
      const eDate = new Date(p.expiryDate);
      return eDate >= now && eDate <= soonDate;
    } else if (expiryFilter === "expired") {
      if (!p.expiryDate) return false;
      const eDate = new Date(p.expiryDate);
      return eDate < now;
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
        return (a.sellingPrice || a.price || 0) - (b.sellingPrice || b.price || 0);
      case "price-desc":
        return (b.sellingPrice || b.price || 0) - (a.sellingPrice || a.price || 0);
      case "stock-asc":
        return (a.stock || 0) - (b.stock || 0);
      case "stock-desc":
        return (b.stock || 0) - (a.stock || 0);
      case "recent":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default:
        return 0;
    }
  });

  const handleAddDemoProducts = async () => {
    try {
      const token = getAuthItem("token");
      const demoProducts = [
        {
          productId: "MILK-AMUL-1L",
          name: "Amul Taaza Toned Milk 1L",
          brand: "Amul",
          category: "Dairy",
          price: 65,
          stock: 40,
          reorderLevel: 10,
          imageUrl: "https://images.pexels.com/photos/1201052/pexels-photo-1201052.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "BREAD-WHEAT-400G",
          name: "Whole Wheat Bread 400g",
          brand: "Britannia",
          category: "Bakery",
          price: 45,
          stock: 35,
          reorderLevel: 8,
          imageUrl: "https://images.pexels.com/photos/2434/bread-food-healthy-breakfast.jpg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "EGGS-REG-12PCS",
          name: "Farm Fresh Eggs (Pack of 12)",
          brand: "Suguna",
          category: "Dairy & Eggs",
          price: 90,
          stock: 50,
          reorderLevel: 12,
          imageUrl: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "RICE-BASMATI-5KG",
          name: "Basmati Rice 5kg",
          brand: "India Gate",
          category: "Food Grains",
          price: 620,
          stock: 25,
          reorderLevel: 5,
          imageUrl: "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "ATTA-WHEAT-5KG",
          name: "Whole Wheat Atta 5kg",
          brand: "Aashirvaad",
          category: "Food Grains",
          price: 310,
          stock: 30,
          reorderLevel: 6,
          imageUrl: "https://images.pexels.com/photos/4109993/pexels-photo-4109993.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "OIL-SUNFLOWER-1L",
          name: "Refined Sunflower Oil 1L",
          brand: "Saffola",
          category: "Oils & Ghee",
          price: 170,
          stock: 45,
          reorderLevel: 10,
          imageUrl: "https://images.pexels.com/photos/14313319/pexels-photo-14313319.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "SUGAR-1KG",
          name: "Refined Sugar 1kg",
          brand: "Local",
          category: "Food Grains",
          price: 52,
          stock: 60,
          reorderLevel: 15,
          imageUrl: "https://images.pexels.com/photos/1854664/pexels-photo-1854664.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "SALT-1KG",
          name: "Iodised Salt 1kg",
          brand: "Tata",
          category: "Food Grains",
          price: 22,
          stock: 80,
          reorderLevel: 20,
          imageUrl: "https://images.pexels.com/photos/4110231/pexels-photo-4110231.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "TEA-POWDER-500G",
          name: "Tea Powder 500g",
          brand: "Red Label",
          category: "Beverages",
          price: 260,
          stock: 25,
          reorderLevel: 6,
          imageUrl: "https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "COFFEE-INSTANT-200G",
          name: "Instant Coffee 200g",
          brand: "Nescafé",
          category: "Beverages",
          price: 320,
          stock: 20,
          reorderLevel: 5,
          imageUrl: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "BISCUIT-BOURBON-120G",
          name: "Chocolate Cream Biscuits 120g",
          brand: "Britannia Bourbon",
          category: "Snacks",
          price: 30,
          stock: 70,
          reorderLevel: 15,
          imageUrl: "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "NOODLES-MASALA-70G",
          name: "Instant Masala Noodles 70g",
          brand: "Maggi",
          category: "Snacks",
          price: 15,
          stock: 90,
          reorderLevel: 25,
          imageUrl: "https://images.pexels.com/photos/5409025/pexels-photo-5409025.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "SOAP-BATH-4PK",
          name: "Bathing Soap (Pack of 4)",
          brand: "Dove",
          category: "Personal Care",
          price: 210,
          stock: 35,
          reorderLevel: 8,
          imageUrl: "https://images.pexels.com/photos/3738341/pexels-photo-3738341.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "SHAMPOO-ANTIHAIR-650ML",
          name: "Anti-hairfall Shampoo 650ml",
          brand: "Pantene",
          category: "Personal Care",
          price: 430,
          stock: 18,
          reorderLevel: 4,
          imageUrl: "https://images.pexels.com/photos/3738345/pexels-photo-3738345.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "DETERGENT-POWDER-1KG",
          name: "Detergent Powder 1kg",
          brand: "Surf Excel",
          category: "Household",
          price: 185,
          stock: 28,
          reorderLevel: 6,
          imageUrl: "https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "CLEANER-FLOOR-1L",
          name: "Floor Cleaner 1L (Lemon)",
          brand: "Harpic",
          category: "Household",
          price: 165,
          stock: 22,
          reorderLevel: 5,
          imageUrl: "https://images.pexels.com/photos/4108283/pexels-photo-4108283.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "COLDDRINK-COLA-1.25L",
          name: "Cola Soft Drink 1.25L",
          brand: "Coca-Cola",
          category: "Beverages",
          price: 75,
          stock: 40,
          reorderLevel: 10,
          imageUrl: "https://images.pexels.com/photos/7231989/pexels-photo-7231989.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "JUICE-MANGO-1L",
          name: "Mango Fruit Juice 1L",
          brand: "Real",
          category: "Beverages",
          price: 120,
          stock: 30,
          reorderLevel: 6,
          imageUrl: "https://images.pexels.com/photos/5947055/pexels-photo-5947055.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "ICECREAM-VAN-500ML",
          name: "Vanilla Ice Cream 500ml Tub",
          brand: "Kwality Walls",
          category: "Frozen",
          price: 180,
          stock: 16,
          reorderLevel: 4,
          imageUrl: "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
        {
          productId: "CHOCOLATE-DAIRYMILK-110G",
          name: "Milk Chocolate Bar 110g",
          brand: "Cadbury Dairy Milk",
          category: "Confectionery",
          price: 120,
          stock: 45,
          reorderLevel: 10,
          imageUrl: "https://images.pexels.com/photos/7259925/pexels-photo-7259925.jpeg?auto=compress&cs=tinysrgb&w=400",
        },
      ];

      await Promise.all(
        demoProducts.map((p) =>
          axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/products`, p, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      toast.success("20 supermarket demo products added!");
      await onUpdate();
    } catch (err) {
      console.error("Add demo products error:", err);
      toast.error(
        err.response?.data?.error || "Failed to add demo products"
      );
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthItem("token");

      console.log("Sending product data:", formData);

      await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/products`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Product added successfully!");
      setShowAddModal(false);
      setFormData({
        productId: "", name: "", brand: "", category: "", price: "", stock: "", reorderLevel: "", imageUrl: "",
        discountType: "none", discountValue: "", discountStartDate: "", discountEndDate: "", expiryDate: ""
      });

      // Refresh data immediately
      await onUpdate();
    } catch (err) {
      console.error("Add product error:", err.response || err);
      const errorMsg = err.response?.data?.error || "Failed to add product";
      toast.error(errorMsg);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthItem("token");
      await axios.put(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/products/${editingProduct._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Product updated successfully!");
      setEditingProduct(null);
      setFormData({
        productId: "", name: "", brand: "", category: "", price: "", stock: "", reorderLevel: "", imageUrl: "",
        discountType: "none", discountValue: "", discountStartDate: "", discountEndDate: "", expiryDate: ""
      });

      // Refresh data immediately
      await onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update product");
    }
  };

  const handleDelete = async (id) => {
    const product = products.find(p => p._id === id);

    if (!window.confirm(
      `Are you sure you want to delete "${product?.name}"?\n\n` +
      `⚠️ WARNING: This will also delete all associated sales records from the database!`
    )) return;

    try {
      const token = getAuthItem("token");
      const response = await axios.delete(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const salesAffected = response.data.salesAffected || 0;

      toast.success(
        `Product deleted successfully! ${salesAffected > 0 ? `${salesAffected} associated sale(s) removed.` : ''}`,
        { autoClose: 4000 }
      );

      // Refresh data immediately
      await onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete product");
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      productId: product.productId || "",
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      stock: product.stock,
      reorderLevel: product.reorderLevel,
      imageUrl: product.imageUrl || "",
      discountType: product.discountType || "none",
      discountValue: product.discountValue || "",
      discountStartDate: product.discountStartDate ? new Date(product.discountStartDate).toISOString().split('T')[0] : "",
      discountEndDate: product.discountEndDate ? new Date(product.discountEndDate).toISOString().split('T')[0] : "",
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : ""
    });
  };

  const handleBarcodeScan = (scannedText) => {
    if (!scannedText) return;
    const cleaned = scannedText.trim().toUpperCase();
    setFormData(prev => ({ ...prev, productId: cleaned }));
    setIsScannerOpen(false);
    toast.success(`Barcode scanned: ${cleaned}`);
  };

  return (
    <div style={{ padding: "30px", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Premium Hero Banner */}
      <div className="products-hero">
        <div className="hero-text">
          <h1>Product Catalog</h1>
          <p>Manage inventory, pricing, and visual assets</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="hero-stats">
            <div className="stat-value">{(products || []).length}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="hero-stats">
            <div className="stat-value" style={{ color: '#f87171' }}>
              {(products || []).filter(p => p.stock <= p.reorderLevel).length}
            </div>
            <div className="stat-label">Low Stock</div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="products-action-bar" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", flex: 1 }}>
          <div className="search-wrapper">
            <i className="fas fa-search"></i>
            <input
              type="search"
              placeholder="Search by name, brand or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Expiry Filter Buttons */}
          <div style={{ display: "flex", gap: "6px", background: "#f8fafc", padding: "4px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <button
              onClick={() => setExpiryFilter("all")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: expiryFilter === "all" ? "#3b82f6" : "transparent",
                color: expiryFilter === "all" ? "white" : "#64748b",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              All Products
            </button>
            <button
              onClick={() => setExpiryFilter("expiring-soon")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: expiryFilter === "expiring-soon" ? "#f97316" : "transparent",
                color: expiryFilter === "expiring-soon" ? "white" : "#64748b",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <i className="fas fa-clock"></i> Expiring Soon
            </button>
            <button
              onClick={() => setExpiryFilter("expired")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: expiryFilter === "expired" ? "#ef4444" : "transparent",
                color: expiryFilter === "expired" ? "white" : "#64748b",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              <i className="fas fa-biohazard"></i> Expired
            </button>
          </div>

          {/* Sort Dropdown */}
          <div style={{ position: "relative" }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "10px 35px 10px 15px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "white",
                fontSize: "14px",
                fontWeight: "500",
                color: "#475569",
                cursor: "pointer",
                appearance: "none",
                backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                backgroundSize: "16px"
              }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="stock-asc">Stock (Low to High)</option>
              <option value="stock-desc">Stock (High to Low)</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>

        {/* New Product Button - Far Right */}
        {role === "admin" && (
          <button
            className="btn-add-product"
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus"></i> New Product
          </button>
        )}
      </div>

      {/* Premium Product Grid */}
      {sortedProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <i className="fas fa-box-open" style={{ fontSize: '64px', color: '#cbd5e1', marginBottom: '20px' }}></i>
          <h3 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 8px 0' }}>No Products Found</h3>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Try adjusting your search or add a new product.</p>
        </div>
      ) : (
        <div className="products-grid">
          {sortedProducts.map((product) => {
            const isLowStock = product.stock <= product.reorderLevel;
            const isOutOfStock = product.stock === 0;

            // Calculate Discount
            let finalPrice = product.price || 0;
            let hasActiveDiscount = false;

            if (product.discountType && product.discountType !== "none") {
              const now = new Date();
              const startDate = new Date(product.discountStartDate);
              const endDate = new Date(product.discountEndDate);
              // Ensure we include the full end day up to 23:59:59
              endDate.setHours(23, 59, 59, 999);

              if (now >= startDate && now <= endDate) {
                hasActiveDiscount = true;
                if (product.discountType === "percentage") {
                  const discountAmount = finalPrice * (product.discountValue / 100);
                  finalPrice = finalPrice - discountAmount;
                } else if (product.discountType === "fixed") {
                  finalPrice = finalPrice - product.discountValue;
                }
                // Ensure price doesn't go below 0
                finalPrice = Math.max(0, finalPrice);
              }
            }

            // Expiry Checks
            let isExpired = false;
            let isExpiringSoon = false;
            if (product.expiryDate) {
              const eDate = new Date(product.expiryDate);
              const now = new Date();
              if (eDate < now) {
                isExpired = true;
              } else {
                const diffTime = Math.abs(eDate - now);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 7) {
                  isExpiringSoon = true;
                }
              }
            }

            return (
              <div key={product._id} className="product-card">
                {/* Dynamic Image Container */}
                <div className="product-image-container">
                  {/* Status Badge */}
                  {isOutOfStock ? (
                    <div className="stock-badge stock-critical" style={{ background: '#ef4444', color: 'white' }}>
                      <i className="fas fa-times-circle"></i> Out of Stock
                    </div>
                  ) : isLowStock ? (
                    <div className="stock-badge stock-warning" style={{ background: '#f59e0b', color: 'white' }}>
                      <i className="fas fa-exclamation-triangle"></i> Low Stock ({product.stock})
                    </div>
                  ) : (
                    <div className="stock-badge stock-healthy" style={{ background: '#10b981', color: 'white' }}>
                      <i className="fas fa-check-circle"></i> In Stock ({product.stock})
                    </div>
                  )}

                  {/* Expiry Badge Overlay */}
                  {isExpired && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#dc2626', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', zIndex: 5, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      <i className="fas fa-biohazard" style={{ marginRight: '4px' }}></i> EXPIRED
                    </div>
                  )}
                  {isExpiringSoon && !isExpired && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#f97316', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', zIndex: 5, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      <i className="fas fa-clock" style={{ marginRight: '4px' }}></i> EXPIRING SOON
                    </div>
                  )}

                  {/* Actions Overlay - ADMIN ONLY */}
                  {role === "admin" && (
                    <div className="product-actions-overlay">
                      <button className="btn-icon-action btn-edit" onClick={() => openEditModal(product)} title="Edit">
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="btn-icon-action btn-delete" onClick={() => handleDelete(product._id)} title="Delete">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  )}

                  {/* Image Rendering */}
                  <img
                    src={product.imageUrl || ''}
                    alt={product.name}
                    className="product-image"
                    style={{ display: product.imageUrl ? 'block' : 'none' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const container = e.target.closest('.product-image-container');
                      if (container) {
                        const placeholder = container.querySelector('.product-image-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
                      }
                    }}
                  />
                  <div
                    className="product-image-placeholder"
                    style={{ display: product.imageUrl ? 'none' : 'flex' }}
                  >
                    <i className="fas fa-box"></i>
                  </div>
                </div>

                {/* Details Container */}
                <div className="product-details">
                  <div className="product-category">
                    <span>{product.category || 'Uncategorized'}</span>
                  </div>
                  <h3 className="product-title">{product.name}</h3>
                  <div className="product-brand">{product.brand || 'No Brand'}</div>

                  <div className="product-footer">
                    <div className="product-price">
                      {hasActiveDiscount ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '13px' }}>
                            ₹{(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                            ₹{finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ) : (
                        <span>₹{(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      )}
                    </div>
                    <div className="product-reorder" title="Reorder Threshold">
                      <i className="fas fa-bell"></i> {product.reorderLevel}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PREMIUM SLIDE-OVER MODAL */}
      {(showAddModal || editingProduct) && (
        <div className="slide-modal-overlay">
          <div className="slide-modal-panel">
            {/* Header */}
            <div className="slide-header">
              <h2>{editingProduct ? "Edit Product" : "New Product"}</h2>
              <button
                className="btn-close"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                  setFormData({ productId: "", name: "", brand: "", category: "", price: "", stock: "", reorderLevel: "", imageUrl: "" });
                }}
              >
                &times;
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="productForm" className="slide-body" onSubmit={editingProduct ? handleUpdate : handleAdd}>

              {/* Image URL & Live Preview Block */}
              <div className="form-group">
                <label>Product Image</label>
                <div className="image-preview-url">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<i class="far fa-image" style="font-size: 40px; color: #cbd5e1;"></i><p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">Invalid Image URL</p>'; }} />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <i className="far fa-image" style={{ fontSize: '40px', color: '#cbd5e1' }}></i>
                      <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>No Image Provided</p>
                    </div>
                  )}
                </div>
                <input
                  type="url"
                  className="form-input"
                  placeholder="Paste direct HTTPS image URL here..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              {/* Product ID / SKU */}
              <div className="form-group">
                <label>Product ID (Barcode / SKU) <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="E.g. MILK-1000"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value.toUpperCase() })}
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-scan-barcode"
                    onClick={() => setIsScannerOpen(true)}
                    title="Scan barcode to auto-fill"
                  >
                    <i className="fas fa-barcode"></i> Scan
                  </button>
                </div>
              </div>

              {/* Core Details */}
              <div className="form-group">
                <label>Product Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Organic Bananas"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Brand <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="form-group">
                <label>Price (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Current Stock <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Reorder Level <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Expiry Tracking */}
              <div className="form-group" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                <label>Inventory Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>

              {/* Discount Section */}
              <div className="form-group" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                <label>Discount Settings</label>
                <select
                  className="form-input"
                  style={{ marginBottom: '16px' }}
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>

                {formData.discountType !== "none" && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <div>
                      <label>Discount Value <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder={formData.discountType === 'percentage' ? "e.g., 10" : "e.g., 50"}
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        required
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label>Start Date <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                          type="date"
                          className="form-input"
                          value={formData.discountStartDate}
                          onChange={(e) => setFormData({ ...formData, discountStartDate: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label>End Date <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                          type="date"
                          className="form-input"
                          value={formData.discountEndDate}
                          onChange={(e) => setFormData({ ...formData, discountEndDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Static Action Footer */}
            <div className="slide-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                  setFormData({ name: "", brand: "", category: "", price: "", stock: "", reorderLevel: "", imageUrl: "" });
                }}
              >
                Cancel
              </button>
              <button type="submit" form="productForm" className="btn-submit">
                {editingProduct ? "Save Changes" : "Create Product"}
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
    </div>
  );
};

export default Products;
