const Match = require('../models/Match');

exports.getRecentMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('playerX playerO winner', 'username');
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
