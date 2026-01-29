import React, { useState, useEffect } from 'react';
import { userAPI } from '../api';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

export default function Profile({ user, setUser }) {
    const [profileData, setProfileData] = useState({
        fullName: '',
        phoneNumber: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const response = await userAPI.updateProfile(profileData);
            setUser(response.user);
            setMessage('Profile updated successfully');
        } catch (error) {
            setError(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            await userAPI.changePassword(passwordData);
            setMessage('Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (error) {
            setError(error.response?.data?.message || 'Password change failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <h1 className="page-title">My Profile</h1>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <div className="card mb-4">
                    <h3 className="card-title">Account Information</h3>
                    <form onSubmit={handleProfileUpdate}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={user?.email || ''}
                                disabled
                            />
                            <div className="form-help">Email cannot be changed</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={profileData.fullName}
                                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={profileData.phoneNumber}
                                onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                placeholder="+1234567890"
                            />
                            <div className="form-help">Phone numbers are encrypted for security</div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h3 className="card-title">Change Password</h3>
                    <form onSubmit={handlePasswordChange}>
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                            />
                            <PasswordStrengthMeter password={passwordData.newPassword} />
                            <div className="form-help" style={{ marginTop: '0.5rem' }}>
                                Must be at least 12 characters. Cannot reuse last 3 passwords.
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
