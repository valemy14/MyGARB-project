function designer(req, res, next) {
  if (req.user.role !== 'designer') {
    return res.status(403).json({ message: 'Access denied. Designers only.' });
  }
  next();
}
module.exports = designer;