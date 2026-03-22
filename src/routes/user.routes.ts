import express from 'express';
import { userControllers } from '../controller/user.controller';

const router = express.Router();

// Register user
router.post('/register', userControllers.register);

export const UserRoutes = router;
