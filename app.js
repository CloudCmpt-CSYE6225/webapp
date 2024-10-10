//******************
//This file is deprecated and not used in the project. Same is split in different folders and can be run from index.js

import express, { json } from 'express';
import { config } from 'dotenv';
import sequelize from './config/database.js';
import bcrypt from 'bcrypt';
import User from './models/user.js';
import authMiddleware from './middleware/auth.js';

// Load environment variables
config();

// Initialize express app
const app = express();

// Middleware
app.use(json());
app.use(express.json());

// Middleware to remove cache-related headers from all responses
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  });
  next();
});

// Handle unsupported methods for /healthz like post put delete
app.all('/healthz', (req, res, next) => {
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
app.get('/healthz', async (req, res) => {
  // Check for payload
  if (Object.keys(req.query).length > 0 || Object.keys(req.body).length > 0) {
    
    return res.status(400).end();
  }

  try {
    // Test database connection
    await sequelize.authenticate();

    return res.status(200).end();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return res.status(503).end();
  }
});

// Create a new user
app.post('/v1/user', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Check if all required fields are provided
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).end();
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).end();
    }

    // Hash the password using bcrypt and salt 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name
    });

    // Prepare response (exclude password)
    const userResponse = {
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      account_created: newUser.account_created,
      account_updated: newUser.account_updated
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).end();
  }
});

// Handle unsupported methods for /v1/user/self 
app.all('/v1/user/self', (req, res, next) => {
  const unsupportedMethods = ['HEAD', 'POST','OPTIONS', 'PATCH', 'DELETE'];
  if (unsupportedMethods.includes(req.method)) {
    res.status(405).end();
  } else {
    next();
  }
});

// Update user information
app.put('/v1/user/self', authMiddleware, async (req, res) => {
  try {
    const { first_name, last_name, password, email } = req.body;

    // Check if all required fields are provided
    if (!password || !first_name || !last_name || !email) {
      return res.status(400).end();
    }

    // Check if any invalid fields are provided
    const allowedFields = ['first_name', 'last_name', 'password', 'email'];
    const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).end();
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).end();
    }

    // Check if the authenticated user matches the user being updated
    if (req.user.email !== email) {
      return res.status(403).end();
    }

    // Update allowed fields
    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (password !== undefined) {
      // Hash the password using bcrypt and salt 
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(204).end();
  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(400).end();
  }
});

// Get user information
app.get('/v1/user/self', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).end();
    }

    // Prepare response (exclude password)
    const userResponse = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      account_created: user.account_created,
      account_updated: user.account_updated
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error getting user information:', error);
    res.status(400).end();
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Create the database by bootstrapping
async function bootstrapDatabase() {
  try {
    await sequelize.sync({ alter: true, indexes: false });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error bootstrapping database:', error);
  } 
}

bootstrapDatabase();

export default app;