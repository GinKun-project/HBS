const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true,
    },
    roomNumber: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['Single', 'Double', 'Suite', 'Deluxe', 'Presidential'],
    },
    description: {
        type: String,
        required: true,
    },
    pricePerNight: {
        type: Number,
        required: true,
        min: 0,
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
    },
    amenities: [{
        type: String,
    }],
    images: [{
        type: String,
    }],
    isAvailable: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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

roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

roomSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Room', roomSchema);
