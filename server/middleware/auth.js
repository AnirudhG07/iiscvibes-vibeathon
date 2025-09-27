const jwt = require('jsonwebtoken');
const { readJsonFile } = require('../utils/fileUtils');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user data from JSON database
    const users = await readJsonFile('users.json');
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  };
};

const requireSpeaker = requireRole(['speaker']);
const requireEventManager = requireRole(['organizer', 'admin']); // Allow both organizers and admins
const requireAdmin = requireRole(['admin', 'organizer']); // Treat organizer and admin as same
const requireOrganizer = requireRole(['organizer', 'admin']); // Allow both organizer and admin
const requireApproved = requireRole(['speaker', 'organizer', 'admin']);
const requireAny = requireRole(['speaker', 'organizer', 'admin']);

module.exports = {
  auth,
  requireRole,
  requireSpeaker,
  requireEventManager,
  requireAdmin,
  requireOrganizer,
  requireApproved,
  requireAny
};