const crypto = require('crypto');
const config = require('../config/env');


const ENCRYPTION_KEY = Buffer.from(config.encryptionKey.padEnd(32, '0').slice(0, 32));
const ALGORITHM = 'aes-256-gcm';


function encrypt(text) {
    if (!text) return null;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}


function decrypt(encryptedText) {
    if (!encryptedText) return null;

    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error.message);
        return null;
    }
}

module.exports = { encrypt, decrypt };
