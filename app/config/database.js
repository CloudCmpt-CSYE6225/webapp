import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

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

  export default sequelize;