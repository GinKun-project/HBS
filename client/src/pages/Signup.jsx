import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

export default function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setLoading(true);

        try {
            const response = await authAPI.signup(formData);
            
            navigate('/mfa', { state: { email: formData.email } });
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors.map(e => e.message));
            } else {
                setErrors([error.response?.data?.message || 'Signup failed']);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '500px' }}>
                <div className="card">
                    <div className="card-header">
                        <h1 className="card-title">Create Account</h1>
                        <p className="text-muted">Join us to book your perfect stay</p>
                    </div>

                    {errors.length > 0 && (
                        <div className="alert alert-error">
                            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                className="form-input"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number (Optional)</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                className="form-input"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="+1234567890"
                            />
                            <div className="form-help">
                                Phone numbers are encrypted for security
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <PasswordStrengthMeter password={formData.password} />
                            <div className="form-help" style={{ marginTop: '0.5rem' }}>
                                Must be at least 12 characters with uppercase, lowercase, number, and special character
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="card-footer text-center">
                        <p className="text-muted">
                            Already have an account?{' '}
                            <Link to="/login">Login here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
