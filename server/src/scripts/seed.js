require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const connectDB = require('../config/db');

async function seed() {
    try {
        await connectDB();

        console.log('\n🌱 Starting database seeding...\n');

        
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Hotel.deleteMany({});
        await Room.deleteMany({});
        console.log('✅ Existing data cleared\n');

        
        console.log('Creating admin user...');
        const adminPassword = 'Admin@123456';
        const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

        const admin = new User({
            email: 'admin@hotel.com',
            password: adminPassword, 
            fullName: 'System Administrator',
            role: 'admin',
            passwordHistory: [],
            lastPasswordChange: new Date(),
        });

        await admin.save();
        
        await User.findByIdAndUpdate(admin._id, {
            $push: { passwordHistory: admin.password }
        });

        console.log('✅ Admin user created');
        console.log('   Email: admin@hotel.com');
        console.log('   Password: Admin@123456\n');

        
        console.log('Creating regular user...');
        const userPassword = 'User@1234567';

        const user = new User({
            email: 'user@example.com',
            password: userPassword,
            fullName: 'John Doe',
            role: 'user',
            passwordHistory: [],
            lastPasswordChange: new Date(),
        });

        await user.save();
        
        await User.findByIdAndUpdate(user._id, {
            $push: { passwordHistory: user.password }
        });

        console.log('✅ Regular user created');
        console.log('   Email: user@example.com');
        console.log('   Password: User@1234567\n');

        
        console.log('Creating hotels...');

        const hotel1 = new Hotel({
            name: 'Grand Plaza Hotel',
            description: 'Luxurious 5-star hotel in the heart of the city with stunning views, world-class amenities, and exceptional service. Perfect for business and leisure travelers.',
            address: '123 Main Street',
            city: 'New York',
            country: 'USA',
            rating: 4.8,
            amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa', 'Bar', 'Room Service', 'Parking'],
            images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
            createdBy: admin._id,
        });

        await hotel1.save();
        console.log('✅ Hotel 1 created: Grand Plaza Hotel');

        const hotel2 = new Hotel({
            name: 'Seaside Resort & Spa',
            description: 'Beautiful beachfront resort offering relaxation and adventure. Enjoy pristine beaches, water sports, fine dining, and luxurious spa treatments.',
            address: '456 Ocean Drive',
            city: 'Miami',
            country: 'USA',
            rating: 4.6,
            amenities: ['WiFi', 'Beach Access', 'Pool', 'Spa', 'Restaurant', 'Water Sports', 'Kids Club'],
            images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4'],
            createdBy: admin._id,
        });

        await hotel2.save();
        console.log('✅ Hotel 2 created: Seaside Resort & Spa\n');

        
        console.log('Creating rooms for Grand Plaza Hotel...');

        const hotel1Rooms = [
            {
                hotel: hotel1._id,
                roomNumber: '101',
                type: 'Single',
                description: 'Cozy single room with city view, perfect for solo travelers. Includes comfortable bed, work desk, and modern amenities.',
                pricePerNight: 150,
                capacity: 1,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe'],
                images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32'],
                createdBy: admin._id,
            },
            {
                hotel: hotel1._id,
                roomNumber: '201',
                type: 'Double',
                description: 'Spacious double room with king-size bed and panoramic city views. Ideal for couples or business travelers.',
                pricePerNight: 250,
                capacity: 2,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe', 'Bathtub', 'Coffee Maker'],
                images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427'],
                createdBy: admin._id,
            },
            {
                hotel: hotel1._id,
                roomNumber: '301',
                type: 'Suite',
                description: 'Luxurious suite with separate living area, premium furnishings, and breathtaking views. Ultimate comfort and elegance.',
                pricePerNight: 450,
                capacity: 4,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe', 'Jacuzzi', 'Living Room', 'Kitchen'],
                images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
                createdBy: admin._id,
            },
        ];

        for (const roomData of hotel1Rooms) {
            const room = new Room(roomData);
            await room.save();
            console.log(`✅ Room ${roomData.roomNumber} created (${roomData.type})`);
        }

        
        console.log('\nCreating rooms for Seaside Resort & Spa...');

        const hotel2Rooms = [
            {
                hotel: hotel2._id,
                roomNumber: 'A101',
                type: 'Double',
                description: 'Ocean-view double room with private balcony. Wake up to the sound of waves and stunning sunrise views.',
                pricePerNight: 200,
                capacity: 2,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Balcony', 'Ocean View', 'Mini Fridge'],
                images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39'],
                createdBy: admin._id,
            },
            {
                hotel: hotel2._id,
                roomNumber: 'B201',
                type: 'Deluxe',
                description: 'Deluxe beachfront room with direct beach access, premium amenities, and spectacular ocean views.',
                pricePerNight: 350,
                capacity: 3,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Balcony', 'Ocean View', 'Beach Access', 'Coffee Maker'],
                images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304'],
                createdBy: admin._id,
            },
            {
                hotel: hotel2._id,
                roomNumber: 'P301',
                type: 'Presidential',
                description: 'Presidential suite with panoramic ocean views, private pool, butler service, and ultimate luxury amenities.',
                pricePerNight: 800,
                capacity: 6,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Pool', 'Ocean View', 'Butler Service', 'Kitchen', 'Jacuzzi'],
                images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461'],
                createdBy: admin._id,
            },
        ];

        for (const roomData of hotel2Rooms) {
            const room = new Room(roomData);
            await room.save();
            console.log(`✅ Room ${roomData.roomNumber} created (${roomData.type})`);
        }

        console.log('\n========================================');
        console.log('✅ Database seeding completed!');
        console.log('========================================');
        console.log('\n📊 Summary:');
        console.log(`   Users: 2 (1 admin, 1 regular)`);
        console.log(`   Hotels: 2`);
        console.log(`   Rooms: 6 (3 per hotel)`);
        console.log('\n🔐 Login Credentials:');
        console.log('\nAdmin:');
        console.log('   Email: admin@hotel.com');
        console.log('   Password: Admin@123456');
        console.log('\nUser:');
        console.log('   Email: user@example.com');
        console.log('   Password: User@1234567');
        console.log('\n========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seed();
