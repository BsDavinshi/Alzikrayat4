const jwt = require('jsonwebtoken');

// Strict middleware for protected write routes (Authorization: Bearer <token>)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. Authorization token is required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // Populate x-user-id internally so controllers reuse verified JWT id cleanly
    req.headers['x-user-id'] = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
};

// Optional middleware for public read routes so likedByViewer reflects the signed-in user
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      req.user = decoded;
      req.headers['x-user-id'] = decoded.id;
    } catch {
      delete req.headers['x-user-id'];
    }
  } else {
    delete req.headers['x-user-id'];
  }
  next();
};

module.exports = { authMiddleware, optionalAuth };
