import { UUIDV4 } from 'sequelize';
import userService from '../services/userService.js';
import { logger, metrics } from '../utils/logger.js';
import emailService from '../utils/sendgrid.js';
import AWS from 'aws-sdk';

const sns = new AWS.SNS({ region: process.env.AWS_REGION }); 

// Create a new user
export const createUser = async (req, res) => {
  // Track API call count
  metrics.trackApiCall('createUser');

  try {
    await metrics.trackApiTiming('createUser', async () => {
      const { email, password, first_name, last_name } = req.body;

      // Check if all required fields are provided
      if (!email || !password || !first_name || !last_name) {
        logger.warn('Missing required fields in user creation', {
          providedFields: Object.keys(req.body)
        });
        return res.status(400).json({ error: 'Missing required fields' });
      }

      let newUser;
      try {
        newUser = await metrics.trackDbQuery('createUser', async () => {
          return await userService.createUser(email, password, first_name, last_name);
        });

        // // Send welcome email
        // try {
        //   await emailService.sendEmail(
        //     email,
        //     'Welcome to Our Service',
        //     'Your account has been created successfully!'
        //   );
        //   logger.info('Welcome email sent', { 
        //     userId: newUser.id,
        //     email: newUser.email 
        //   });
        // } catch (emailError) {
        //   // Log email error but don't fail the request
        //   logger.error('Failed to send welcome email:', { 
        //     error: emailError.message,
        //     userId: newUser.id,
        //     email: newUser.email 
        //   });
        // }

        // Publish message to SNS topic
        try {
          const snsMessage = {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            account_created: newUser.account_created,
          };

          const params = {
            Message: JSON.stringify(snsMessage),
            TopicArn: process.env.SNS_TOPIC_ARN 
          };

          await sns.publish(params).promise();
          logger.info('SNS message published successfully', { userId: newUser.id });
        } catch (snsError) {
          logger.error('Failed to publish SNS message:', { error: snsError.message });
        }

        // Prepare response (exclude password)
        const userResponse = {
          id: newUser.id,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          email: newUser.email,
          account_created: newUser.account_created,
          account_updated: newUser.account_updated
        };

        logger.info('User created successfully', {
          userId: newUser.id,
          email: newUser.email
        });

        return res.status(201).json(userResponse);

      } catch (dbError) {
        logger.error('Database error creating user:', {
          error: dbError.message,
          stack: dbError.stack
        });
        return res.status(400).json({ error: dbError.message });
      }
    });
  } catch (error) {
    logger.error('Error in create user flow:', {
      error: error.message,
      stack: error.stack
    });
    res.status(400).json({ error: error.message });
  }
};

// Update user information
export const updateUser = async (req, res) => {
  // Track API call count
  metrics.trackApiCall('updateUser');

  try {
    await metrics.trackApiTiming('updateUser', async () => {
      const { first_name, last_name, password, email } = req.body;

      // Check if all required fields are provided
      if (!password || !first_name || !last_name || !email) {
        logger.warn('Missing required fields in user update', {
          providedFields: Object.keys(req.body)
        });
        return res.status(400).end();
      }

      // Check if any invalid fields are provided
      const allowedFields = ['first_name', 'last_name', 'password', 'email'];
      const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
      if (invalidFields.length > 0) {
        logger.warn('Invalid fields provided in user update', {
          invalidFields,
          userId: req.user.id
        });
        return res.status(400).end();
      }

      const updatedUser = await metrics.trackDbQuery('updateUser', async () => {
        return await userService.updateUser(req.user, first_name, last_name, password, email);
      });

      if (!updatedUser) {
        logger.warn('User update failed', { userId: req.user.id });
        return res.status(400).end();
      }

      logger.info('User updated successfully', { userId: req.user.id });
      res.status(204).end();
    });
  } catch (error) {
    logger.error('Error updating user:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(400).end();
  }
};

// Get user information
export const getUserInfo = async (req, res) => {
  // Track API call count
  metrics.trackApiCall('getUserInfo');

  try {
    await metrics.trackApiTiming('getUserInfo', async () => {
      const user = req.user;

      if (!user) {
        logger.warn('User not found', { userId: req.params.id });
        return res.status(404).end();
      }

      // Prepare response (exclude password)
      const userResponse = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        account_created: user.account_created,
        account_updated: user.account_updated
      };

      logger.info('User information retrieved successfully', {
        userId: user.id
      });

      res.status(200).json(userResponse);
    });
  } catch (error) {
    logger.error('Error getting user information:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(400).end();
  }
};