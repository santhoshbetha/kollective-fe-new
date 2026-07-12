// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth/useAuthStore';

export function ProtectedRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();

    //  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they 
    // were trying to go to so we can send them back after they log in.
    //      return <Navigate to="/login" state={{ from: location }} replace />;
    // }

    // Render child matching routes securely
    return <Outlet />;
}
