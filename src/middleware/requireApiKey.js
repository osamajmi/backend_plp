// src/middleware/requireApiKey.js
module.exports = function (req, res, next) {
  const key = req.header('x-api-key') || req.query.api_key;
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    // If no key configured, allow (useful in dev). Change to deny if you want strict behavior.
    return next();
  }
  if (!key || key !== expected) {
    return res.status(401).json({ message: 'Unauthorized - invalid API key' });
  }
  next();
};
