require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Chat = require('./models/chat');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  credentials: false,
  optionsSuccessStatus: 200
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
  })
  .catch((error) => console.log('Error connecting to MongoDB', error));

/* Registration & Login Endpoints  */

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    console.log('Received registration data:', req.body);
    const user = new User(req.body);
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token: token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map((field) => ({
        field,
        message: error.errors[field].message,
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors,
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'User already exists',
        details: 'A user with this email already exists',
      });
    }
    res.status(500).json({ error: 'Error registering user', message: error.message });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email' });
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '1d' }
    );
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Fetch user data by user ID
app.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Dating App API is running!', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/* Database & Matches Endpoints  */

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      message: 'Database test',
      userCount: users.length,
      collectionName: User.collection.name,
      databaseName: mongoose.connection.db.databaseName,
      sampleUsers: users.slice(0, 5).map(u => ({
        id: u._id,
        name: u.fullName,
        email: u.email
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Matches endpoint
app.get('/matches', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'Missing userId parameter' });
    }
    
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let currentUserId;
    try {
      currentUserId = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }
    
    const matches = await User.find({ _id: { $ne: currentUserId } });
    
    return res.status(200).json({
      matches,
      currentUserId: currentUserId.toString(),
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

/* ================= Like/Match Endpoints ================= */

app.get('/check-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const safeUser = {
      _id: user._id,
      fullName: user.fullName,
      hasReceivedLikes: Boolean(user.receivedLikes),
      receivedLikesCount: user.receivedLikes ? user.receivedLikes.length : 0,
    };
    
    res.status(200).json(safeUser);
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ message: 'Error checking user', error: error.message });
  }
});

// Endpoint for fetching received likes
app.get('/received-likes/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'Missing userId parameter' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = await User.findById(userId)
      .populate({
        path: 'receivedLikes.userId',
        select: 'fullName profilePhotos introduction gender dateOfBirth type'
      });
    
    const receivedLikes = user.receivedLikes || [];
    res.status(200).json({ receivedLikes });
  } catch (error) {
    console.error('Error fetching received likes:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Endpoint for liking a profile
app.post('/like-profile', async (req, res) => {
  try {
    const { userId, likedUserId, image, comment } = req.body;
    if (!userId || !likedUserId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    await User.findByIdAndUpdate(likedUserId, {
      $push: {
        receivedLikes: {
          userId: userId,
          image: image,
          comment: comment,
        },
      },
    });
    
    await User.findByIdAndUpdate(userId, {
      $push: { likedProfiles: likedUserId },
    });
    
    res.status(200).json({ message: 'Profile liked successfully' });
  } catch (error) {
    console.error('Error liking profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to create a match
app.post('/create-match', async (req, res) => {
  try {
    const { currentUserId, selectedUserId } = req.body;
    if (!currentUserId || !selectedUserId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    if (currentUserId.startsWith('dummy') || selectedUserId.startsWith('dummy')) {
      return res.status(200).json({ message: 'Dummy match created successfully' });
    }

    if (
      !mongoose.Types.ObjectId.isValid(currentUserId) ||
      !mongoose.Types.ObjectId.isValid(selectedUserId)
    ) {
      return res.status(400).json({ 
        message: 'Invalid user ID format. Must be a valid ObjectId.',
        currentUserId,
        selectedUserId
      });
    }

    const updateSelectedUserPromise = User.findByIdAndUpdate(
      selectedUserId,
      {
        $push: { matches: currentUserId },
        $pull: { likedProfiles: currentUserId },
      },
      { new: true }
    );

    const updateCurrentUserPromise = User.findByIdAndUpdate(
      currentUserId,
      {
        $push: { matches: selectedUserId },
      },
      { new: true }
    );

    const removeReceivedLikePromise = User.findByIdAndUpdate(
      currentUserId,
      { $pull: { receivedLikes: { userId: selectedUserId } } },
      { new: true }
    );

    const [updatedSelectedUser, updatedCurrentUser] = await Promise.all([
      updateSelectedUserPromise,
      updateCurrentUserPromise,
      removeReceivedLikePromise,
    ]);

    if (!updatedSelectedUser || !updatedCurrentUser) {
      return res.status(404).json({ message: 'One or more users not found' });
    }
    
    res.status(200).json({ message: 'Match created successfully' });
  } catch (error) {
    console.error('Error creating a match:', error);
    res.status(500).json({ message: 'Error creating a match', error });
  }
});

/* ================= Chat Endpoints ================= */

// Get user matches for chat screen
app.get('/get-matches/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.matches || user.matches.length === 0) {
      return res.status(200).json({ matches: [] });
    }
    
    const matchedUsers = await User.find(
      { _id: { $in: user.matches } },
      'fullName profilePhotos introduction gender dateOfBirth type'
    );
    
    res.status(200).json({ matches: matchedUsers });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Error fetching matches', error: error.message });
  }
});

// Create a new chat message
app.post('/chats', async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newChat = new Chat({
      senderId,
      receiverId,
      message,
      timestamp: new Date()
    });
    
    const savedChat = await newChat.save();
    console.log('Message saved:', savedChat._id);
    
    res.status(201).json({ 
      message: 'Message sent successfully', 
      chat: savedChat 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Get chat history between two users
app.get('/messages', async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;
    
    if (!senderId || !receiverId) {
      return res.status(400).json({ error: 'Missing senderId or receiverId' });
    }
    
    const messages = await Chat.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Could not fetch messages' });
  }
});

// Update user profile
app.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      user: updatedUser,
      message: 'User updated successfully' 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      message: 'Error updating user', 
      error: error.message 
    });
  }
});

// Export for Vercel serverless functions
module.exports = app;

// Start the server (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  });
}
