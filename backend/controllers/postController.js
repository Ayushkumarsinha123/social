const Post = require('../models/Post');
const User = require('../models/User');

// ✅ Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Post content cannot be empty' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const post = await Post.create({
      user: user._id,
      content: content.trim(),
    });

    res.status(201).json({
      _id: post._id,
      content: post.content,
      username: user.username,
      likes: [],
      comments: [],
    });
  } catch (error) {
    console.error('Error creating post:', error.message);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

// ✅ Get all posts (for feed)
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username');

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      content: post.content,
      username: post.user.username,
      likes: post.likes || [],
      comments: post.comments || [],
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// ✅ Get posts by a specific user (profile)
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 });

    res.json(
      posts.map(post => ({
        _id: post._id,
        content: post.content,
        likes: post.likes || [],
        comments: post.comments || [],
      }))
    );
  } catch (error) {
    console.error('Error fetching user posts:', error.message);
    res.status(500).json({ message: 'Failed to fetch user posts' });
  }
};

// In postController.js
exports.likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (!post.likes.includes(userId)) {
    post.likes.push(userId);
    await post.save();

    // Notify the post owner
    if (String(post.user) !== userId) {
      const owner = await User.findById(post.user);
      owner.notifications.push({
        type: 'like',
        fromUser: userId,
        post: post._id
      });
      await owner.save();
    }
  }

  res.json({ message: 'Liked' });
};

// controllers/postController.js
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.userId;

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({ 
      message: alreadyLiked ? 'Unliked' : 'Liked',
      likesCount: post.likes.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Like failed' });
  }
};
