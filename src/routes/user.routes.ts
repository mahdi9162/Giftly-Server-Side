import express from 'express';
import { userControllers } from '../controller/user.controller';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// Register user
router.post('/register', userControllers.register);
// Login user
router.post('/login', userControllers.login);
// Logout user
router.post('/logout', userControllers.logout);
// Me
router.get('/me', verifyToken, userControllers.getMe);

export const UserRoutes = router;
