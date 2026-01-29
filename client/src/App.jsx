import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { authAPI } from './api';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import { ToastProvider } from './components/Toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MFA from './pages/MFA';
import Dashboard from './pages/Dashboard';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import BookingForm from './pages/BookingForm';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import './styles/app.css';

function AppContent({ user, setUser }) {
    const location = useLocation();

    // Hide navbar on auth pages (login, signup, mfa)
    const isAuthPage = ['/login', '/signup', '/mfa'].includes(location.pathname);

    return (
        <>
            {!isAuthPage && <Navbar user={user} setUser={setUser} />}
            <Routes>
                {/* Redirect to login if not authenticated, dashboard if authenticated */}
                <Route path="/" element={
                    user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
                } />

                {/* Public routes */}
                <Route path="/login" element={
                    user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />
                } />
                <Route path="/signup" element={
                    user ? <Navigate to="/dashboard" replace /> : <Signup />
                } />
                <Route path="/mfa" element={<MFA setUser={setUser} />} />

                {/* Protected routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute user={user}>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                <Route path="/hotels" element={
                    <ProtectedRoute user={user}>
                        <Hotels />
                    </ProtectedRoute>
                } />

                <Route path="/hotels/:id" element={
                    <ProtectedRoute user={user}>
                        <HotelDetails />
                    </ProtectedRoute>
                } />

                <Route path="/booking/:roomId" element={
                    <ProtectedRoute user={user}>
                        <BookingForm />
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute user={user}>
                        <Profile user={user} setUser={setUser} />
                    </ProtectedRoute>
                } />

                <Route path="/admin" element={
                    <RoleRoute user={user} allowedRoles={['admin']}>
                        <Admin />
                    </RoleRoute>
                } />

                {/* Catch all - redirect based on auth status */}
                <Route path="*" element={
                    user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
                } />
            </Routes>
        </>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const response = await authAPI.getCurrentUser();
            setUser(response.user);
        } catch (error) {
            console.error('Auth check failed:', error.message);
            // User is not authenticated, that's ok
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <ToastProvider>
            <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <AppContent user={user} setUser={setUser} />
            </BrowserRouter>
        </ToastProvider>
    );
}

export default App;
