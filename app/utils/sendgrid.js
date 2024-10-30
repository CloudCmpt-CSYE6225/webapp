// utils/sendgrid.js
import sgMail from '@sendgrid/mail';
import { logger } from './logger.js';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const emailService = {
    sendEmail: async (to, subject, text) => {
        try {
            const msg = {
                to,
                from: `no-reply@${process.env.DOMAIN_NAME}`, 
                subject,
                text
            };

            await sgMail.send(msg);
            logger.info('Email sent successfully', {
                to,
                subject,
                operation: 'send_email'
            });
        } catch (error) {
            logger.error('Error sending email:', {
                error: error.message,
                to,
                subject,
                operation: 'send_email'
            });
            throw error;
        }
    }
};

export default emailService;