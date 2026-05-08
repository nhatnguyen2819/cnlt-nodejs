require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caro-realx');
  await User.deleteMany({});
  await User.insertMany([
    { username: 'ProGamer', wins: 42, losses: 10, draws: 3, totalMatches: 55 },
    { username: 'CaroKing', wins: 38, losses: 15, draws: 5, totalMatches: 58 },
    { username: 'NightOwl', wins: 25, losses: 20, draws: 8, totalMatches: 53 },
  ]);
  console.log('✅ Seed complete');
  process.exit(0);
}

seed().catch(console.error);
