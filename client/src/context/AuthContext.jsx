import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await authAPI.getProfile();
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
            } else {
                setUser(null);
                localStorage.removeItem('user');
            }
        } catch (err) {
            console.error('Auth status check failed:', err);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setError(err.response?.data?.error || 'Authentication check failed');
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authAPI.register(userData);
            if (response.token) {
                localStorage.setItem('token', response.token);
                setUser(response.user);
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            return response;
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.response?.data?.error || 'Registration failed');
            throw err;
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authAPI.login(credentials);
            if (response.token) {
                localStorage.setItem('token', response.token);
                setUser(response.user);
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            return response;
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.error || 'Login failed');
            throw err;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        } catch (err) {
            console.error('Logout failed:', err);
            setError(err.response?.data?.error || 'Logout failed');
        }
    };

    const isAuthenticated = () => !!user;
    const isAdmin = () => user?.role === 'admin';

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        setError,
        isAuthenticated,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 