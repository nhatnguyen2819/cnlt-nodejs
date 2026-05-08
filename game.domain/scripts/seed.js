const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/User');
const Room = require('../src/models/Room');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for Seeding');

        // Clear existing data
        await User.deleteMany({});
        await Room.deleteMany({});
        console.log('Cleared existing data');

        // Create Users
        const users = [];
        for (let i = 1; i <= 20; i++) {
            users.push({
                username: `Player${i}`,
                wins: Math.floor(Math.random() * 50),
                totalMatches: Math.floor(Math.random() * 100) + 50,
                status: 'offline'
            });
        }
        const createdUsers = await User.insertMany(users);
        console.log('20 Users seeded');

        console.log('Seeding completed successfully');
        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedDB();
