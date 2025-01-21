// import 3rd-party module
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

// import model
const UserAuthModel = require("../Models/userAuth.model");

// Import others
const generateOtp = require("../service/generateOtp");

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
  try {
    const { name, email, mobileNo, password, address } = req.body;

    const existingUser = await UserAuthModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: 409,
        message: "Sorry, User already exist with this email",
      });
    }

    const otp = await generateOtp(6);

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
      otp,
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
        message: "Please check your mobile for OTP Verrification",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Verify the OTP
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user._id;

    if (!otp) {
      return res.status(400).json({
        status: 400,
        message: "OTP are required",
      });
    }

    const user = await UserAuthModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: 400,
        message: "User is already verified",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        status: 400,
        message: "Invalid OTP",
      });
    }

    // Update user verification status
    const updatedUser = await UserAuthModel.findByIdAndUpdate(
      user._id,
      {
        isVerified: true,
        otp: null,
      },
      { new: true }
    );

    return res.status(200).json({
      status: 200,
      message: "OTP verified successfully. You can now login.",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define user login controller method
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await UserAuthModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        message: "Your are not register. Please register yourself",
      });
    }

    if (!existingUser.isVerified) {
      return res.status(400).json({
        status: 400,
        message:
          "You are not verified user. Please verify yourself before login",
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

    await UserAuthModel.findByIdAndUpdate(existingUser._id, {
      isLoggedIn: true,
      status: "login",
      loginTime: new Date(),
    });
    const updatedUser = await UserAuthModel.findById(existingUser._id);

    if (updatedUser) {
      return res.status(200).json({
        status: 200,
        message: "Login successfully",
        data: updatedUser,
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

// Define user logout controller mehtod
const logout = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserAuthModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    const twoHoursInactivity = new Date(
      user.updatedAt.getTime() + 1 * 60 * 1000
      // 2 * 60 * 60 * 1000
    );

    if (new Date() > twoHoursInactivity) {
      return res.status(401).json({
        status: 401,
        message: "Session expired due to inactivity. Please login again",
      });
    }

    const existingUser = await UserAuthModel.findByIdAndUpdate(userId, {
      isLoggedIn: false,
      status: "logout",
    });

    if (existingUser) {
      return res.status(200).json({
        status: 200,
        message: "Logout successfully",
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server error",
    });
  }
};

// Add new address of the user
const addNewAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { state, city, street, zipcode } = req.body;

    // Create new address object
    const newAddress = {
      state,
      city,
      street: street || "N/A",
      zipcode,
    };

    const updatedUser = await UserAuthModel.findByIdAndUpdate(
      userId,
      {
        $push: { address: newAddress },
      },
      { new: true }
    );

    //get the new address
    const addedAddress = updatedUser.address[updatedUser.address.length - 1];

    if (addedAddress) {
      return res.status(201).json({
        status: 201,
        message: "New address added successfully",
        data: addedAddress,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Get all address of the user controller method
const getAllAddress = async (req, res) => {
  try {
    const userId = req.user._id;

    const allAddress = await UserAuthModel.findById(userId, { address: 1 });

    if (allAddress) {
      return res.status(200).json({
        status: 200,
        message: "Address fetch successfully",
        data: allAddress,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Get single address of the user by id controller method
const getSingleAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user._id;

    const user = await UserAuthModel.findById(userId);
    const address = user.address.find(
      (addr) => addr._id.toString() === addressId
    );

    if (!address) {
      return res.status(404).json({
        status: 404,
        message: "address not found",
      });
    }

    if (address) {
      return res.status(200).json({
        status: 200,
        message: "Address fetch successfully",
        data: address,
      });
    }
  } catch (error) {
    return res.state(500).json({
      status: 500,
      message: "Internal server error",
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
  logout,
  addNewAddress,
  getAllAddress,
  getSingleAddress,
  verifyOtp,
};
