import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, refreshUser, user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        try {
          await refreshUser();
        } catch (error) {
          console.error("Auth check failed:", error);
        }
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, refreshUser]);

  if (isChecking) {
    return <LoadingScreen message="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based routing: USER role should only access /user-sessions
  const userRole = user?.role?.toLowerCase();
  const isUserRole = userRole === "user";
  const isUserSessionsPage = location.pathname === "/user-sessions";
  const isAdminPage = location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/parking-list") ||
    location.pathname.startsWith("/device-management") ||
    location.pathname.startsWith("/card-management") ||
    location.pathname.startsWith("/user-management") ||
    location.pathname.startsWith("/firmware-management") ||
    location.pathname === "/";

  // If USER tries to access admin pages, redirect to user-sessions
  if (isUserRole && isAdminPage) {
    return <Navigate to="/user-sessions" replace />;
  }

  // If ADMIN/GUARD tries to access user-sessions, redirect to dashboard
  if (!isUserRole && isUserSessionsPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
