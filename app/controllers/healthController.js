import sequelize from '../config/database.js';
import { logger, metrics } from '../utils/logger.js';

// Health check endpoint get method
export const getHealth = async (req, res) => {
  // Track API call count
  metrics.trackApiCall('healthcheck');

  try {
    // Check for payload
    if (Object.keys(req.query).length > 0 || Object.keys(req.body).length > 0) {
      logger.warn('Health check received unexpected payload', {
        query: req.query,
        body: req.body
      });
      return res.status(400).end();
    }

    // Track database connection timing
    await metrics.trackApiTiming('healthcheck', async () => {
      // Test database connection with timing
      await metrics.trackDbQuery('healthcheck_db', async () => {
        await sequelize.authenticate();
      });

      logger.info('Health check successful');
      return res.status(200).end();
    });

  } catch (error) {
    logger.error('Health check failed', {
      error: error.message,
      stack: error.stack
    });
    return res.status(503).end();
  }
};