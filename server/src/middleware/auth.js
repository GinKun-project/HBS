const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { isPasswordExpired } = require('../utils/passwordPolicy');


async function authenticateToken(req, res, next) {
    try {
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        const decoded = jwt.verify(token, config.jwt.accessSecret);

        
        const user = await User.findById(decoded.userId).select('-password -passwordHistory -refreshToken');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        
        if (user.isLocked) {
            return res.status(403).json({
                message: 'Account is locked due to multiple failed login attempts',
                lockUntil: user.lockUntil,
            });
        }

        
        if (isPasswordExpired(user.lastPasswordChange)) {
            user.passwordExpired = true;
            await user.save();

            return res.status(403).json({
                message: 'Password has expired. Please change your password.',
                passwordExpired: true,
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Access token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid access token' });
        }
        return res.status(500).json({ message: 'Authentication error' });
    }
}


async function optionalAuth(req, res, next) {
    try {
        const token = req.cookies.accessToken;

        if (token) {
            const decoded = jwt.verify(token, config.jwt.accessSecret);
            const user = await User.findById(decoded.userId).select('-password -passwordHistory -refreshToken');
            req.user = user;
        }

        next();
    } catch (error) {
        
        next();
    }
}

module.exports = {
    authenticateToken,
    optionalAuth,
};
