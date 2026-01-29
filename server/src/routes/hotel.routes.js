const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const { optionalAuth } = require('../middleware/auth');


router.get('/', optionalAuth, async (req, res) => {
    try {
        const { city, country, minRating, search } = req.query;
        const filter = {};

        if (city) filter.city = new RegExp(city, 'i');
        if (country) filter.country = new RegExp(country, 'i');
        if (minRating) filter.rating = { $gte: parseFloat(minRating) };
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
            ];
        }

        const hotels = await Hotel.find(filter)
            .select('-createdBy')
            .sort({ rating: -1, createdAt: -1 });

        res.json({ hotels });
    } catch (error) {
        console.error('Get hotels error:', error);
        res.status(500).json({ message: 'Failed to get hotels' });
    }
});


router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id).select('-createdBy');

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        res.json({ hotel });
    } catch (error) {
        console.error('Get hotel error:', error);
        res.status(500).json({ message: 'Failed to get hotel' });
    }
});


router.get('/:id/rooms', optionalAuth, async (req, res) => {
    try {
        const { type, minPrice, maxPrice, minCapacity } = req.query;
        const filter = { hotel: req.params.id, isAvailable: true };

        if (type) filter.type = type;
        if (minPrice) filter.pricePerNight = { $gte: parseFloat(minPrice) };
        if (maxPrice) {
            filter.pricePerNight = filter.pricePerNight || {};
            filter.pricePerNight.$lte = parseFloat(maxPrice);
        }
        if (minCapacity) filter.capacity = { $gte: parseInt(minCapacity) };

        const rooms = await Room.find(filter)
            .populate('hotel', 'name city country')
            .select('-createdBy')
            .sort({ pricePerNight: 1 });

        res.json({ rooms });
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({ message: 'Failed to get rooms' });
    }
});


router.get('/rooms/:roomId', optionalAuth, async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId)
            .populate('hotel', 'name description address city country rating amenities')
            .select('-createdBy');

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json({ room });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({ message: 'Failed to get room' });
    }
});

module.exports = router;
