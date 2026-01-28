import { Navigate, Outlet } from 'react-router-dom';
import { getUser } from '../auth/auth.storage';

export const ProtectedRoute = () => {
    const user = getUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
