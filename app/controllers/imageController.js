import { logger, metrics } from '../utils/logger.js';
import s3Utils from '../utils/s3.js';
import Image from '../models/image.js';

export const uploadImage = async (req, res) => {
  // Track API call count
  metrics.trackApiCall('uploadImage');

  try {
    await metrics.trackApiTiming('uploadImage', async () => {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Validate file
      s3Utils.validateFile(req.file);

      // Check if user already has an image
      const existingImage = await metrics.trackDbQuery('findExistingImage', async () => {
        return await Image.findOne({
          where: { user_id: req.user.id }
        });
      });

      if (existingImage) {
        // Delete existing image from S3
        await metrics.trackS3Operation('deleteExistingImage', async () => {
          await s3Utils.deleteFile(existingImage.url.split('/').pop(), req.user.id);
        });

        await metrics.trackDbQuery('deleteExistingImageRecord', async () => {
          await existingImage.destroy();
        });
      }

      // Upload new image
      const uploadResult = await metrics.trackS3Operation('uploadNewImage', async () => {
        return await s3Utils.uploadFile(req.file, req.user.id);
      });

      // Create image record
      const image = await metrics.trackDbQuery('createImageRecord', async () => {
        return await Image.create({
          file_name: uploadResult.file_name,
          url: uploadResult.url,
          user_id: req.user.id
        });
      });

      logger.info('Image uploaded successfully', {
        userId: req.user.id,
        imageId: image.id
      });

      res.status(201).json({
        file_name: image.file_name,
        id: image.id,
        url: image.url,
        upload_date: image.upload_date,
        user_id: image.user_id
      });
    });
  } catch (error) {
    logger.error('Error uploading image:', { 
      error: error.message,
      userId: req.user.id 
    });
    res.status(400).json({ error: error.message });
  }
};

export const getImage = async (req, res) => {
  // Track API call count
  metrics.trackApiCall('getImage');

  try {
    await metrics.trackApiTiming('getImage', async () => {
      const image = await metrics.trackDbQuery('findImage', async () => {
        return await Image.findOne({
          where: { user_id: req.user.id }
        });
      });

      if (!image) {
        logger.warn('Image not found', { userId: req.user.id });
        return res.status(404).json({ error: 'Image not found' });
      }

      logger.info('Image retrieved successfully', {
        userId: req.user.id,
        imageId: image.id
      });

      res.status(200).json({
        file_name: image.file_name,
        id: image.id,
        url: image.url,
        upload_date: image.upload_date,
        user_id: image.user_id
      });
    });
  } catch (error) {
    logger.error('Error getting image:', { 
      error: error.message,
      userId: req.user.id 
    });
    res.status(400).json({ error: error.message });
  }
};

export const deleteImage = async (req, res) => {
  // Track API call count
  metrics.trackApiCall('deleteImage');

  if (!req.user) {
    logger.warn('Unauthorized delete attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await metrics.trackApiTiming('deleteImage', async () => {
      const image = await metrics.trackDbQuery('findImageForDelete', async () => {
        return await Image.findOne({
          where: { user_id: req.user.id }
        });
      });

      if (!image) {
        logger.warn('Image not found for deletion', { userId: req.user.id });
        return res.status(404).json({ error: 'Image not found' });
      }

      // Delete from S3
      await metrics.trackS3Operation('deleteImage', async () => {
        await s3Utils.deleteFile(image.url.split('/').pop(), req.user.id);
      });

      // Delete from database
      await metrics.trackDbQuery('deleteImageRecord', async () => {
        await image.destroy();
      });

      logger.info('Image deleted successfully', {
        userId: req.user.id,
        imageId: image.id
      });

      res.status(204).end();
    });
  } catch (error) {
    logger.error('Error deleting image:', { 
      error: error.message,
      userId: req.user.id 
    });
    res.status(400).json({ error: error.message });
  }
};