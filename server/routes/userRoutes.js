import express from 'express';
import { signup, login, updateProfile } from '../controllers/userController.js';
import { protectRoute, checkAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.put('/update-profile', protectRoute, updateProfile);
router.get('/check-auth', protectRoute, checkAuth);

export default router;
