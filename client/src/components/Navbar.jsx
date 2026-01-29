import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

export default function Navbar({ user, setUser }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    🏨 Hotel Booking
                </Link>

                <ul className="navbar-nav">
                    <li>
                        <Link to="/hotels" className="navbar-link">
                            Hotels
                        </Link>
                    </li>

                    {user ? (
                        <>
                            <li>
                                <Link to="/dashboard" className="navbar-link">
                                    Dashboard
                                </Link>
                            </li>

                            <li>
                                <Link to="/profile" className="navbar-link">
                                    Profile
                                </Link>
                            </li>

                            {user.role === 'admin' && (
                                <li>
                                    <Link to="/admin" className="navbar-link">
                                        Admin
                                    </Link>
                                </li>
                            )}

                            <li>
                                <button onClick={handleLogout} className="btn btn-sm btn-outline">
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/login" className="navbar-link">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link to="/signup" className="btn btn-sm btn-primary">
                                    Sign Up
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}
