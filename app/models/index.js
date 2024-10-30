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

// Test database connection
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        await sequelize.sync();
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

testConnection();

export { User, Image };
export default sequelize;
