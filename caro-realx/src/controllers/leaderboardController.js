const User = require('../models/User');

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ totalMatches: { $gt: 0 } })
      .sort({ wins: -1, totalMatches: 1 })
      .limit(20)
      .select('username wins losses draws totalMatches avatar');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
