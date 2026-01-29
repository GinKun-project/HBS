import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { hotelAPI } from '../api';
import { useToast } from '../components/Toast';

export default function Hotels() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { showError } = useToast();

    const loadHotels = async (searchQuery) => {
        try {
            setLoading(true);
            const response = await hotelAPI.getHotels({ search: searchQuery });
            setHotels(response.hotels);
        } catch (error) {
            console.error('Load hotels error:', error);
            if (error.message?.includes('Too many requests')) {
                showError('Too many requests. Please wait a moment and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHotels('');
    }, []);

    useEffect(() => {
        if (search === '') return;

        const timer = setTimeout(() => {
            loadHotels(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadHotels(search);
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Explore Hotels</h1>
                    <p className="page-description">Find your perfect stay</p>
                </div>

                <form onSubmit={handleSearch} className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search hotels by name or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">
                            Search
                        </button>
                    </div>
                </form>

                <div className="grid grid-cols-3">
                    {hotels.map((hotel) => (
                        <Link to={`/hotels/${hotel._id}`} key={hotel._id} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{
                                height: '200px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 'var(--radius)',
                                marginBottom: 'var(--spacing-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '3rem'
                            }}>
                                🏨
                            </div>
                            <h3>{hotel.name}</h3>
                            <p className="text-muted text-small">
                                {hotel.city}, {hotel.country}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                                <span>⭐ {hotel.rating || 'N/A'}</span>
                                <span className="btn btn-sm btn-primary">View Rooms</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
