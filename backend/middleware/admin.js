module.exports = function(req, res, next) {
    // req.user is already set by auth middleware
    if (!req.user.isAdmin) {
        return res.status(403).send('Access denied. Admin privileges required.');
    }
    
    next();
};