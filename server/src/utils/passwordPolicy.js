const config = require('../config/env');

function validatePasswordStrength(password) {
    const errors = [];

    if (!password || password.length < 12) {
        errors.push('Password must be at least 12 characters long');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

function calculatePasswordStrength(password) {
    let score = 0;

    if (!password) return 0;

    score += Math.min(password.length * 2, 30);

    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;

    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 30);

    return Math.min(score, 100);
}

function isPasswordExpired(lastPasswordChange) {
    if (!lastPasswordChange) return true;

    const expiryDate = new Date(lastPasswordChange);
    expiryDate.setDate(expiryDate.getDate() + config.security.passwordExpiryDays);

    return new Date() > expiryDate;
}

function getPasswordStrengthLabel(score) {
    if (score < 30) return 'Weak';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Good';
    return 'Strong';
}

module.exports = {
    validatePasswordStrength,
    calculatePasswordStrength,
    isPasswordExpired,
    getPasswordStrengthLabel,
};
