const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { logAudit, getIpAddress, getUserAgent } = require('../utils/logger');


router.post('/', authenticateToken, validate(schemas.createPayment), async (req, res) => {
    try {
        const { booking: bookingId, paymentMethod } = req.body;

        
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        
        if (booking.user.toString() !== req.user._id.toString()) {
            await logAudit({
                action: 'PAYMENT_FAILED',
                userId: req.user._id,
                ipAddress: getIpAddress(req),
                userAgent: getUserAgent(req),
                metadata: { bookingId, reason: 'Unauthorized access' },
                status: 'failure',
            });

            return res.status(403).json({ message: 'Access denied: not your booking' });
        }

        
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot pay for cancelled booking' });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({ message: 'Booking already completed' });
        }

        
        const existingPayment = await Payment.findOne({
            booking: bookingId,
            status: { $in: ['paid', 'pending'] },
        });

        if (existingPayment) {
            return res.status(400).json({
                message: 'Payment already exists for this booking',
                payment: existingPayment,
            });
        }

        
        const amount = booking.totalPrice;

        
        const receiptId = `RCP-${Date.now()}-${uuidv4().split('-')[0].toUpperCase()}`;

        
        const payment = new Payment({
            booking: bookingId,
            user: req.user._id,
            amount,
            status: 'pending',
            receiptId,
            paymentMethod,
        });

        await payment.save();

        
        
        payment.status = 'paid';
        payment.paidAt = new Date();
        payment.transactionId = `TXN-${Date.now()}-${uuidv4().split('-')[0]}`;
        await payment.save();

        
        booking.status = 'confirmed';
        await booking.save();

        await logAudit({
            action: 'PAYMENT_COMPLETED',
            userId: req.user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: {
                bookingId,
                paymentId: payment._id,
                amount,
                receiptId,
            },
            status: 'success',
        });

        const populatedPayment = await Payment.findById(payment._id)
            .populate({
                path: 'booking',
                populate: [
                    { path: 'room', select: 'roomNumber type' },
                    { path: 'hotel', select: 'name city' },
                ],
            });

        res.status(201).json({
            message: 'Payment processed successfully',
            payment: populatedPayment,
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ message: 'Payment processing failed' });
    }
});


router.get('/', authenticateToken, async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .populate({
                path: 'booking',
                populate: [
                    { path: 'room', select: 'roomNumber type' },
                    { path: 'hotel', select: 'name city' },
                ],
            })
            .sort({ createdAt: -1 });

        res.json({ payments });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ message: 'Failed to get payments' });
    }
});


router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate({
                path: 'booking',
                populate: [
                    { path: 'room', select: 'roomNumber type pricePerNight' },
                    { path: 'hotel', select: 'name city country address' },
                ],
            });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        
        if (payment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({ payment });
    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({ message: 'Failed to get payment' });
    }
});

module.exports = router;
