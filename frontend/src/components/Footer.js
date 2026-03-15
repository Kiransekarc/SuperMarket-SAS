import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="global-footer-modern">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h4>SUPERMARKET SAS</h4>
                        <p>The premier platform for modern retail and daily operations.</p>
                        <div className="social-icons">
                            <a href="#instagram"><i className="fab fa-instagram"></i></a>
                            <a href="#facebook"><i className="fab fa-facebook-f"></i></a>
                            <a href="#x" className="x-icon">𝕏</a>
                        </div>
                    </div>
                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <Link to="/">Home</Link>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/products">Products</Link>
                        <Link to="/analytics">Analytics</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Contact Us</h4>
                        <p className="contact-item"><i className="fas fa-envelope"></i> supermarketsas@gmail.com</p>
                        <p className="contact-item"><i className="fas fa-phone"></i> +91 9025720030</p>
                        <p className="contact-item"><i className="fas fa-map-marker-alt"></i> Perundurai, Erode, Tamil Nadu</p>
                    </div>
                </div>
                <div className="footer-bottom-modern">
                    <p>&copy; {new Date().getFullYear()} Supermarket SAS. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
