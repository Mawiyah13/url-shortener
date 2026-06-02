import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mockDb from '../config/mockDb.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_session_token_key');

      if (global.isMockDB) {
        const user = await mockDb.users.findById(decoded.id);
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        req.user = user;
      } else {
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        req.user = user;
      }

      next();
    } catch (error) {
      console.error('🔒 Auth Middleware Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
export default protect;
