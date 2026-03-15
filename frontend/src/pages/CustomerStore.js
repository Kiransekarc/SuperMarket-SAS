import React, { useEffect, useState, useRef, useCallback } from "react";
import "./CustomerStore.css";

const SLIDES = [
  {
    icon: "fa-store",
    title: "Supermarket SAS",
    subtitle: "Your In-Store Product Catalogue",
    desc: "Browse all available products, check live stock, and discover today's best deals — all in one place.",
    cta: "Browse Products",
    gradientClass: "cs-grad-blue",
    blobs: ["cs-blob-blue", "cs-blob-purple", "cs-blob-cyan"],
  },
  {
    icon: "fa-bolt",
    title: "Hot Deals Today",
    subtitle: "Limited Time Offers",
    desc: "Exclusive discounts on selected products across all categories. Don't miss out on today's savings.",
    cta: "View Offers",
    gradientClass: "cs-grad-green",
    blobs: ["cs-blob-green", "cs-blob-emerald"],
  },
  {
    icon: "fa-boxes",
    title: "Fresh Stock In",
    subtitle: "New Products Added",
    desc: "Discover the latest additions to our inventory — from daily essentials to premium brands.",
    cta: "Explore Now",
    gradientClass: "cs-grad-violet",
    blobs: ["cs-blob-violet", "cs-blob-fuchsia"],
  },
];

const CAT_ICONS = {
  All:"fa-th-large", Dairy:"fa-cheese", Beverages:"fa-coffee", Snacks:"fa-cookie-bite",
  Bakery:"fa-bread-slice", Fruits:"fa-apple-alt", Vegetables:"fa-carrot",
  Meat:"fa-drumstick-bite", Frozen:"fa-snowflake", "Personal Care":"fa-pump-soap",
  Cleaning:"fa-spray-can", Grocery:"fa-shopping-basket", Eating:"fa-utensils",
  Default:"fa-tag",
};
const CAT_COLORS = {
  All:"#2874f0", Dairy:"#f59e0b", Beverages:"#06b6d4", Snacks:"#f97316",
  Bakery:"#d97706", Fruits:"#22c55e", Vegetables:"#16a34a", Meat:"#ef4444",
  Frozen:"#3b82f6", "Personal Care":"#ec4899", Cleaning:"#8b5cf6",
  Grocery:"#2874f0", Eating:"#f59e0b", Default:"#64748b",
};

const CustomerStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [banner, setBanner] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  const [showDeals, setShowDeals] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const searchRef = useRef(null);
  const bannerTimer = useRef(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/products/public")
      .then(r => r.json()).then(d => { setProducts(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const startBannerTimer = useCallback(() => {
    clearInterval(bannerTimer.current);
    bannerTimer.current = setInterval(() => setBanner(s => (s + 1) % SLIDES.length), 6000);
  }, []);

  useEffect(() => { startBannerTimer(); return () => clearInterval(bannerTimer.current); }, [startBannerTimer]);

  const goToBanner = (i) => { setBanner(i); startBannerTimer(); };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 56);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const disc = (p) => {
    if (!p.discountType || p.discountType === "none" || !p.discountValue) return null;
    const now = new Date(), s = new Date(p.discountStartDate), e = new Date(p.discountEndDate);
    e.setHours(23,59,59,999);
    if (now < s || now > e) return null;
    return p.discountType === "percentage"
      ? Math.max(0, p.price * (1 - p.discountValue / 100))
      : Math.max(0, p.price - p.discountValue);
  };

  const pct = (p, d) => p.discountType === "percentage" ? p.discountValue : Math.round((p.price - d) / p.price * 100);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort()];
  const offers = products.filter(p => disc(p) !== null);

  let filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (!q || [p.name, p.brand, p.category].some(v => v?.toLowerCase().includes(q)))
      && (activeCategory === "All" || p.category === activeCategory);
  });

  if (sortBy === "price-asc") filtered = [...filtered].sort((a,b) => (disc(a)||a.price)-(disc(b)||b.price));
  if (sortBy === "price-desc") filtered = [...filtered].sort((a,b) => (disc(b)||b.price)-(disc(a)||a.price));
  if (sortBy === "name") filtered = [...filtered].sort((a,b) => a.name.localeCompare(b.name));
  if (sortBy === "offers") filtered = [...filtered].sort((a,b) => (disc(b)?1:0)-(disc(a)?1:0));

  const s = SLIDES[banner];

  return (
    <div className="cs-page">

      {/* ══ HEADER ══ */}
      <header className={`cs-header${scrolled ? " scrolled" : ""}`}>
        <div className="cs-header-top">
          <div className="cs-logo">
            <div className="cs-logo-box"><i className="fas fa-shopping-basket"></i></div>
            <div className="cs-logo-words"><span className="cs-logo-main">Supermarket SAS</span><span className="cs-logo-sub">Explore. Discover. Shop.</span></div>
          </div>
          <div className="cs-header-actions">
            <div className="cs-live-pill"><span className="cs-pulse"></span>Live Stock</div>
            <a href="/login" className="cs-login-btn"><i className="fas fa-user"></i><span>Staff Login</span></a>
          </div>
        </div>
      </header>

      {/* ══ HERO CAROUSEL ══ */}
      <section className="cs-hero-section">
        <div className="cs-slide-bg">
          {s.blobs.map((b, i) => <div key={i} className={`cs-animated-blob ${b}`}></div>)}
          <div className="cs-grid-overlay"></div>
        </div>
        {/* Arrows — outside glass wrapper so they're always on top */}
        <button className="cs-slide-arrow cs-arrow-prev" onClick={() => goToBanner((banner - 1 + SLIDES.length) % SLIDES.length)}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <button className="cs-slide-arrow cs-arrow-next" onClick={() => goToBanner((banner + 1) % SLIDES.length)}>
          <i className="fas fa-arrow-right"></i>
        </button>
        <div className="cs-glass-wrapper">
          <div className="cs-glass-card">
            <div className="cs-float-icon"><i className={`fas ${s.icon}`}></i></div>
            <h1 className={`cs-hero-title ${s.gradientClass}`}>{s.title}</h1>
            <h2 className="cs-hero-sub">{s.subtitle}</h2>
            <p className="cs-hero-desc">{s.desc}</p>
            <div className="cs-hero-actions">
              <button className="cs-btn-glow" onClick={() => searchRef.current?.querySelector("input")?.focus()}>
                <span>{s.cta}</span> <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
        {/* Dots */}
        <div className="cs-slide-dots">
          {SLIDES.map((_, i) => <button key={i} className={`cs-sdot${i === banner ? " on" : ""}`} onClick={() => goToBanner(i)} />)}
        </div>
      </section>

      {/* ══ STATS ROW ══ */}
      <div className="cs-stats-row">
        <div className="cs-stat-card">
          <div className="cs-stat-icon" style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)", color: "#2563eb" }}>
            <i className="fas fa-boxes"></i>
          </div>
          <div className="cs-stat-info">
            <span className="cs-stat-num">{products.length}+</span>
            <span className="cs-stat-label">Products In Store</span>
          </div>
        </div>
        <div className="cs-stat-card">
          <div className="cs-stat-icon" style={{ background: "linear-gradient(135deg,#fffbeb,#fef3c7)", color: "#d97706" }}>
            <i className="fas fa-fire"></i>
          </div>
          <div className="cs-stat-info">
            <span className="cs-stat-num">{offers.length}</span>
            <span className="cs-stat-label">Active Offers</span>
          </div>
        </div>
        <div className="cs-stat-card">
          <div className="cs-stat-icon" style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", color: "#059669" }}>
            <i className="fas fa-th-large"></i>
          </div>
          <div className="cs-stat-info">
            <span className="cs-stat-num">{categories.length - 1}</span>
            <span className="cs-stat-label">Categories</span>
          </div>
        </div>
        <div className="cs-stat-card">
          <div className="cs-stat-icon" style={{ background: "linear-gradient(135deg,#eef2ff,#e0e7ff)", color: "#4f46e5" }}>
            <i className="fas fa-signal"></i>
          </div>
          <div className="cs-stat-info">
            <span className="cs-stat-num" style={{ color: "#059669", fontSize: "20px", letterSpacing: 0 }}>● Live</span>
            <span className="cs-stat-label">Stock Updates</span>
          </div>
        </div>
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <main className="cs-main">

        {/* ── Hot Deals ── */}
        {offers.length > 0 && (
          <section className="cs-section">
            <div className="cs-section-hd deal-hd">
              <h2><i className="fas fa-bolt"></i> Hot Deals <span className="cs-hd-badge">{offers.length} offers</span></h2>
              <button className={`cs-deals-toggle${showDeals ? " on" : ""}`} onClick={() => setShowDeals(v => !v)}>
                {showDeals ? <><i className="fas fa-chevron-up"></i> Hide</> : <><i className="fas fa-tag"></i> Show Deals</>}
              </button>
            </div>
            {showDeals && (
              <div className="cs-deals-row">
                {offers.slice(0, 8).map(p => {
                  const d = disc(p); const pc = pct(p, d);
                  return (
                    <div key={p._id} className="cs-deal-card" onClick={() => setSelected(p)}>
                      <div className="cs-deal-badge">-{pc}%</div>
                      <div className="cs-deal-img">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} onError={e => e.target.style.display="none"} /> : <i className="fas fa-box"></i>}
                      </div>
                      <div className="cs-deal-body">
                        <p className="cs-deal-name">{p.name}</p>
                        <div className="cs-deal-prices">
                          <span className="cs-deal-new">₹{d.toFixed(0)}</span>
                          <span className="cs-deal-old">₹{p.price.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Shop by Category ── */}
        <section className="cs-section">
          <div className="cs-section-hd">
            <h2><i className="fas fa-th-large"></i> Shop by Category</h2>
            <button className={`cs-deals-toggle${showCategories ? " on" : ""}`} onClick={() => setShowCategories(v => !v)}>
              {showCategories ? <><i className="fas fa-chevron-up"></i> Hide</> : <><i className="fas fa-th-large"></i> Show</>}
            </button>
          </div>
          {showCategories && (
            <div className="cs-cat-row">
              {categories.map(c => (
                <button key={c} className={`cs-cat-chip${activeCategory === c ? " on" : ""}`}
                  style={{ "--cc": CAT_COLORS[c] || CAT_COLORS.Default }}
                  onClick={() => setActiveCategory(c)}>
                  <div className="cs-cat-chip-icon"><i className={`fas ${CAT_ICONS[c] || CAT_ICONS.Default}`}></i></div>
                  <span>{c}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── All Products ── */}
        <section className="cs-section">
          <div className="cs-section-hd cs-products-hd">
            <h2><i className="fas fa-store"></i> {activeCategory === "All" ? "All Products" : activeCategory}
              <span className="cs-count-badge">{filtered.length} items</span>
            </h2>
            <div className="cs-searchbar cs-inline-search" ref={searchRef}>
              <i className="fas fa-search cs-search-icon"></i>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoComplete="off"
              />
              {search && <button className="cs-search-x" onClick={() => setSearch("")}><i className="fas fa-times"></i></button>}
            </div>
            <div className="cs-sort-wrap">
              <label>Sort:</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="default">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A–Z</option>
                <option value="offers">Offers First</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="cs-loading"><div className="cs-spin"></div><p>Loading products...</p></div>
          ) : filtered.length === 0 ? (
            <div className="cs-empty">
              <i className="fas fa-search"></i>
              <h3>No results found</h3>
              <p>Try a different keyword or category</p>
              <button onClick={() => { setSearch(""); setActiveCategory("All"); setSortBy("default"); }}>Clear Filters</button>
            </div>
          ) : (
            <div className="cs-grid">
              {filtered.map(p => {
                const d = disc(p); const has = d !== null; const pc = has ? pct(p, d) : 0; const low = p.stock <= 5;
                return (
                  <div key={p._id} className="cs-card" onClick={() => setSelected(p)}>
                    <div className="cs-card-img">
                      {has && <div className="cs-card-badge">{pc}% off</div>}
                      {low && !has && <div className="cs-card-badge low">Few Left</div>}
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
                        : null}
                      <div className="cs-card-fallback" style={{ display: p.imageUrl ? "none" : "flex" }}><i className="fas fa-box"></i></div>
                      <div className="cs-card-hover-overlay"><i className="fas fa-eye"></i> Quick View</div>
                    </div>
                    <div className="cs-card-body">
                      <p className="cs-card-brand">{p.brand}</p>
                      <h3 className="cs-card-name">{p.name}</h3>
                      <div className="cs-card-price-row">
                        <span className="cs-card-price">{has ? `₹${d.toFixed(0)}` : `₹${p.price.toFixed(0)}`}</span>
                        {has && <span className="cs-card-mrp">₹{p.price.toFixed(0)}</span>}
                        {has && <span className="cs-card-off">{pc}% off</span>}
                      </div>
                      <div className={`cs-card-avail${low ? " low" : ""}`}>
                        <i className={`fas ${low ? "fa-exclamation-circle" : "fa-check-circle"}`}></i>
                        {low ? `Only ${p.stock} left` : "In Stock"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* ══ FOOTER ══ */}
      <footer className="cs-footer">
        <div className="cs-footer-top">
          <div className="cs-footer-brand">
            <div className="cs-footer-logo-box"><i className="fas fa-shopping-cart"></i></div>
            <div><strong>Supermarket SAS</strong><p>Your neighbourhood store, always stocked fresh.</p></div>
          </div>
          <div className="cs-footer-cols">
            <div className="cs-footer-col">
              <h4>Store Info</h4>
              <p><i className="fas fa-map-marker-alt"></i> 123 Commerce Blvd, Tech City</p>
              <p><i className="fas fa-clock"></i> Open Daily · 7 AM – 10 PM</p>
              <p><i className="fas fa-phone"></i> 1-800-SUPERMART</p>
            </div>
            <div className="cs-footer-col">
              <h4>Quick Links</h4>
              <p><i className="fas fa-tag"></i> Today's Offers</p>
              <p><i className="fas fa-th-large"></i> All Categories</p>
              <p><i className="fas fa-sync-alt"></i> Live Stock</p>
            </div>
          </div>
        </div>
        <div className="cs-footer-bottom">
          <span>© 2025 Supermarket SAS · All prices are in ₹ · Visit us in-store to purchase</span>
          <a href="/login" className="cs-footer-staff"><i className="fas fa-lock"></i> Staff Portal</a>
        </div>
      </footer>

      {/* ══ QUICK VIEW MODAL ══ */}
      {selected && (() => {
        const p = selected; const d = disc(p); const has = d !== null;
        const pc = has ? pct(p, d) : 0; const low = p.stock <= 5;
        return (
          <div className="cs-modal-bg" onClick={() => setSelected(null)}>
            <div className="cs-modal" onClick={e => e.stopPropagation()}>
              <button className="cs-modal-x" onClick={() => setSelected(null)}><i className="fas fa-times"></i></button>
              <div className="cs-modal-left">
                <div className="cs-modal-img-wrap">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} onError={e => e.target.style.display="none"} /> : <i className="fas fa-box"></i>}
                </div>
                {has && <div className="cs-modal-disc-badge">{pc}% OFF</div>}
              </div>
              <div className="cs-modal-right">
                <span className="cs-modal-cat-tag">{p.category}</span>
                <h2>{p.name}</h2>
                <p className="cs-modal-brand-line"><i className="fas fa-tag"></i> {p.brand}</p>
                <div className="cs-modal-price-block">
                  <span className="cs-modal-price">{has ? `₹${d.toFixed(2)}` : `₹${p.price.toFixed(2)}`}</span>
                  {has && <><span className="cs-modal-mrp">MRP ₹{p.price.toFixed(2)}</span><span className="cs-modal-save-tag">You save ₹{(p.price - d).toFixed(2)}</span></>}
                </div>
                <div className={`cs-modal-stock-tag${low ? " low" : ""}`}>
                  <i className={`fas ${low ? "fa-exclamation-triangle" : "fa-check-circle"}`}></i>
                  {low ? `Hurry! Only ${p.stock} units left` : `In Stock · ${p.stock} units available`}
                </div>
                <div className="cs-modal-info-box"><i className="fas fa-store"></i> Visit our store to purchase this item. Prices shown are in-store prices.</div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default CustomerStore;
