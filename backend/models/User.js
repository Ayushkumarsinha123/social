const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:    { type: String, required: true, unique: true },
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  bio:         { type: String },
  profilePic:  { type: String },
  followers:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // ✅ New field: Notifications
  notifications: [
    {
      type:     { type: String, enum: ['like', 'comment'], required: true },
      fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      post:     { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
