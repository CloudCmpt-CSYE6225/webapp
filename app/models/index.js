import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import User from './user.js';
import ImageModel from './image.js';

dotenv.config();

// Database connection
const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Initialize models
const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Initialize models with sequelize instance 
const Image = ImageModel(sequelize);

// Set up associations
Image.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

User.hasOne(Image, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
});

// Sync database
const initDatabase = async () => {
  try {
      await sequelize.authenticate();
      console.log('Database connection established');

      // Drop all tables if they exist and recreate
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await sequelize.sync({ force: true }); // This will drop and recreate tables
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

      console.log('Database synchronized');
  } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
  }
};

// Initialize database
initDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

export { User, Image };
export default sequelize;