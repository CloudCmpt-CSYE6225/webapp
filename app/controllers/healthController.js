import sequelize from '../config/database.js';

// Health check endpoint get method
export const getHealth = async (req, res) => {
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
};