const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const config = require('../config/env');
const { validatePasswordStrength } = require('../utils/passwordPolicy');
const { logAudit, getIpAddress, getUserAgent } = require('../utils/logger');
const { validate, schemas } = require('../middleware/validate');
const { conditionalAuthLimiter } = require('../middleware/rateLimit');
const { authenticateToken } = require('../middleware/auth');


router.post('/signup', validate(schemas.signup), async (req, res) => {
    try {
        const { email, password, fullName, phoneNumber } = req.body;

        
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                message: 'Password does not meet requirements',
                errors: passwordValidation.errors,
            });
        }

        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            await logAudit({
                action: 'SIGNUP_FAILED',
                ipAddress: getIpAddress(req),
                userAgent: getUserAgent(req),
                metadata: { email, reason: 'Email already exists' },
                status: 'failure',
            });

            return res.status(409).json({ message: 'Email already registered' });
        }

        
        let encryptedPhone = null;
        if (phoneNumber) {
            const { encrypt } = require('../utils/crypto');
            encryptedPhone = encrypt(phoneNumber);
        }

        
        const user = new User({
            email,
            password, 
            fullName,
            phoneNumber: encryptedPhone,
            passwordHistory: [password], 
        });

        await user.save();

        
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpHash = await bcrypt.hash(otp, 10);

        user.otpHash = otpHash;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 
        await user.save();

        
        console.log('\n========================================');
        console.log('📧 MFA OTP for', email);
        console.log('OTP:', otp);
        console.log('Expires in 10 minutes');
        console.log('========================================\n');

        await logAudit({
            action: 'SIGNUP_SUCCESS',
            userId: user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: { email },
            status: 'success',
        });

        res.status(201).json({
            message: 'User registered successfully. Please verify OTP sent to your email.',
            email: user.email,
            requiresMfa: true,
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});


router.post('/verify-mfa', validate(schemas.verifyMfa), async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            await logAudit({
                action: 'MFA_VERIFICATION_FAILED',
                ipAddress: getIpAddress(req),
                userAgent: getUserAgent(req),
                metadata: { email, reason: 'User not found' },
                status: 'failure',
            });

            return res.status(401).json({ message: 'Invalid credentials' });
        }

        
        if (!user.otpHash || !user.otpExpiry) {
            return res.status(400).json({ message: 'No OTP found. Please login again.' });
        }

        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please login again.' });
        }

        
        const isValidOtp = await bcrypt.compare(otp, user.otpHash);
        if (!isValidOtp) {
            await user.incLoginAttempts();

            await logAudit({
                action: 'MFA_VERIFICATION_FAILED',
                userId: user._id,
                ipAddress: getIpAddress(req),
                userAgent: getUserAgent(req),
                metadata: { email, reason: 'Invalid OTP' },
                status: 'failure',
            });

            return res.status(401).json({ message: 'Invalid OTP' });
        }

        
        user.otpHash = null;
        user.otpExpiry = null;
        user.mfaEnabled = true;
        await user.resetLoginAttempts();

        
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            config.jwt.accessSecret,
            { expiresIn: config.jwt.accessExpiry }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            config.jwt.refreshSecret,
            { expiresIn: config.jwt.refreshExpiry }
        );

        
        user.refreshToken = refreshToken;
        await user.save();

        
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, 
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });

        await logAudit({
            action: 'MFA_VERIFICATION_SUCCESS',
            userId: user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: { email },
            status: 'success',
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('MFA verification error:', error);
        res.status(500).json({ message: 'MFA verification failed' });
    }
});


router.post('/login', conditionalAuthLimiter, validate(schemas.login), async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            await logAudit({
                action: 'LOGIN_FAILED',
                ipAddress: getIpAddress(req),
                userAgent: getUserAgent(req),
                metadata: { email, reason: 'User not found' },
                status: 'failure',
            });

            return res.status(401).json({ message: 'Invalid credentials' });
        }

        
        if (user.isLocked) {
            await logAudit({
                action: 'LOGIN_FAILED',
                userId: user._id,
                ipAddress: getIpAddress(req),
                userAgent: getUserAgent(req),
                metadata: { email, reason: 'Account locked' },
                status: 'failure',
            });

            return res.status(403).json({
                message: 'Account is locked due to multiple failed login attempts',
                lockUntil: user.lockUntil,
            });
        }

        
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            await user.incLoginAttempts();

            await logAudit({
                action: 'LOGIN_FAILED',
                userId: user._id,
                ipAddress: getIpAddress(req),
                userAgent: getUserAgent(req),
                metadata: { email, reason: 'Invalid password' },
                status: 'failure',
            });

            return res.status(401).json({ message: 'Invalid credentials' });
        }

        
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpHash = await bcrypt.hash(otp, 10);

        user.otpHash = otpHash;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 
        await user.save();

        
        console.log('\n========================================');
        console.log('📧 MFA OTP for', email);
        console.log('OTP:', otp);
        console.log('Expires in 10 minutes');
        console.log('========================================\n');

        await logAudit({
            action: 'LOGIN_OTP_SENT',
            userId: user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: { email },
            status: 'success',
        });

        res.json({
            message: 'OTP sent to your email. Please verify to complete login.',
            email: user.email,
            requiresMfa: true,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});


router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token required' });
        }

        const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
        const user = await User.findById(decoded.userId);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        
        const accessToken = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            config.jwt.accessSecret,
            { expiresIn: config.jwt.accessExpiry }
        );

        
        const newRefreshToken = jwt.sign(
            { userId: user._id },
            config.jwt.refreshSecret,
            { expiresIn: config.jwt.refreshExpiry }
        );

        user.refreshToken = newRefreshToken;
        await user.save();

        
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: config.nodeEnv === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ message: 'Token refresh failed' });
    }
});


router.post('/logout', authenticateToken, async (req, res) => {
    try {
        
        await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

        
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        await logAudit({
            action: 'LOGOUT',
            userId: req.user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: { email: req.user.email },
            status: 'success',
        });

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Logout failed' });
    }
});


router.get('/me', authenticateToken, async (req, res) => {
    try {
        
        let phoneNumber = null;
        if (req.user.phoneNumber) {
            const { decrypt } = require('../utils/crypto');
            phoneNumber = decrypt(req.user.phoneNumber);
        }

        res.json({
            user: {
                id: req.user._id,
                email: req.user.email,
                fullName: req.user.fullName,
                phoneNumber,
                role: req.user.role,
                passwordExpired: req.user.passwordExpired,
                createdAt: req.user.createdAt,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Failed to get user info' });
    }
});

module.exports = router;
