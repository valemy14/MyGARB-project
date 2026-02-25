function admin(req, res, next) {
    // req.user is already set by auth middleware
    if (!req.user) {
        return res.status(401).send('Access denied. Please login.');
    }
    
    if (!req.user.isAdmin) {
        return res.status(403).send('Access denied. Admin privileges required.');
    }
    
    next();
}

module.exports = admin;