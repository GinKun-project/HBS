import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../api';
import { useToast } from '../components/Toast';

export default function Dashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { showError } = useToast();

    useEffect(() => {
        loadBookings();
    }, [filter]);

    const loadBookings = async () => {
        try {
            const params = filter === 'upcoming' ? { upcoming: 'true' } : {};
            const response = await bookingAPI.getBookings(params);
            setBookings(response.bookings);
        } catch (error) {
            console.error('Load bookings error:', error);
            if (error.message?.includes('Too many requests')) {
                showError('Too many requests. Please wait a moment before refreshing.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await bookingAPI.cancelBooking(bookingId, 'User requested cancellation');
            loadBookings();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">My Bookings</h1>
                    <p className="page-description">Manage your hotel reservations</p>
                </div>

                <div className="flex gap-2 mb-3">
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('all')}
                    >
                        All Bookings
                    </button>
                    <button
                        className={`btn ${filter === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('upcoming')}
                    >
                        Upcoming
                    </button>
                </div>

                {bookings.length === 0 ? (
                    <div className="card text-center">
                        <h3>No bookings found</h3>
                        <p className="text-muted">Start exploring hotels to make your first booking</p>
                        <Link to="/hotels" className="btn btn-primary">
                            Browse Hotels
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="card">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3>{booking.hotel?.name}</h3>
                                        <p className="text-muted">
                                            Room {booking.room?.roomNumber} - {booking.room?.type}
                                        </p>
                                        <p className="text-small text-muted">
                                            {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-large" style={{ fontWeight: 600, marginTop: '0.5rem' }}>
                                            ${booking.totalPrice}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className={`badge badge-${booking.status === 'confirmed' ? 'success' :
                                            booking.status === 'cancelled' ? 'danger' :
                                                booking.status === 'completed' ? 'primary' : 'warning'
                                            }`}>
                                            {booking.status.toUpperCase()}
                                        </span>
                                        {booking.status === 'pending' && new Date(booking.checkInDate) > new Date() && (
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleCancel(booking._id)}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
