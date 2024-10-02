import express from 'express';
import { createUser, updateUser, getUserInfo } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Create a new user
router.post('/', createUser);

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
router.put('/self', authMiddleware, updateUser);

// Get user information
router.get('/self', authMiddleware, getUserInfo);

export default router;