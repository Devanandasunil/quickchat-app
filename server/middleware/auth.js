import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// middleware to protect routes
export const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.token;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('protectRoute error:', error.message);
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
};

// controller to check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
};