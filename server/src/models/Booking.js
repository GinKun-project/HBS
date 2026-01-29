const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true,
    },
    checkInDate: {
        type: Date,
        required: true,
    },
    checkOutDate: {
        type: Date,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
    },
    guestCount: {
        type: Number,
        required: true,
        min: 1,
    },
    specialRequests: {
        type: String,
        default: '',
    },
    cancellationReason: {
        type: String,
        default: null,
    },
    cancelledAt: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });

bookingSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Booking', bookingSchema);
