
import express, { json } from 'express';
import { config } from 'dotenv';
import { Sequelize } from 'sequelize';
import cors from 'cors';

// Load environment variables
config();

// Initialize express app
const app = express();

// Middleware
app.use(json());
app.use(cors());

// Database connection
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false 
  }
);

// Health check endpoint
app.get('/healthz', async (req, res) => {
  // Check for payload
  if (Object.keys(req.query).length > 0 || Object.keys(req.body).length > 0) {
    res.writeHead(400, {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Content-Length': '0'
    });
    return res.end();
  }

  try {
    // Test database connection
    await sequelize.authenticate();

    // Set headers
    res.writeHead(200, {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Content-Length': '0'
    });
    return res.end();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    res.writeHead(503, {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Content-Length': '0'
    });
    return res.end();
  }
});

// Handle unsupported methods for /healthz like post put delete
app.all('/healthz', (req, res) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  res.writeHead(405, {
    'Content-Length': '0'
  });
  res.end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});