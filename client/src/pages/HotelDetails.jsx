import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hotelAPI } from '../api';

export default function HotelDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHotelAndRooms();
    }, [id]);

    const loadHotelAndRooms = async () => {
        try {
            const [hotelRes, roomsRes] = await Promise.all([
                hotelAPI.getHotel(id),
                hotelAPI.getRooms(id),
            ]);
            setHotel(hotelRes.hotel);
            setRooms(roomsRes.rooms);
        } catch (error) {
            console.error('Load error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    if (!hotel) {
        return <div className="page"><div className="container"><h2>Hotel not found</h2></div></div>;
    }

    return (
        <div className="page">
            <div className="container">
                <div className="card mb-4">
                    <h1>{hotel.name}</h1>
                    <p className="text-muted">{hotel.address}, {hotel.city}, {hotel.country}</p>
                    <p>{hotel.description}</p>
                    <div className="flex gap-2 mt-2">
                        <span className="badge badge-primary">⭐ {hotel.rating}</span>
                        {hotel.amenities?.map((amenity, i) => (
                            <span key={i} className="badge badge-success">{amenity}</span>
                        ))}
                    </div>
                </div>

                <h2 className="mb-3">Available Rooms</h2>
                <div className="grid grid-cols-2">
                    {rooms.map((room) => (
                        <div key={room._id} className="card">
                            <div style={{
                                height: '150px',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                borderRadius: 'var(--radius)',
                                marginBottom: 'var(--spacing-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '2rem'
                            }}>
                                🛏️
                            </div>
                            <h4>Room {room.roomNumber}</h4>
                            <p className="text-muted">{room.type}</p>
                            <p className="text-small">{room.description}</p>
                            <div className="flex justify-between items-center mt-3">
                                <span className="text-large" style={{ fontWeight: 600 }}>
                                    ${room.pricePerNight}/night
                                </span>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate(`/booking/${room._id}`)}
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
