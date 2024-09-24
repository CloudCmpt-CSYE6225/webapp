
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
    return res.status(400).end();
  }

  try {
    // Test database connection
    await sequelize.authenticate();

    // Set headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    
    // Return 200 OK with no payload
    res.status(200).end();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    
    // Set headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    
    // Return 503 Service Unavailable with no payload
    res.status(503).end();
  }
});

// Handle unsupported methods for /healthz
app.all('/healthz', (req, res) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  });
  res.status(405).end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});