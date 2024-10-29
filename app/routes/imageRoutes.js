import express from 'express';
import { uploadImage, getImage, deleteImage } from '../controllers/imageController.js';
import authMiddleware from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit (reduced from 10MB)
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, and JPEG files are allowed.'));
    }
  }
});

// Add headers middleware
const addHeaders = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  });
  next();
};

// Handle unsupported methods
router.all('/self/pic', addHeaders, (req, res, next) => {
  const allowedMethods = ['GET', 'POST', 'DELETE'];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({
      error: 'Method Not Allowed'
    });
  }
  next();
});

// Image endpoints with authentication and headers
router.post('/self/pic', addHeaders, authMiddleware, upload.single('file'), uploadImage);
router.get('/self/pic', addHeaders, authMiddleware, getImage);
router.delete('/self/pic', addHeaders, authMiddleware, deleteImage);

export default router;