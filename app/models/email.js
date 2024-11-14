import { DataTypes } from 'sequelize';
import sequelize from '../config/database'; 

const EmailTracking = sequelize.define('EmailTracking', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: {
                msg: "Must be a valid email address"
            }
        }
    },
    verification_link: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    },
}, {
    tableName: 'email_tracking',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default EmailTracking;