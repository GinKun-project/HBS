import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelAPI, bookingAPI, paymentAPI } from '../api';

export default function BookingForm() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [formData, setFormData] = useState({
        checkInDate: '',
        checkOutDate: '',
        guestCount: 1,
        specialRequests: '',
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadRoom();
    }, [roomId]);

    const loadRoom = async () => {
        try {
            const response = await hotelAPI.getRoom(roomId);
            setRoom(response.room);
        } catch (error) {
            setError('Failed to load room details');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!formData.checkInDate || !formData.checkOutDate || !room) return 0;
        const checkIn = new Date(formData.checkInDate);
        const checkOut = new Date(formData.checkOutDate);
        const hours = (checkOut - checkIn) / (1000 * 60 * 60);
        const nights = Math.ceil(hours / 24);
        return nights * room.pricePerNight;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            
            const bookingRes = await bookingAPI.createBooking({
                room: roomId,
                ...formData,
            });

            
            const paymentRes = await paymentAPI.createPayment({
                booking: bookingRes.booking._id,
                paymentMethod: 'credit_card',
            });

            alert(`Booking confirmed! Receipt ID: ${paymentRes.payment.receiptId}`);
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.message || 'Booking failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;
    if (!room) return <div className="page"><div className="container"><h2>Room not found</h2></div></div>;

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <h1 className="page-title">Book Your Stay</h1>

                <div className="grid grid-cols-2 mb-4">
                    <div className="card">
                        <h3>{room.hotel?.name}</h3>
                        <p className="text-muted">Room {room.roomNumber} - {room.type}</p>
                        <p className="text-large" style={{ fontWeight: 600, marginTop: '1rem' }}>
                            ${room.pricePerNight} per night
                        </p>
                        <p className="text-small text-muted">Capacity: {room.capacity} guests</p>
                    </div>

                    <div className="card">
                        <h4>Total Amount</h4>
                        <p className="text-large" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                            ${calculateTotal()}
                        </p>
                        <p className="text-small text-muted">
                            {formData.checkInDate && formData.checkOutDate ?
                                `${Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24))} nights` :
                                'Select dates'}
                        </p>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2">
                            <div className="form-group">
                                <label className="form-label">Check-in Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    value={formData.checkInDate}
                                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                                    min={new Date().toISOString().slice(0, 16)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Check-out Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    value={formData.checkOutDate}
                                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                                    min={formData.checkInDate}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Number of Guests</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.guestCount}
                                onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
                                min="1"
                                max={room.capacity}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Special Requests (Optional)</label>
                            <textarea
                                className="form-textarea"
                                rows="3"
                                value={formData.specialRequests}
                                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                                placeholder="Any special requirements..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={submitting || !formData.checkInDate || !formData.checkOutDate}
                            style={{ width: '100%' }}
                        >
                            {submitting ? 'Processing...' : `Confirm & Pay $${calculateTotal()}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
