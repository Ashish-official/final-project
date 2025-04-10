import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user } = useAuth();

    if (!user) {
        // Redirect to login page if user is not authenticated
        return <Navigate to="/signin" replace />;
    }

    // Check for admin role if required
    if (requireAdmin && user.role !== 'admin') {
        // Redirect to home page if user is not an admin
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute; 