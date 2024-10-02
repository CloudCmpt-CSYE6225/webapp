import bcrypt from 'bcrypt';
import User from '../models/user.js';

// Create a new user
export const createUser = async (email, password, first_name, last_name) => {
  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash the password using bcrypt and salt
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser = await User.create({
    email,
    password: hashedPassword,
    first_name,
    last_name
  });

  return newUser;
};

// Update user information
export const updateUser = async (user, first_name, last_name, password, email) => {
  const userToUpdate = await User.findOne({ where: { email } });

  if (!userToUpdate) {
    throw new Error('User not found');
  }

  // Check if the authenticated user matches the user being updated
  if (user.email !== email) {
    throw new Error('Unauthorized');
  }

  // Update allowed fields
  if (first_name !== undefined) userToUpdate.first_name = first_name;
  if (last_name !== undefined) userToUpdate.last_name = last_name;
  if (password !== undefined) {
    // Hash the password using bcrypt and salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    userToUpdate.password = hashedPassword;
  }

  await userToUpdate.save();

  return userToUpdate;
};

export default {
  createUser,
  updateUser
};