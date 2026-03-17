import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import DashboardOverview from "./pages/DashboardOverview";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import TransactionsHistory from "./pages/TransactionsHistory";
import Analytics from "./pages/Analytics";
import UploadData from "./pages/UploadData";
import Bill from "./pages/Bill";
import Messages from "./pages/Messages";
import CustomerStore from "./pages/CustomerStore";
import AIPredictions from "./pages/AIPredictions";
import { clearAuthSession, getAuthItem } from "./utils/authStorage";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!getAuthItem("token"));
  const isLoginPage = location.pathname === "/login";
  const isStorePage = location.pathname === "/store";

  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoize fetchData to prevent infinite loops
  const fetchData = useCallback(async () => {
    try {
      const token = getAuthItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [productsRes, analyticsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/products`, config),
        axios.get(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/analytics`, config),
      ]);

      setProducts(productsRes.data);
      setAnalytics(analyticsRes.data);
      console.log("✅ Data refreshed:", {
        products: productsRes.data.length,
        analytics: analyticsRes.data.length,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 401) {
        clearAuthSession();
        setIsLoggedIn(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getAuthItem("token");
    const loggedIn = !!token;
    setIsLoggedIn(loggedIn);

    // Redirect to login if not logged in and not on login page
    if (!loggedIn && !isLoginPage && location.pathname !== "/store") {
      navigate("/login", { replace: true });
      setLoading(false);
      return;
    }

    // Fetch data if logged in
    if (loggedIn && !isLoginPage) {
      fetchData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (isLoggedIn && !isLoginPage) {
      const interval = setInterval(() => {
        console.log("🔄 Auto-refreshing data...");
        fetchData();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, isLoginPage, fetchData]);

  if (loading && !isLoginPage && isLoggedIn) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f9fafb" }}>
        <div style={{ textAlign: "center" }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: "48px", color: "#2563eb", marginBottom: "20px" }}></i>
          <p style={{ fontSize: "16px", color: "#6b7280" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} closeOnClick />

      {/* Only show Navbar if logged in AND not on login page */}
      {isLoggedIn && !isLoginPage && !isStorePage && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/store" element={<CustomerStore />} />
        <Route
          path="/"
          element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <DashboardOverview products={products} analytics={analytics} onUpdate={fetchData} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/products"
          element={isLoggedIn ? <Products products={products} onUpdate={fetchData} /> : <Navigate to="/login" />}
        />
        <Route
          path="/sales"
          element={isLoggedIn ? <Sales products={products} onUpdate={fetchData} /> : <Navigate to="/login" />}
        />
        <Route
          path="/transactions"
          element={isLoggedIn ? <TransactionsHistory products={products} /> : <Navigate to="/login" />}
        />
        <Route
          path="/bill"
          element={isLoggedIn ? <Bill /> : <Navigate to="/login" />}
        />
        <Route
          path="/bill/:id"
          element={isLoggedIn ? <Bill /> : <Navigate to="/login" />}
        />
        <Route
          path="/messages"
          element={isLoggedIn ? <Messages /> : <Navigate to="/login" />}
        />
        <Route
          path="/analytics"
          element={isLoggedIn ? <Analytics products={products} analytics={analytics} onUpdate={fetchData} /> : <Navigate to="/login" />}
        />
        <Route
          path="/upload"
          element={isLoggedIn ? <UploadData onUpdate={fetchData} /> : <Navigate to="/login" />}
        />
        <Route
          path="/ai-predictions"
          element={isLoggedIn ? <AIPredictions /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={isLoggedIn ? <Signup /> : <Navigate to="/login" />}
        />
      </Routes>
      {!isLoginPage && !isStorePage && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
