import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mockDb from '../config/mockDb.js';

// Helper to sign JWT tokens
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_session_token_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please enter all fields');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

    const emailNormalized = email.toLowerCase().trim();

    // Check if user exists
    if (global.isMockDB) {
      const emailExists = await mockDb.users.findOne({ email: emailNormalized });
      const usernameExists = await mockDb.users.findOne({ username });

      if (emailExists || usernameExists) {
        res.status(400);
        throw new Error('User already exists (email or username taken)');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await mockDb.users.create({
        username: username.trim(),
        email: emailNormalized,
        password: hashedPassword
      });

      return res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
        demoMode: true
      });
    } else {
      const userExists = await User.findOne({
        $or: [{ email: emailNormalized }, { username: username.trim() }]
      });

      if (userExists) {
        res.status(400);
        throw new Error('User already exists (email or username taken)');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        username: username.trim(),
        email: emailNormalized,
        password: hashedPassword
      });

      return res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const emailNormalized = email.toLowerCase().trim();

    let user = null;
    if (global.isMockDB) {
      user = await mockDb.users.findOne({ email: emailNormalized });
    } else {
      user = await User.findOne({ email: emailNormalized });
    }

    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    return res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
      demoMode: global.isMockDB
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    // req.user has already been resolved in protect middleware
    res.json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      demoMode: global.isMockDB
    });
  } catch (error) {
    next(error);
  }
};
