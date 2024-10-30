import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import ImageModel from './image.js';
import UserModel from './user.js';
import { logger } from '../utils/logger.js';

dotenv.config();

// Database connection
const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: (msg) => logger.info(msg),
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
);

// Initialize models
const User = UserModel(sequelize);
const Image = ImageModel(sequelize);

// Set up associations
Image.associate({ User });
User.associate({ Image });

// Sync database
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
  } catch (error) {
    throw error;
  }
};

// Initialize database
initDatabase().catch(error => {
  process.exit(1);
});

export { User, Image };
export default sequelize;