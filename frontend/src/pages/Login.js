import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../services/auth";
import { setAuthSession } from "../utils/authStorage";
import "../App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Remove the useEffect that locks body scroll

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser({ email, password });

      setAuthSession({ token: res.data.token, name: res.data.name, role: res.data.role });

      toast.success("Welcome back!");

      // Force navigation and page reload
      setTimeout(() => {
        navigate("/", { replace: true });
        window.location.reload();
      }, 500);
    } catch {
      toast.error("Invalid email or password");
    }
  };



  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Column - 3D Illustration */}
        <div className="login-illustration">
          <img
            src="/Supercart.png"
            alt="Supermarket Cart Illustration"
          />
        </div>

        {/* Right Column - Login Form */}
        <div className="login-form-wrapper">
          <div className="login-glass-card">
            {/* Brand Header */}
            <div className="login-brand">
              <div className="brand-icon">
                <i className="fas fa-shopping-basket"></i>
              </div>
              <div className="login-brand-text">
                <span>Supermarket</span>
                <span>SAS</span>
              </div>
            </div>

            {/* Welcome Title */}
            <div className="login-top">
              <h1>Welcome back</h1>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <i className="far fa-envelope"></i>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <i className="fas fa-lock"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-with-toggle"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button type="submit" className="login-btn">
                Login
              </button>

            </form>

            {/* Customer Store Link */}
            <div className="login-customer-link">
              <span>Are you a customer?</span>
              <a href="/store" target="_blank" rel="noopener noreferrer">
                <i className="fas fa-store"></i> Browse Our Store
              </a>
            </div>

            {/* Footer */}
            <div className="login-footer">
              Manage smarter. Sell better.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
