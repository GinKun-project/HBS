const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    receiptId: {
        type: String,
        unique: true,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer'],
        default: 'credit_card',
    },
    transactionId: {
        type: String,
        default: null,
    },
    paidAt: {
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

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ booking: 1 });

paymentSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Payment', paymentSchema);
