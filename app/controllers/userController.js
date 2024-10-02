import userService from '../services/userService.js';

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Check if all required fields are provided
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).end();
    }

    const newUser = await userService.createUser(email, password, first_name, last_name);

    // Prepare response (exclude password)
    const userResponse = {
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      account_created: newUser.account_created,
      account_updated: newUser.account_updated
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).end();
  }
};

// Update user information
export const updateUser = async (req, res) => {
  try {
    const { first_name, last_name, password, email } = req.body;

    // Check if all required fields are provided
    if (!password || !first_name || !last_name || !email) {
      return res.status(400).end();
    }

    // Check if any invalid fields are provided
    const allowedFields = ['first_name', 'last_name', 'password', 'email'];
    const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).end();
    }

    const updatedUser = await userService.updateUser(req.user, first_name, last_name, password, email);

    if (!updatedUser) {
      return res.status(400).end();
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(400).end();
  }
};

// Get user information
export const getUserInfo = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
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

    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error getting user information:', error);
    res.status(400).end();
  }
};