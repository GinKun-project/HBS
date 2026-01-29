const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { bookingLimiter } = require('../middleware/rateLimit');
const { validateBookingDates, hasOverlap } = require('../utils/overlapCheck');
const { logAudit, getIpAddress, getUserAgent } = require('../utils/logger');


router.post('/', authenticateToken, bookingLimiter, validate(schemas.createBooking), async (req, res) => {
    try {
        const { room: roomId, checkInDate, checkOutDate, guestCount, specialRequests } = req.body;

        
        const dateValidation = validateBookingDates(checkInDate, checkOutDate);
        if (!dateValidation.isValid) {
            return res.status(400).json({
                message: 'Invalid booking dates',
                errors: dateValidation.errors,
            });
        }

        
        const room = await Room.findById(roomId).populate('hotel');
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (!room.isAvailable) {
            return res.status(400).json({ message: 'Room is not available' });
        }

        
        if (guestCount > room.capacity) {
            return res.status(400).json({
                message: `Room capacity is ${room.capacity} guests`,
            });
        }

        
        const existingBookings = await Booking.find({
            room: roomId,
            status: { $in: ['pending', 'confirmed'] },
        });

        if (hasOverlap(checkInDate, checkOutDate, existingBookings)) {
            await logAudit({
                action: 'BOOKING_FAILED',
                userId: req.user._id,
                ipAddress: getIpAddress(req),
                userAgent: getUserAgent(req),
                metadata: { roomId, reason: 'Room not available for selected dates' },
                status: 'failure',
            });

            return res.status(409).json({
                message: 'Room is not available for the selected dates',
            });
        }

        
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const hours = (checkOut - checkIn) / (1000 * 60 * 60);
        const nights = Math.ceil(hours / 24);
        const totalPrice = nights * room.pricePerNight;

        
        const booking = new Booking({
            user: req.user._id,
            room: roomId,
            hotel: room.hotel._id,
            checkInDate,
            checkOutDate,
            totalPrice,
            guestCount,
            specialRequests: specialRequests || '',
            status: 'pending',
        });

        await booking.save();

        await logAudit({
            action: 'BOOKING_CREATED',
            userId: req.user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: { bookingId: booking._id, roomId, totalPrice },
            status: 'success',
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('room', 'roomNumber type pricePerNight')
            .populate('hotel', 'name city country');

        res.status(201).json({
            message: 'Booking created successfully',
            booking: populatedBooking,
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: 'Failed to create booking' });
    }
});


router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, upcoming } = req.query;
        const filter = { user: req.user._id };

        if (status) {
            filter.status = status;
        }

        if (upcoming === 'true') {
            filter.checkInDate = { $gte: new Date() };
            filter.status = { $in: ['pending', 'confirmed'] };
        }

        const bookings = await Booking.find(filter)
            .populate('room', 'roomNumber type pricePerNight images')
            .populate('hotel', 'name city country address')
            .sort({ checkInDate: -1 });

        res.json({ bookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ message: 'Failed to get bookings' });
    }
});


router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('room', 'roomNumber type pricePerNight images amenities')
            .populate('hotel', 'name city country address');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        
        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({ booking });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ message: 'Failed to get booking' });
    }
});


router.post('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const { cancellationReason } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        
        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({ message: 'Cannot cancel completed booking' });
        }

        
        if (new Date() >= new Date(booking.checkInDate)) {
            return res.status(400).json({
                message: 'Cannot cancel booking after check-in date',
            });
        }

        
        booking.status = 'cancelled';
        booking.cancellationReason = cancellationReason || 'User requested cancellation';
        booking.cancelledAt = new Date();
        await booking.save();

        await logAudit({
            action: 'BOOKING_CANCELLED',
            userId: req.user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: { bookingId: booking._id, reason: cancellationReason },
            status: 'success',
        });

        res.json({
            message: 'Booking cancelled successfully',
            booking,
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ message: 'Failed to cancel booking' });
    }
});

module.exports = router;
