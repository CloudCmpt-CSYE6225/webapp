import User from '../models/user.js'; 

// Middleware to verify user by clicking the link
export const verifyUser = async (req, res, next) => {
    if (process.env.NODE_ENV === "test") return next(); // Skip verification in test environment

    try {
        const { email, expires } = req.query;

        // Check if required query parameters are present
        if (!email || !expires) {
            return res.status(400).json({ message: 'Invalid verification link' });
        }

        // Check if expires is a valid date
        const expirationTime = new Date(expires);
        if (isNaN(expirationTime.getTime())) {
            return res.status(400).json({ message: 'Invalid expiration date' });
        }

        // Check if the verification link has expired
        const currentTime = new Date();
        if (currentTime > expirationTime) {
            return res.status(400).json({ message: 'Verification link has expired' });
        }

        // Find user by email using Sequelize
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If the user is already verified, no need to re-verify
        if (user.is_verified) {
            return res.status(200).json({ message: 'User already verified' });
        }

        // Mark the user as verified in the database
        user.is_verified = true;
        await user.save(); // Save the updated user record

        return res.status(200).json({ message: 'Email successfully verified' });

    } catch (error) {
        console.error('Error verifying user:', error);
        
        // Return a 500 status code for server-side errors
        return res.status(500).json({ message: 'Could not verify user due to server error' });
    }
};

// Middleware to block unverified users from accessing other API routes
export const blockUnverifiedUsers = async (req, res, next) => {
    try {
        
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const [email, password] = Buffer.from(token, 'base64').toString().split(':');

        // Find user by email using Sequelize
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If the user is not verified, block access
        if (!user.is_verified) {
            return res.status(403).json({ message: 'Account not verified. Please verify your email.' });
        }

        // Proceed to the next middleware or route handler if verified
        next();

    } catch (error) {
        console.error('Error checking verification status:', error);
        
        // Return a 500 status code for server-side errors
        return res.status(500).json({ message: 'Error checking verification status due to server error' });
    }
};