import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

const ImageModel = (sequelize) => {
  const Image = sequelize.define('Image', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
      readOnly: true
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false,
      readOnly: true,
      validate: {
        notEmpty: true
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      readOnly: true,
      validate: {
        notEmpty: true
      }
    },
    upload_date: {
      type: DataTypes.DATE,
      allowNull: false,
      readOnly: true,
      defaultValue: DataTypes.NOW
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      readOnly: true,
      validate: {
        isUUID: 4
      }
    }
  }, {
    timestamps: false,
    tableName: 'images',
    hooks: {
      beforeValidate: (image) => {
        // Ensure upload_date is in YYYY-MM-DD format
        if (image.upload_date) {
          image.upload_date = new Date(image.upload_date).toISOString().split('T')[0];
        }
      }
    }
  });

  // Associate Image with User model
  Image.associate = (models) => {
    Image.belongsTo(models.User, {
      foreignKey: 'user_id',
      onDelete: 'CASCADE'
    });
  };

  return Image;
};

export default ImageModel;