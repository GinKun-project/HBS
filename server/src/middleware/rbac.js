
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Insufficient permissions',
                requiredRole: allowedRoles,
                userRole: req.user.role,
            });
        }

        next();
    };
}


function requireAdmin(req, res, next) {
    return requireRole('admin')(req, res, next);
}


function requireOwnership(paramName = 'userId') {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const resourceUserId = req.params[paramName] || req.body[paramName];

        
        if (req.user.role === 'admin') {
            return next();
        }

        
        if (resourceUserId !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied: not the owner' });
        }

        next();
    };
}

module.exports = {
    requireRole,
    requireAdmin,
    requireOwnership,
};
