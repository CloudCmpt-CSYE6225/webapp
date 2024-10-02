import express from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = express.Router();

// Handle unsupported methods for /healthz like post put delete
router.all('/', (req, res, next) => {
  const unsupportedMethods = ['HEAD', 'POST','OPTIONS', 'PUT', 'PATCH', 'DELETE'];
  if (unsupportedMethods.includes(req.method)) {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.status(405).end();
  } else {
    next();
  }
});

// Health check endpoint get method
router.get('/', getHealth);

export default router;