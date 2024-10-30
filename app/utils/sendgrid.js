// utils/sendgrid.js
import sgMail from '@sendgrid/mail';
import { logger } from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
if (!process.env.SENDGRID_API_KEY) {
    logger.error('SENDGRID_API_KEY is not defined');
    throw new Error('SENDGRID_API_KEY is not defined');
}

if (!process.env.SENDGRID_VERIFIED_SENDER) {
    logger.error('SENDGRID_VERIFIED_SENDER is not defined');
    throw new Error('SENDGRID_VERIFIED_SENDER is not defined');
}

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const emailService = {
    sendEmail: async (to, subject, text) => {
        try {
            const msg = {
                to,
                from: process.env.SENDGRID_VERIFIED_SENDER, // Use the exact verified sender email
                subject,
                text
            };

            const result = await sgMail.send(msg);
            logger.info('Email sent successfully', {
                to,
                subject,
                messageId: result[0]?.messageId,
                operation: 'send_email'
            });
            
            return result;
        } catch (error) {
            logger.error('Failed to send emaill:', {
                error: error.message,
                to,
                subject,
                operation: 'send_email',
                stack: error.stack
            });
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
};

export default emailService;