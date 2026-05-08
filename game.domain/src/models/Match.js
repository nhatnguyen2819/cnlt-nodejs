const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    playerX: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    playerO: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isDraw: { type: Boolean, default: false },
    moves: [{
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        x: Number,
        y: Number,
        time: { type: Date, default: Date.now }
    }],
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
