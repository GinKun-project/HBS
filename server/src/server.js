const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');


connectDB();


const PORT = config.port;
app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🚀 Hotel Booking System Server');
    console.log('========================================');
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Server running on port ${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log('========================================\n');
});


process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    process.exit(0);
});
