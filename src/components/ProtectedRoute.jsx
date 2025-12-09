import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, currentUser, loading } = useAuth();

    // Debug logging
    console.log('[ProtectedRoute] Check:', {
        isAuthenticated,
        loading,
        currentUser: currentUser?.username,
        path: window.location.pathname,
        adminOnly
    });

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.warn('[ProtectedRoute] Redirecting to login - not authenticated');
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && currentUser?.role !== 'admin') {
        console.warn('[ProtectedRoute] Redirecting to home - not admin');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
