const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const { sanitizeInput } = require('./middleware/validate');
const { csrfProtection, sendCsrfToken, csrfErrorHandler } = require('./middleware/csrf');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');


const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const hotelRoutes = require('./routes/hotel.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();


app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
}));


app.use(cors({
    origin: config.nodeEnv === 'production'
        ? 'https://yourdomain.com'
        : 'http://localhost:5173',
    credentials: true,
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());


app.use(sanitizeInput);


app.use(csrfProtection);
app.use(sendCsrfToken);


app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);


app.use(csrfErrorHandler);


app.use(notFoundHandler);


app.use(errorHandler);

module.exports = app;
