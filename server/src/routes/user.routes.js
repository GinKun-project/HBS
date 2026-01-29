const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { validatePasswordStrength } = require('../utils/passwordPolicy');
const { encrypt, decrypt } = require('../utils/crypto');
const { logAudit, getIpAddress, getUserAgent } = require('../utils/logger');


router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -passwordHistory -refreshToken -otpHash');

        
        let phoneNumber = null;
        if (user.phoneNumber) {
            phoneNumber = decrypt(user.phoneNumber);
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber,
                role: user.role,
                passwordExpired: user.passwordExpired,
                lastPasswordChange: user.lastPasswordChange,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to get profile' });
    }
});


router.put('/profile', authenticateToken, validate(schemas.updateProfile), async (req, res) => {
    try {
        const { fullName, phoneNumber } = req.body;
        const updates = {};

        if (fullName) {
            updates.fullName = fullName;
        }

        if (phoneNumber !== undefined) {
            
            updates.phoneNumber = phoneNumber ? encrypt(phoneNumber) : null;
        }

        updates.updatedAt = Date.now();

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password -passwordHistory -refreshToken -otpHash');

        await logAudit({
            action: 'PROFILE_UPDATE',
            userId: req.user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: { updates: Object.keys(updates) },
            status: 'success',
        });

        
        let decryptedPhone = null;
        if (user.phoneNumber) {
            decryptedPhone = decrypt(user.phoneNumber);
        }

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                phoneNumber: decryptedPhone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});


router.post('/change-password', authenticateToken, validate(schemas.changePassword), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);

        
        const isValidPassword = await user.comparePassword(currentPassword);
        if (!isValidPassword) {
            await logAudit({
                action: 'PASSWORD_CHANGE_FAILED',
                userId: req.user._id,
                ipAddress: getIpAddress(req),
                userAgent: getUserAgent(req),
                metadata: { reason: 'Invalid current password' },
                status: 'failure',
            });

            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                message: 'New password does not meet requirements',
                errors: passwordValidation.errors,
            });
        }

        
        const passwordHistory = user.passwordHistory.slice(-3);
        for (const oldPasswordHash of passwordHistory) {
            const isReused = await bcrypt.compare(newPassword, oldPasswordHash);
            if (isReused) {
                await logAudit({
                    action: 'PASSWORD_CHANGE_FAILED',
                    userId: req.user._id,
                    ipAddress: getIpAddress(req),
                    userAgent: getUserAgent(req),
                    metadata: { reason: 'Password reuse detected' },
                    status: 'failure',
                });

                return res.status(400).json({
                    message: 'Cannot reuse any of your last 3 passwords',
                });
            }
        }

        
        user.password = newPassword; 
        user.lastPasswordChange = Date.now();
        user.passwordExpired = false;

        await user.save();

        
        user.passwordHistory.push(user.password);
        
        if (user.passwordHistory.length > 3) {
            user.passwordHistory = user.passwordHistory.slice(-3);
        }
        await user.save();

        await logAudit({
            action: 'PASSWORD_CHANGE_SUCCESS',
            userId: req.user._id,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            metadata: {},
            status: 'success',
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Failed to change password' });
    }
});

module.exports = router;
