const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        console.error('Auth error:', ex.message);
        res.status(400).send('Invalid token.');
    }
}

module.exports = auth;