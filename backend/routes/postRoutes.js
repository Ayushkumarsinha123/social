const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getAllPosts, getUserPosts, createPost, toggleLike } = require('../controllers/postController');

router.get('/', auth, getAllPosts);
router.get('/user/:userId', auth, getUserPosts);
router.post('/', auth, createPost); // ✅ Post route added
// routes/postRoutes.js
router.post('/:postId/like', auth, toggleLike);


module.exports = router;