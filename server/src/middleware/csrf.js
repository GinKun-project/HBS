const csrf = require('csurf');
const config = require('../config/env');


const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
});


function sendCsrfToken(req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: false, 
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
    });
    next();
}


function csrfErrorHandler(err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ message: 'Invalid CSRF token' });
    }
    next(err);
}

module.exports = {
    csrfProtection,
    sendCsrfToken,
    csrfErrorHandler,
};
