const User = require('../models/User');

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('followers following');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};
exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('notifications.fromUser', 'username');
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.notifications || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load notifications' });
  }
};