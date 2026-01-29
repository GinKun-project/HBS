
function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message,
        }));

        return res.status(400).json({
            message: 'Validation error',
            errors,
        });
    }

    
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            message: `${field} already exists`,
            field,
        });
    }

    
    if (err.name === 'CastError') {
        return res.status(400).json({
            message: 'Invalid ID format',
            field: err.path,
        });
    }

    
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
    }

    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}


function notFoundHandler(req, res) {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl,
    });
}

module.exports = {
    errorHandler,
    notFoundHandler,
};
