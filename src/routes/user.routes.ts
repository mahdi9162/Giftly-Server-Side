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
// update endpoint for profile info + shipping address
router.patch('/me/profile', verifyToken, userControllers.updateMyProfile);
// update endpoint for profile image
router.patch('/me/profile-image', verifyToken, userControllers.updateMyProfileImage);
// update user password
router.patch('/me/password', verifyToken, userControllers.updateMyPassword);
export const UserRoutes = router;
