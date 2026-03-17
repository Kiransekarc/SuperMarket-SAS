import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { getAuthItem } from "../utils/authStorage";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff"
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getAuthItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getAuthItem("token");
      await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/signup`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("User account created successfully!");
      setFormData({ name: "", email: "", password: "", role: "staff" });
      fetchUsers(); // Refresh user list
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create user");
    }
  };

  // Deactivate user
  const handleDeactivate = async (userId, currentStatus) => {
    try {
      const token = getAuthItem("token");
      await axios.patch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/users/${userId}/status`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(currentStatus ? "User deactivated" : "User activated");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user status");
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const token = getAuthItem("token");
      await axios.delete(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete user");
    }
  };

  return (
    <div className="signup-page-container">
      {/* Hero Header */}
      <div className="signup-hero">
        <h1>
          <i className="fas fa-user-plus"></i>
          User Management
        </h1>
        <p>
          Create new user accounts and configure access permissions for staff and administrators across the Supermarket SAS portal.
        </p>
      </div>

      <div className="signup-grid">
        {/* Main Registration Card */}
        <div>
          <div className="signup-main-card">
            <div className="signup-header-icon">
              <i className="fas fa-user-shield"></i>
            </div>

            <h2 className="signup-title">Register New User</h2>
            <p className="signup-subtitle">
              Add secure staff or admin access to the inventory and sales management system
            </p>

            {/* Registration Form */}
            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="form-row">
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-user"></i>
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-envelope"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@supermarket-sas.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                {/* Temporary Password */}
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-lock"></i>
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                {/* User Role Selection */}
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-shield-alt"></i>
                    Assigned Role
                  </label>
                  <div className="select-wrapper">
                    <select
                      className="form-input"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="staff">Staff Member</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <i className="fas fa-chevron-down select-icon"></i>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="button-group">
                <button type="submit" className="btn-signup-submit">
                  <i className="fas fa-user-check"></i>
                  Create User Account
                </button>

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Sidebar */}
        <div>
          {/* Access Levels Panel */}
          <div className="sidebar-panel panel-primary">
            <h3 className="panel-header">
              <i className="fas fa-info-circle"></i>
              Access Levels
            </h3>

            <div className="role-card">
              <div className="role-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <i className="fas fa-user"></i>
              </div>
              <div>
                <p className="role-title">Staff Member</p>
                <p className="role-desc">Can add sales, view transactions, and checkout customers</p>
              </div>
            </div>

            <div className="role-card">
              <div className="role-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <i className="fas fa-user-shield"></i>
              </div>
              <div>
                <p className="role-title">Administrator</p>
                <p className="role-desc">Full access to inventory, user management, and analytics</p>
              </div>
            </div>
          </div>

          {/* Security Tips Panel */}
          <div className="sidebar-panel panel-warning" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
            <h3 className="panel-header">
              <i className="fas fa-shield-alt"></i>
              Security Tips
            </h3>
            <ul className="tips-list">
              <li>Use a strong temporary password with at least 8 characters</li>
              <li>Ensure the email address is valid and accessible</li>
            </ul>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="user-management-section">
        <div className="section-header">
          <h2>
            <i className="fas fa-users-cog"></i>
            Manage Users
          </h2>
          <p>View and manage all user accounts in the system</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <i className="fas fa-users"></i>
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className={!user.isActive ? 'inactive-row' : ''}>
                      <td>
                        <div className="user-name">
                          <i className={`fas ${user.role === 'admin' ? 'fa-user-shield' : 'fa-user'}`}></i>
                          {user.name}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role === 'admin' ? 'Administrator' : user.role === 'staff' ? 'Staff' : 'Cashier'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className={`btn-action ${user.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                            onClick={() => handleDeactivate(user._id, user.isActive)}
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            <i className={`fas ${user.isActive ? 'fa-ban' : 'fa-check-circle'}`}></i>
                            <span>{user.isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(user._id)}
                            title="Delete user"
                          >
                            <i className="fas fa-trash-alt"></i>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
