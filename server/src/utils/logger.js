const AuditLog = require('../models/AuditLog');


async function logAudit({ action, userId = null, ipAddress, userAgent, metadata = {}, status = 'success' }) {
    try {
        await AuditLog.create({
            action,
            userId,
            ipAddress,
            userAgent,
            metadata,
            status,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Failed to create audit log:', error.message);
    }
}


function getIpAddress(req) {
    return req.ip || req.connection.remoteAddress || 'unknown';
}


function getUserAgent(req) {
    return req.get('user-agent') || 'unknown';
}

module.exports = {
    logAudit,
    getIpAddress,
    getUserAgent,
};
