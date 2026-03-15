import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthItem } from "../utils/authStorage";

const ProtectedRoute = ({ children }) => {
  const token = getAuthItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
