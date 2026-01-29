import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import { useToast } from '../components/Toast';

export default function Admin() {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [hotels, setHotels] = useState([]);
    const [hotelForm, setHotelForm] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        country: '',
        rating: 0,
    });
    const [roomForm, setRoomForm] = useState({
        hotel: '',
        roomNumber: '',
        type: 'Single',
        description: '',
        pricePerNight: 0,
        capacity: 1,
    });
    const [message, setMessage] = useState('');
    const { showError } = useToast();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await adminAPI.getStats();
            setStats(response.stats);
        } catch (error) {
            console.error('Load stats error:', error);
            if (error.message?.includes('Too many requests')) {
                showError('Too many requests. Please wait a moment before refreshing.');
            }
        }
    };

    const handleCreateHotel = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createHotel(hotelForm);
            setMessage('Hotel created successfully');
            setHotelForm({ name: '', description: '', address: '', city: '', country: '', rating: 0 });
            loadStats();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create hotel');
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.createRoom(roomForm);
            setMessage('Room created successfully');
            setRoomForm({ hotel: '', roomNumber: '', type: 'Single', description: '', pricePerNight: 0, capacity: 1 });
            loadStats();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create room');
        }
    };

    return (
        <div className="page">
            <div className="container">
                <h1 className="page-title">Admin Dashboard</h1>

                {message && <div className="alert alert-success">{message}</div>}

                <div className="flex gap-2 mb-4">
                    <button
                        className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        Statistics
                    </button>
                    <button
                        className={`btn ${activeTab === 'hotel' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('hotel')}
                    >
                        Create Hotel
                    </button>
                    <button
                        className={`btn ${activeTab === 'room' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('room')}
                    >
                        Create Room
                    </button>
                </div>

                {activeTab === 'stats' && stats && (
                    <div className="grid grid-cols-4">
                        <div className="card text-center">
                            <h2 style={{ fontSize: '3rem', color: 'var(--primary)' }}>{stats.totalHotels}</h2>
                            <p className="text-muted">Total Hotels</p>
                        </div>
                        <div className="card text-center">
                            <h2 style={{ fontSize: '3rem', color: 'var(--success)' }}>{stats.totalRooms}</h2>
                            <p className="text-muted">Total Rooms</p>
                        </div>
                        <div className="card text-center">
                            <h2 style={{ fontSize: '3rem', color: 'var(--secondary)' }}>{stats.totalBookings}</h2>
                            <p className="text-muted">Total Bookings</p>
                        </div>
                        <div className="card text-center">
                            <h2 style={{ fontSize: '3rem', color: 'var(--warning)' }}>{stats.activeBookings}</h2>
                            <p className="text-muted">Active Bookings</p>
                        </div>
                    </div>
                )}

                {activeTab === 'hotel' && (
                    <div className="card">
                        <h3>Create New Hotel</h3>
                        <form onSubmit={handleCreateHotel}>
                            <div className="grid grid-cols-2">
                                <div className="form-group">
                                    <label className="form-label">Hotel Name</label>
                                    <input type="text" className="form-input" value={hotelForm.name}
                                        onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input type="text" className="form-input" value={hotelForm.city}
                                        onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" rows="3" value={hotelForm.description}
                                    onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2">
                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <input type="text" className="form-input" value={hotelForm.address}
                                        onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Country</label>
                                    <input type="text" className="form-input" value={hotelForm.country}
                                        onChange={(e) => setHotelForm({ ...hotelForm, country: e.target.value })} required />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">Create Hotel</button>
                        </form>
                    </div>
                )}

                {activeTab === 'room' && (
                    <div className="card">
                        <h3>Create New Room</h3>
                        <form onSubmit={handleCreateRoom}>
                            <div className="grid grid-cols-2">
                                <div className="form-group">
                                    <label className="form-label">Hotel ID</label>
                                    <input type="text" className="form-input" value={roomForm.hotel}
                                        onChange={(e) => setRoomForm({ ...roomForm, hotel: e.target.value })}
                                        placeholder="Enter hotel MongoDB ID" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Room Number</label>
                                    <input type="text" className="form-input" value={roomForm.roomNumber}
                                        onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-3">
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select className="form-select" value={roomForm.type}
                                        onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}>
                                        <option>Single</option>
                                        <option>Double</option>
                                        <option>Suite</option>
                                        <option>Deluxe</option>
                                        <option>Presidential</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Price/Night</label>
                                    <input type="number" className="form-input" value={roomForm.pricePerNight}
                                        onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: parseFloat(e.target.value) })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Capacity</label>
                                    <input type="number" className="form-input" value={roomForm.capacity}
                                        onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) })} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" rows="3" value={roomForm.description}
                                    onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })} required />
                            </div>
                            <button type="submit" className="btn btn-primary">Create Room</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
