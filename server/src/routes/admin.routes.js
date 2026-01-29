const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { validate, schemas } = require('../middleware/validate');
const { logAudit, getIpAddress, getUserAgent } = require('../utils/logger');


router.post('/hotels', authenticateToken, requireAdmin, validate(schemas.createHotel), async (req, res) => {
    try {
        const { name, description, address, city, country, rating, amenities, images } = req.body;

        const hotel = new Hotel({
            name,
            description,
            address,
            city,
            country,
            rating: rating || 0,
            amenities: amenities || [],
            images: images || [],
            createdBy: req.user._id,
        });

        await hotel.save();

        await logAudit({
            action: 'HOTEL_CREATED',
            userId: req.user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: { hotelId: hotel._id, name },
            status: 'success',
        });

        res.status(201).json({
            message: 'Hotel created successfully',
            hotel,
        });
    } catch (error) {
        console.error('Create hotel error:', error);
        res.status(500).json({ message: 'Failed to create hotel' });
    }
});


router.put('/hotels/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const updates = req.body;
        updates.updatedAt = Date.now();

        const hotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        await logAudit({
            action: 'HOTEL_UPDATED',
            userId: req.user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: { hotelId: hotel._id, updates: Object.keys(updates) },
            status: 'success',
        });

        res.json({
            message: 'Hotel updated successfully',
            hotel,
        });
    } catch (error) {
        console.error('Update hotel error:', error);
        res.status(500).json({ message: 'Failed to update hotel' });
    }
});


router.delete('/hotels/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.id);

        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        
        await Room.deleteMany({ hotel: req.params.id });

        await logAudit({
            action: 'HOTEL_DELETED',
            userId: req.user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: { hotelId: hotel._id, name: hotel.name },
            status: 'success',
        });

        res.json({ message: 'Hotel and associated rooms deleted successfully' });
    } catch (error) {
        console.error('Delete hotel error:', error);
        res.status(500).json({ message: 'Failed to delete hotel' });
    }
});


router.post('/rooms', authenticateToken, requireAdmin, validate(schemas.createRoom), async (req, res) => {
    try {
        const { hotel, roomNumber, type, description, pricePerNight, capacity, amenities, images } = req.body;

        
        const hotelExists = await Hotel.findById(hotel);
        if (!hotelExists) {
            return res.status(404).json({ message: 'Hotel not found' });
        }

        const room = new Room({
            hotel,
            roomNumber,
            type,
            description,
            pricePerNight,
            capacity,
            amenities: amenities || [],
            images: images || [],
            createdBy: req.user._id,
        });

        await room.save();

        await logAudit({
            action: 'ROOM_CREATED',
            userId: req.user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: { roomId: room._id, hotelId: hotel, roomNumber },
            status: 'success',
        });

        const populatedRoom = await Room.findById(room._id).populate('hotel', 'name city');

        res.status(201).json({
            message: 'Room created successfully',
            room: populatedRoom,
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ message: 'Failed to create room' });
    }
});


router.put('/rooms/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const updates = req.body;
        updates.updatedAt = Date.now();

        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('hotel', 'name city');

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        await logAudit({
            action: 'ROOM_UPDATED',
            userId: req.user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: { roomId: room._id, updates: Object.keys(updates) },
            status: 'success',
        });

        res.json({
            message: 'Room updated successfully',
            room,
        });
    } catch (error) {
        console.error('Update room error:', error);
        res.status(500).json({ message: 'Failed to update room' });
    }
});


router.delete('/rooms/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        await logAudit({
            action: 'ROOM_DELETED',
            userId: req.user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: { roomId: room._id, roomNumber: room.roomNumber },
            status: 'success',
        });

        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({ message: 'Failed to delete room' });
    }
});


router.get('/bookings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, hotel } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (hotel) filter.hotel = hotel;

        const bookings = await Booking.find(filter)
            .populate('user', 'email fullName')
            .populate('room', 'roomNumber type')
            .populate('hotel', 'name city')
            .sort({ createdAt: -1 });

        res.json({ bookings });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ message: 'Failed to get bookings' });
    }
});


router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalHotels = await Hotel.countDocuments();
        const totalRooms = await Room.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const activeBookings = await Booking.countDocuments({
            status: { $in: ['pending', 'confirmed'] },
        });

        res.json({
            stats: {
                totalHotels,
                totalRooms,
                totalBookings,
                activeBookings,
            },
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Failed to get statistics' });
    }
});

module.exports = router;
