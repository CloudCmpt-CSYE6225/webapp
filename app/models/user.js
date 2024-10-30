import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

const UserModel = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
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
      defaultValue: DataTypes.NOW
    },
    account_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: false,
    tableName: 'users',
    hooks: {
      beforeUpdate: async (user) => {
        user.account_updated = new Date();
      }
    }
  });

  // Add associations
  User.associate = (models) => {
    User.hasOne(models.Image, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE'
    });
  };

  return User;
};

export default UserModel;