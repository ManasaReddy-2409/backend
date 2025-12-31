const jwt = require('jsonwebtoken');

exports.verifyAdmin = (req, res, next) => {
  try {
    const token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.query.token;

    if (!token) return res.status(401).json({ message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
