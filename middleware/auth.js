
import bcrypt from 'bcrypt';
import User from '../models/user.js';

// Token-Based Authentication Middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Access to the API"');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const [email, password] = Buffer.from(token, 'base64').toString().split(':');

  const user = await User.findOne({ where: { email } });
  if (user) {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      req.user = user;
      next();
      return;
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="Access to the API"');
  return res.status(401).json({ error: 'Unauthorized' });
};

export default authMiddleware;