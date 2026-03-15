import React from "react";
import { useNavigate } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import "../Home.css"; // We will create this file for specific home styles

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            {/* Hero Carousel Section */}
            <section className="hero-section">
                <Carousel
                    showArrows={true}
                    autoPlay={true}
                    infiniteLoop={true}
                    showThumbs={false}
                    showStatus={false}
                    interval={6000}
                    transitionTime={1000}
                    swipeable={true}
                    emulateTouch={true}
                    stopOnHover={true}
                    renderArrowPrev={(onClickHandler, hasPrev, label) =>
                        hasPrev && (
                            <button type="button" onClick={onClickHandler} title={label} className="custom-arrow custom-arrow-prev">
                                <i className="fas fa-arrow-left"></i>
                            </button>
                        )
                    }
                    renderArrowNext={(onClickHandler, hasNext, label) =>
                        hasNext && (
                            <button type="button" onClick={onClickHandler} title={label} className="custom-arrow custom-arrow-next">
                                <i className="fas fa-arrow-right"></i>
                            </button>
                        )
                    }
                >
                    {/* Slide 1 */}
                    <div className="carousel-slide">
                        <div className="slide-background">
                            <div className="animated-blob blob-blue"></div>
                            <div className="animated-blob blob-purple"></div>
                            <div className="animated-blob blob-cyan"></div>
                        </div>
                        <div className="glass-content-wrapper">
                            <div className="glass-card">
                                <div className="floating-icon-wrapper">
                                    <i className="fas fa-shopping-basket"></i>
                                </div>
                                <h1 className="gradient-text-brand">Supermarket SAS</h1>
                                <h2>The Future of Retail Management</h2>
                                <p>Unleash the full potential of your supermarket with our all-in-one system for inventory, sales, and deep analytics.</p>
                                <div className="action-buttons">
                                    <button className="btn-glow-primary" onClick={() => navigate('/dashboard')}>
                                        <span>Go to Dashboard</span> <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Slide 2 */}
                    <div className="carousel-slide">
                        <div className="slide-background">
                            <div className="animated-blob blob-green"></div>
                            <div className="animated-blob blob-emerald"></div>
                        </div>
                        <div className="glass-content-wrapper">
                            <div className="glass-card">
                                <div className="floating-icon-wrapper">
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <h1 className="gradient-text-analytics">Powerful Analytics</h1>
                                <h2>Data-Driven Decisions</h2>
                                <p>Track your daily sales, monitor stock levels, and identify trends to grow your business effectively.</p>
                                <div className="action-buttons">
                                    <button className="btn-glow-primary" onClick={() => navigate('/analytics')}>
                                        <span>View Reports</span> <i className="fas fa-chart-pie"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Slide 3 */}
                    <div className="carousel-slide">
                        <div className="slide-background">
                            <div className="animated-blob blob-violet"></div>
                            <div className="animated-blob blob-fuchsia"></div>
                        </div>
                        <div className="glass-content-wrapper">
                            <div className="glass-card">
                                <div className="floating-icon-wrapper">
                                    <i className="fas fa-cash-register"></i>
                                </div>
                                <h1 className="gradient-text-pos">Lightning Fast POS</h1>
                                <h2>Seamless Checkout Experience</h2>
                                <p>Process orders quickly, generate bills effortlessly, and keep your customers happy with zero wait times.</p>
                                <div className="action-buttons">
                                    <button className="btn-glow-primary" onClick={() => navigate('/sales')}>
                                        <span>Start Selling</span> <i className="fas fa-shopping-cart"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Carousel>
            </section>

            {/* Premium Feature Cards Section */}
            <section className="premium-features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Supermarket Core Operations</h2>
                        <p>Access your essential management tools in one click</p>
                    </div>

                    <div className="premium-grid">
                        <div className="premium-card premium-card-blue" onClick={() => navigate('/dashboard')}>
                            <div className="card-bg-icon">
                                <i className="fas fa-chart-pie"></i>
                            </div>
                            <div className="premium-card-content text-white-force">
                                <div className="card-icon-small">
                                    <i className="fas fa-tachometer-alt"></i>
                                </div>
                                <h3>Live Dashboard</h3>
                                <p>Get a bird's-eye view of your supermarket's performance today.</p>
                                <span className="card-link">Enter Dashboard <i className="fas fa-arrow-right"></i></span>
                            </div>
                        </div>

                        <div className="premium-card premium-card-green" onClick={() => navigate('/products')}>
                            <div className="card-bg-icon">
                                <i className="fas fa-boxes"></i>
                            </div>
                            <div className="premium-card-content text-white-force">
                                <div className="card-icon-small">
                                    <i className="fas fa-box"></i>
                                </div>
                                <h3>Inventory Control</h3>
                                <p>Manage products, update stock levels, and set reorder alerts.</p>
                                <span className="card-link">Manage Inventory <i className="fas fa-arrow-right"></i></span>
                            </div>
                        </div>

                        <div className="premium-card premium-card-purple" onClick={() => navigate('/sales')}>
                            <div className="card-bg-icon">
                                <i className="fas fa-cash-register"></i>
                            </div>
                            <div className="premium-card-content text-white-force">
                                <div className="card-icon-small">
                                    <i className="fas fa-receipt"></i>
                                </div>
                                <h3>Point of Sale</h3>
                                <p>Process new customer orders and generate printable bills.</p>
                                <span className="card-link">Open POS <i className="fas fa-arrow-right"></i></span>
                            </div>
                        </div>

                        <div className="premium-card premium-card-orange" onClick={() => navigate('/analytics')}>
                            <div className="card-bg-icon">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <div className="premium-card-content text-white-force">
                                <div className="card-icon-small">
                                    <i className="fas fa-chart-bar"></i>
                                </div>
                                <h3>Deep Analytics</h3>
                                <p>Deep dive into your sales data and product performance.</p>
                                <span className="card-link">View Analytics <i className="fas fa-arrow-right"></i></span>
                            </div>
                        </div>

                        <div className="premium-card premium-card-teal" onClick={() => navigate('/bill')}>
                            <div className="card-bg-icon">
                                <i className="fas fa-file-invoice-dollar"></i>
                            </div>
                            <div className="premium-card-content text-white-force">
                                <div className="card-icon-small">
                                    <i className="fas fa-search"></i>
                                </div>
                                <h3>Bill Lookup</h3>
                                <p>Search and retrieve past customer invoices quickly.</p>
                                <span className="card-link">Find Bills <i className="fas fa-arrow-right"></i></span>
                            </div>
                        </div>

                        <div className="premium-card premium-card-rose" onClick={() => navigate('/signup')}>
                            <div className="card-bg-icon">
                                <i className="fas fa-users-cog"></i>
                            </div>
                            <div className="premium-card-content text-white-force">
                                <div className="card-icon-small">
                                    <i className="fas fa-user-plus"></i>
                                </div>
                                <h3>User Management</h3>
                                <p>Add new cashiers, admins, and manage role permissions.</p>
                                <span className="card-link">Manage Staff <i className="fas fa-arrow-right"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Highlights Section */}
            <section className="bento-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Everyday Store Operations</h2>
                        <p>Everything you need to manage your store efficiently</p>
                    </div>

                    <div className="bento-grid">
                        <div className="bento-item bento-large bento-premium-dark">
                            <i className="fas fa-boxes data-icon text-blue"></i>
                            <div className="bento-bottom-content">
                                <h3>Streamlined Inventory</h3>
                                <p>Easily track your product stock levels in real-time. Get instant visual cues when items are running low, so you never run out of your best-selling products.</p>
                            </div>
                        </div>

                        <div className="bento-item bento-premium-dark">
                            <i className="fas fa-receipt data-icon text-blue"></i>
                            <div className="bento-bottom-content">
                                <h3>Effortless Billing</h3>
                                <p>A simple, clutter-free checkout interface to process customer orders and generate accurate bills.</p>
                            </div>
                        </div>

                        <div className="bento-item bento-premium-dark">
                            <i className="fas fa-chart-line data-icon text-blue"></i>
                            <div className="bento-bottom-content">
                                <h3>Clear Analytics</h3>
                                <p>View your daily revenue, total orders, and top-selling products through easy-to-read charts.</p>
                            </div>
                        </div>

                        <div className="bento-item bento-wide bento-premium-dark">
                            <div className="bento-flex">
                                <div className="bento-content">
                                    <h3>Centralized Team Management</h3>
                                    <p>Manage your store from one dashboard. Add cashiers and set roles.</p>
                                </div>
                                <i className="fas fa-users-cog bento-large-icon"></i>
                            </div>
                        </div>

                        <div className="bento-item bento-premium-dark">
                            <i className="fas fa-file-export data-icon text-blue"></i>
                            <div className="bento-bottom-content">
                                <h3>Quick Export</h3>
                                <p>Download your data directly to Excel or PDF instantly.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Info Banner */}
            <section className="info-banner">
                <div className="container">
                    <div className="banner-content">
                        <div className="banner-text">
                            <h2>Need Help Managing Staff?</h2>
                            <p>Admins can add new employees and assign roles directly from the panel.</p>
                        </div>
                        <button className="secondary-btn" onClick={() => navigate('/signup')}>
                            Add New User <i className="fas fa-user-plus"></i>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
