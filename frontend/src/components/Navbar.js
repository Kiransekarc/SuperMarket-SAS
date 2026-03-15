import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearAuthSession, getAuthItem } from "../utils/authStorage";
import "./Navbar.css"; // Import the new styles

const Navbar = () => {
  const navigate = useNavigate();
  const role = getAuthItem("role");
  const name = getAuthItem("name");
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleLogout = () => {
    clearAuthSession();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="navbar-container">
      {/* Left - Logo & Title */}
      <NavLink to="/" className="navbar-brand">
        <div className="brand-logo-icon">
          <i className="fas fa-shopping-cart"></i>
        </div>
        <h1 className="brand-title">Supermarket SAS</h1>
      </NavLink>

      {/* Center - Navigation Links */}
      <div className="navbar-links">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          Home
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          Products
        </NavLink>

        <NavLink
          to="/sales"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          Sales
        </NavLink>

        {role === "admin" && (
          <NavLink
            to="/analytics"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            Analytics
          </NavLink>
        )}


      </div>

      {/* Right - Actions & User */}
      <div className="navbar-actions">
        {role === "admin" && (
          <>
            <NavLink to="/upload" className="action-btn">
              <i className="fas fa-upload"></i>
              <span>Upload</span>
            </NavLink>

            <NavLink to="/signup" className="action-btn">
              <i className="fas fa-user-plus"></i>
              <span>Add User</span>
            </NavLink>
          </>
        )}

        {/* User Badge with Dropdown */}
        <div className="user-menu-container" style={{ position: "relative" }}>
          <div
            className="user-badge-premium"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ cursor: "pointer" }}
          >
            <i className="fas fa-circle-user"></i>
            <span>{name} ({role === "admin" ? "Admin" : "Staff"})</span>
            <i className="fas fa-chevron-down" style={{ fontSize: "12px", marginLeft: "4px" }}></i>
          </div>

          {showDropdown && (
            <div className="user-dropdown-menu">
              <div
                className="dropdown-item"
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/messages');
                }}
              >
                <i className="fas fa-envelope"></i>
                {role === "admin" ? "Contact Staff / Messages" : "Contact Admin / Messages"}
              </div>

              <div
                className="dropdown-item"
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/bill');
                }}
              >
                <i className="fas fa-file-invoice"></i>
                Bill Lookup
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="logout-btn" title="Logout">
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
