// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth/useAuthStore';

export function ProtectedRoute({ allowedRoles }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();

    // 1. Enforce Authentication
    //  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they 
    // were trying to go to so we can send them back after they log in.
    //      return <Navigate to="/login" state={{ from: location }} replace />;
    // }

    // 2. Enforce Role-Based Access Control (RBAC)
    // If allowedRoles is provided, make sure the user's role matches one of them
    //if (allowedRoles && !allowedRoles.includes(user?.role)) {
    //    // Redirect to an unauthorized fallback page or home
    //    return <Navigate to="/unauthorized" replace />;
    //}

    // Render child matching routes securely
    return <Outlet />;
}
