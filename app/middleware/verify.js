import { createConnection } from 'mysql2/promise';

// RDS configuration
const rdsConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
};

// Middleware to verify user by clicking the link
export const verifyUser = async (req, res, next) => {
    if (process.env.NODE_ENV === "test") return next();
    try {
        const { email, expires } = req.query;

        // Check if required query parameters are present
        if (!email || !expires) {
            return res.status(400).json({ message: 'Invalid verification link' });
        }

        // Check if the verification link has expired
        const currentTime = new Date();
        const expirationTime = new Date(expires);

        if (currentTime > expirationTime) {
            return res.status(400).json({ message: 'Verification link has expired' });
        }

        // Connect to the database
        const connection = await createConnection(rdsConfig);

        // Check if the user exists and is already verified
        const [rows] = await connection.execute(
            'SELECT is_verified FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            await connection.end();
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];

        // If the user is already verified, no need to re-verify
        if (user.is_verified) {
            await connection.end();
            return res.status(200).json({ message: 'User already verified' });
        }

        // Mark the user as verified in the database
        await connection.execute(
            'UPDATE users SET is_verified = 1 WHERE email = ?',
            [email]
        );

        await connection.end();

        return res.status(200).json({ message: 'Email successfully verified' });

    } catch (error) {
        console.error('Error verifying user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Middleware to block unverified users from accessing other API routes
export const blockUnverifiedUsers = async (req, res, next) => {
    try {
        const { email } = req.body; // Assuming email is passed in request body

        if (!email) {
            return res.status(400).json({ message: 'Email not verified and not found' });
        }

        // Connect to the database
        const connection = await createConnection(rdsConfig);

        // Check if the user exists and is verified
        const [rows] = await connection.execute(
            'SELECT is_verified FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            await connection.end();
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];

        // If the user is not verified, block access
        if (!user.is_verified) {
            await connection.end();
            return res.status(403).json({ message: 'Account not verified. Please verify your email.' });
        }

        await connection.end();

        // Proceed to the next middleware or route handler if verified
        next();

    } catch (error) {
        console.error('Error checking verification status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};