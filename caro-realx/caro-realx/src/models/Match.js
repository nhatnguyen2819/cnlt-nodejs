const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  playerX: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  playerO: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isDraw: { type: Boolean, default: false },
  boardSize: { type: Number, default: 15 },
  moves: [{
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    x: Number,
    y: Number,
    time: { type: Date, default: Date.now }
  }],
  duration: { type: Number, default: 0 } // seconds
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
