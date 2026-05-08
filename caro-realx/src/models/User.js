const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 20 },
  avatar: { type: String, default: 'default' },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  totalMatches: { type: Number, default: 0 },
  status: { type: String, enum: ['online', 'offline', 'playing'], default: 'offline' },
  socketId: { type: String, default: null }
}, { timestamps: true });

userSchema.virtual('winRate').get(function () {
  if (this.totalMatches === 0) return 0;
  return Math.round((this.wins / this.totalMatches) * 100);
});

module.exports = mongoose.model('User', userSchema);
