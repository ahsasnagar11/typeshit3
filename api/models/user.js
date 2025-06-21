const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true},
  dateOfBirth: { type: String, required: true }, // Format "DD/MM/YYYY"
  location: { type: String, required: false },
  gender: { type: String, required: true },
  datingPreferences: [{ type: String, required: true}], // e.g., ["Men", "Women"]
  type: { type: String, required: true },  // Your sexuality (e.g., Straight, Gay, etc.)
  photos: [{ type: String }],              // General photos from PhotoScreen
  profilePhotos: [{ type: String }],       // Profile photos from ProfilePhotoScreen
  introduction: { type: String },          // Profile introduction text
  likedProfiles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  receivedLikes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      comment: {
        type: String,
      },
    },
  ],
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema, 'users'); // Explicitly specify collection name 'users'