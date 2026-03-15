import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthItem } from "../utils/authStorage";

const RoleRoute = ({ allowedRoles = [], children }) => {
  const userRole = getAuthItem("role");

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
