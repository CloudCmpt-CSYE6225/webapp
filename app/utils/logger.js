import { createLogger, format as _format, transports as _transports } from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
import StatsD from 'hot-shots';

// Initialize StatsD client
const statsd = new StatsD({
  host: 'localhost',
  port: 8125,
  prefix: 'webapp.',
  errorHandler: (error) => {
    console.error('StatsD error:', error);
  }
});

// Create Winston logger
export const logger = createLogger({
  level: 'info',
  format: _format.json(),
  transports: [
    new _transports.Console(),
    new WinstonCloudWatch({
      logGroupName: '/webapp/logs',
      logStreamName: `${process.env.NODE_ENV}-${new Date().toISOString().split('T')[0]}`,
      awsRegion: process.env.AWS_REGION
    })
  ]
});

// Create metrics wrapper
export const metrics = {
  // Track API calls
  trackApiCall: (endpoint) => {
    statsd.increment(`api.${endpoint}.calls`);
  },

  // Track API timing
  trackApiTiming: async (endpoint, callback) => {
    const startTime = Date.now();
    try {
      const result = await callback();
      const duration = Date.now() - startTime;
      statsd.timing(`api.${endpoint}.timing`, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      statsd.timing(`api.${endpoint}.timing`, duration);
      throw error;
    }
  },

  // Track database queries
  trackDbQuery: async (queryName, callback) => {
    const startTime = Date.now();
    try {
      const result = await callback();
      const duration = Date.now() - startTime;
      statsd.timing(`db.${queryName}.timing`, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      statsd.timing(`db.${queryName}.timing`, duration);
      throw error;
    }
  },

  // Track S3 operations
  trackS3Operation: async (operation, callback) => {
    const startTime = Date.now();
    try {
      const result = await callback();
      const duration = Date.now() - startTime;
      statsd.timing(`s3.${operation}.timing`, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      statsd.timing(`s3.${operation}.timing`, duration);
      throw error;
    }
  }
};