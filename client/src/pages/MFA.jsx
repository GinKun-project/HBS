import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../api';

export default function MFA({ setUser }) {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.verifyMFA({ email, otp });
            setUser(response.user);
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.message || 'MFA verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '450px' }}>
                <div className="card">
                    <div className="card-header">
                        <h1 className="card-title">Verify Your Identity</h1>
                        <p className="text-muted">
                            Enter the 6-digit code sent to your email
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <div className="alert alert-info">
                        <strong>Demo Mode:</strong> Check the server console for the OTP code
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">OTP Code</label>
                            <input
                                type="text"
                                className="form-input"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="123456"
                                maxLength="6"
                                pattern="[0-9]{6}"
                                required
                                style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || otp.length !== 6}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
