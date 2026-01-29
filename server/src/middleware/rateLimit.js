const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const config = require('../config/env');


const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});


const mfaLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many MFA verification attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});


const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many password reset attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});


const bookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many booking attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Conditional middleware: apply authLimiter only when a user has reached max failed login attempts
async function conditionalAuthLimiter(req, res, next) {
    try {
        const email = req.body?.email;
        if (!email) return next();

        const user = await User.findOne({ email }).select('loginAttempts');
        if (!user) return next();

        const maxAttempts = config.security?.maxLoginAttempts ?? 5;
        if ((user.loginAttempts || 0) >= maxAttempts) {
            // Apply the authLimiter middleware
            return authLimiter(req, res, next);
        }

        return next();
    } catch (err) {
        console.error('conditionalAuthLimiter error:', err);
        return next();
    }
}

module.exports = {
    apiLimiter,
    authLimiter,
    mfaLimiter,
    passwordResetLimiter,
    bookingLimiter,
    conditionalAuthLimiter,
};
