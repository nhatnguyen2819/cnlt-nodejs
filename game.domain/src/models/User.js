const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    avatar: { type: String, default: 'default_avatar.png' },
    wins: { type: Number, default: 0 },
    totalMatches: { type: Number, default: 0 },
    status: { type: String, enum: ['online', 'offline', 'playing'], default: 'offline' },
    socketId: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
