import express from 'express';
import { createUser, updateUser, getUserInfo } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
import { blockUnverifiedUsers, verifyUser } from '../middleware/verify.js';

const router = express.Router();

// Create a new user
router.post('/', createUser);

//verifying the user
router.get('/verify', verifyUser);

// Handle unsupported methods for /v1/user/self
router.all('/self', (req, res, next) => {
  const unsupportedMethods = ['HEAD', 'POST','OPTIONS', 'PATCH', 'DELETE'];
  if (unsupportedMethods.includes(req.method)) {
    res.status(405).end();
  } else {
    next();
  }
});

// Update user information
router.put('/self', authMiddleware, blockUnverifiedUsers, updateUser);

// Get user information
router.get('/self', authMiddleware, blockUnverifiedUsers, getUserInfo);

export default router;