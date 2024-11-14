import sequelize from "../config/database.js";
import { DataTypes, Sequelize } from "sequelize";

const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    account_created: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    account_updated: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: false, 
    // Hook to update account_updated
    hooks: {
      beforeUpdate: async (user) => {
        user.account_updated = new Date();
      }
    }
  });

export default User;