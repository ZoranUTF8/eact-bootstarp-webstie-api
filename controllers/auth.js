const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors/index");

// Route controllers

/*
Login and existing user
*/
const loginUser = async (req, res) => {
  // Get the user email and password from the login page
  const { email, password } = req.body;

  // Check if the user has provided the email and password
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  // Query the database for a user with the email
  const user = await User.findOne({ email });

  // If no user found with the email than throw error
  if (!user) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  // Check if the user has the correct password for the user found witht the provided email
  const isPasswordCorrect = await user.comparePassword(password);
  // If passwords don't match throe error message
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  // If the user has the correct password then return the user data with a new jwt token
  const token = await user.generateToken();

  res.status(StatusCodes.OK).json({
    userName: user.name,
    avatarUrl: user.avatarUrl,
    isAdmin: user.isAdmin,
    token,
  });
};

/*
Create a new user in the database
where the validation is done by mongo
*/
const registerUser = async (req, res) => {
  //? Add isAdmin properties and set to false when we register a news user
  const newUser = { ...req.body, isAdmin: false };
  //  Add user to the db after the isAdmin has been added as default false
  const createdUser = await User.create(newUser);
  // generate and return a jwt token inside the user model as an instance method
  const token = await createdUser.generateToken();

  res.status(StatusCodes.CREATED).json({
    userName: createdUser.name,
    avatarUrl: createdUser.avatarUrl,
    isAdmin: createdUser.isAdmin,
    token,
  });
};

/*
Update an existing user
*/
const updateUser = async (req, res) => {
  const {
    body: { userName: name, email, avatarUrl, password },
  } = req;

  const updatedUser = await User.findOneAndUpdate(
    {
      name: name,
    },
    { name, email, avatarUrl, password },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new BadRequestError(`No user found with username ${name}`);
  }

  // generate and return a jwt token inside the user model as an instance method
  const token = await updatedUser.generateToken();

  res.status(StatusCodes.CREATED).json({
    userName: updatedUser.name,
    avatarUrl: updatedUser.avatarUrl,
    isAdmin: updatedUser.isAdmin,
    token,
  });
};

/*
Delete a user from the database
*/
const deleteUser = async (req, res) => {
  const { userName } = req.body;

  const deletedUser = await User.findOneAndDelete({ name: userName });

  if (!deletedUser) {
    throw new NotFoundError(
      `No employee found with the provided username: ${userName}. Please check your input.`
    );
  }

  res.status(StatusCodes.OK).json({ userName: deletedUser.name });
};

module.exports = { loginUser, registerUser, deleteUser, updateUser };
