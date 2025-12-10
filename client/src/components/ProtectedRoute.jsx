import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, hasRole, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading">
                Checking authentication...
            </div>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <div style={{
                minHeight: '50vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div className="glass-panel card" style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Access Denied</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        You don't have permission to access this page. This area is restricted to health workers and administrators.
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
