import express, { json } from 'express';
import { config } from 'dotenv';
import sequelize from './app/config/database.js';
import healthRoutes from './app/routes/healthRoutes.js';
import userRoutes from './app/routes/userRoutes.js';
import imageRoutes from './app/routes/imageRoutes.js';

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

// Routes
app.use('/healthz', healthRoutes);
app.use('/v1/user', userRoutes);
app.use('/v1/user', imageRoutes);
app.use('/cicd', healthRoutes);
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