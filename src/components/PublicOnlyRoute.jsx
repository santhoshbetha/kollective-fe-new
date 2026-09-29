import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth/useAuthStore';

export function PublicOnlyRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    console.log('PublicOnlyRoute isAuthenticated:', isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}