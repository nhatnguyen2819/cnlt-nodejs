const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    playerX: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    playerO: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
