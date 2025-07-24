const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getUser } = require('../controllers/userController');
const User = require('../models/User'); // ✅ Add this import

// Get user profile
router.get('/:id', auth, getUser);

// Get notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: 'notifications.fromUser',
        select: 'username'
      })
      .populate({
        path: 'notifications.post',
        select: 'content'
      });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json((user.notifications || []).reverse());
  } catch (err) {
    console.error('Notification error:', err);
    res.status(500).json({ message: 'Failed to load notifications' });
  }
});

module.exports = router;
