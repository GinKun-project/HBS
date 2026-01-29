const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },

    passwordHistory: [{
        type: String,
    }],
    lastPasswordChange: {
        type: Date,
        default: Date.now,
    },
    passwordExpired: {
        type: Boolean,
        default: false,
    },

    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: {
        type: Date,
        default: null,
    },

    mfaSecret: {
        type: String,
        default: null,
    },
    mfaEnabled: {
        type: Boolean,
        default: false,
    },
    otpHash: {
        type: String,
        default: null,
    },
    otpExpiry: {
        type: Date,
        default: null,
    },

    refreshToken: {
        type: String,
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

userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incLoginAttempts = async function () {
    const config = require('../config/env');

    if (this.lockUntil && this.lockUntil < Date.now()) {
        return await this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 },
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    if (this.loginAttempts + 1 >= config.security.maxLoginAttempts && !this.isLocked) {
        updates.$set = {
            lockUntil: Date.now() + (config.security.lockoutDurationMinutes * 60 * 1000)
        };
    }

    return await this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function () {
    return await this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 },
    });
};

module.exports = mongoose.model('User', userSchema);
