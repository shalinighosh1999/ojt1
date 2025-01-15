// import 3rd-party module
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

// import model
const UserAuthModel = require("../Models/userAuth.model");

// Generate Token
const createToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET_KEY_USER);
};

// Get token Data
const getTokenData = async (token) => {
  let userdata = await UserAuthModel.findOne({ token: token }).exec();
  return userdata;
};

// Define user registration controller
const userRegistration = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: "Validation Errors",
      errors: errors.array(),
    });
  }
  try {
    const { name, email, mobileNo, password, address } = req.body;

    const existingUser = await UserAuthModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: 409,
        message: "Sorry, User already exist with this email",
      });
    }

    let userData = {
      name,
      email,
      mobileNo,
      password,
      address: address.map((addrs) => ({
        state: addrs.state,
        city: addrs.city,
        street: addrs.street || "N/A",
        zipcode: addrs.zipcode,
      })),
    };

    const hashPassword = await UserAuthModel.generateHashPassword(password);

    userData.hashedPassword = hashPassword;

    const tokenData = {
      name: name,
      email: email,
      address,
      mobileNo,
    };

    // Token created
    const token = createToken(tokenData);
    userData.token = token;

    const result = await UserAuthModel.create(userData);
    if (result) {
      return res.status(201).json({
        status: 201,
        message: "Data created successfully",
        data: result,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define user login controller method
const userLogin = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: "Validation Errors",
      errors: errors.array(),
    });
  }
  try {
    const { email, password } = req.body;

    const existingUser = await UserAuthModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        message: "Your are not register. Please register yourself",
      });
    }

    const matchPassword = await UserAuthModel.validPassword(
      password,
      existingUser.hashedPassword // pass the user password which is already hashed
    );

    if (!matchPassword) {
      return res.status(401).json({
        status: 401,
        message: "Invalid password",
      });
    }

    if (existingUser) {
      return res.status(200).json({
        status: 200,
        message: "Login successfully",
        data: existingUser,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define Update Password controller mehtod
const updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: "Validation Errors",
      errors: errors.array(),
    });
  }
  try {
    const userId = req.user._id;

    const { currentPassword, newPassword } = req.body;

    const existingUser = await UserAuthModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const matchPassword = await UserAuthModel.validPassword(
      currentPassword,
      existingUser.hashedPassword // pass the user password which is already hashed
    );
    if (!matchPassword) {
      return res.status(401).json({
        status: 401,
        message: "Invalid password",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        status: 400,
        message: "New password must be different from current password",
      });
    }

    const hashPassword = await UserAuthModel.generateHashPassword(
      newPassword // Hash the password
    );

    existingUser.password = newPassword;
    existingUser.hashedPassword = hashPassword;
    const result = await existingUser.save();

    if (result) {
      res.status(200).json({
        status: 200,
        message: "Password updated successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define get user profile controller method
const getProfile = async (req, res) => {
  try {
    const userData = await UserAuthModel.findById(req.user._id);

    if (!userData) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: 200,
      data: userData,
      message: "User profile fetch successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

module.exports = {
  createToken,
  getTokenData,
  userRegistration,
  userLogin,
  updatePassword,
  getProfile,
};
