const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Secret key for JWT - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'smarthealth_ne_secret_key_2024';

// Role definitions
const ROLES = {
    COMMUNITY: 'community',
    HEALTH_WORKER: 'health_worker',
    ADMIN: 'admin',
    NATIONAL_ADMIN: 'national_admin'
};

// Generate JWT token
const generateToken = (userId, role) => {
    const expiresIn = role === ROLES.COMMUNITY ? '7d' : '24h';
    return jwt.sign(
        { userId, role },
        JWT_SECRET,
        { expiresIn }
    );
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Hash password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

// Authentication middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
};

// Optional Authentication middleware (Doesn't fail if no token)
const authenticateOptional = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = decoded;
        }
    }
    next();
};

// Role-based authorization middleware
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
};

module.exports = {
    ROLES,
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    authenticate,
    authenticateOptional,
    authorize
};
