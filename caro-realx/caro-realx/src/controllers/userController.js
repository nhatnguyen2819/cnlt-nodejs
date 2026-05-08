const User = require('../models/User');

exports.getOrCreateUser = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || username.trim().length < 2) {
      return res.status(400).json({ error: 'Username phải có ít nhất 2 ký tự' });
    }
    const name = username.trim().slice(0, 20);
    let user = await User.findOneAndUpdate(
      { username: name },
      { status: 'online' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người chơi' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
