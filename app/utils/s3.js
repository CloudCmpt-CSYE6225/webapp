import AWS from 'aws-sdk';
import { logger, metrics } from './logger.js';

const s3 = new AWS.S3();

const s3Utils = {
  uploadFile: async (file, userId) => {
    const key = `${userId}/${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        size: file.size.toString(),
        mimeType: file.mimetype,
        userId: userId
      }
    };

    try {
      const result = await metrics.trackS3Operation('upload', async () => {
        return await s3.upload(params).promise();
      }, { fileName: file.originalname, userId });

      logger.info('File uploaded successfully to S3', {
        bucket: result.Bucket,
        key: result.Key,
        userId,
        operation: 'upload'
      });

      return {
        file_name: file.originalname,
        url: result.Location,
        key: result.Key
      };
    } catch (error) {
      logger.error('Error uploading file to S3', {
        error: error.message,
        fileName: file.originalname,
        userId,
        operation: 'upload'
      });
      throw error;
    }
  },

  deleteFile: async (key, userId) => {

    if (!key || !userId) {
      throw new Error('Invalid key or userId provided');
    }
    // Construct the proper key including user ID
    const fullKey = `${userId}/${key}`;
    
    const params = {
      Bucket: process.env.S3_BUCKET, 
      Key: fullKey
    };

    try {
      await metrics.trackS3Operation('delete', async () => {
        return await s3.deleteObject(params).promise();
      }, { key: fullKey, userId });

      logger.info('File deleted successfully from S3', {
        bucket: process.env.S3_BUCKET,
        key: fullKey,
        userId,
        operation: 'delete'
      });

      return true;
    } catch (error) {
      logger.error('Error deleting file from S3', {
        error: error.message,
        key: fullKey,
        userId,
        operation: 'delete'
      });
      throw error;
    }
  },

  getFile: async (key, userId) => {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key
    };

    try {
      const result = await metrics.trackS3Operation('get', async () => {
        return await s3.getObject(params).promise();
      }, { key, userId });

      logger.info('File retrieved successfully from S3', {
        bucket: process.env.S3_BUCKET,
        key,
        userId,
        operation: 'get'
      });

      return result;
    } catch (error) {
      logger.error('Error retrieving file from S3', {
        error: error.message,
        key,
        userId,
        operation: 'get'
      });
      throw error;
    }
  },

  validateFile: (file) => {
    // Allowed file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    
    // Maximum file size (5MB)
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds limit. Maximum size allowed is 5MB.');
    }

    return true;
  }
};

export default s3Utils;