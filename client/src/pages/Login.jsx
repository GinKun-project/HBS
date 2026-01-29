import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import { useToast } from '../components/Toast';

export default function Login({ setUser }) {
    const navigate = useNavigate();
    const { showError, showSuccess } = useToast();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authAPI.login(formData);
            showSuccess('OTP sent to your email!');
            navigate('/mfa', { state: { email: formData.email } });
        } catch (error) {
            showError(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Branding */}
                <div className="auth-brand">
                    <div className="auth-brand-content">
                        <div className="auth-logo">
                            <div className="logo-icon">🏨</div>
                            <h1 className="logo-text">Hotel Booking</h1>
                        </div>
                        <h2 className="auth-brand-title">Welcome Back!</h2>
                        <p className="auth-brand-subtitle">
                            Sign in to access your personalized dashboard and manage your bookings
                        </p>
                        <div className="auth-features">
                            <div className="feature-item">
                                <span className="feature-icon">✨</span>
                                <span>Luxury Hotels</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🔒</span>
                                <span>Secure Booking</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">⚡</span>
                                <span>Instant Confirmation</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="auth-form-container">
                    <div className="auth-form-wrapper">
                        <div className="auth-form-header">
                            <h2 className="auth-form-title">Sign In</h2>
                            <p className="auth-form-subtitle">Enter your credentials to continue</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">📧</span>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input with-icon"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔐</span>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-input with-icon"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-large"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-small"></span>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <span className="btn-arrow">→</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        <div className="auth-footer">
                            <p className="auth-footer-text">
                                Don't have an account?{' '}
                                <Link to="/signup" className="auth-link">
                                    Create Account
                                </Link>
                            </p>
                        </div>

                        <div className="auth-demo-credentials">
                            <p className="demo-title">🎯 Demo Credentials:</p>
                            <div className="demo-accounts">
                                <div className="demo-account">
                                    <strong>Admin:</strong> admin@hotel.com / Admin@123456
                                </div>
                                <div className="demo-account">
                                    <strong>User:</strong> user@example.com / User@1234567
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
