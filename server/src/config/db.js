const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodbUri);
        console.log('MongoDB connected successfully');
        console.log(`Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
