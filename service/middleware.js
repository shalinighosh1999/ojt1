// 3rd-party module
const jwt = require("jsonwebtoken");

// import model
const UserAuthModel = require("../Models/userAuth.model");

// import controller
var AdminController = require("../controllers/admin.controller");
var UserController = require("../controllers/user.controller");

var user = {};

// Middleware
const permission = [
  // Admin
  {
    url: "/admin/admin-registration",
  },
  {
    url: "/admin/admin-login",
  },

  // User
  {
    url: "/user/user-registration",
  },
  {
    url: "/user/user-login",
  },
];

// JWT secret keys for different roles
const JWT_SECRETS = {
  Admin: process.env.JWT_SECRET_KEY_ADMIN,
  User: process.env.JWT_SECRET_KEY_USER,
};

// Verify JWT token
const verifyToken = (token, userType) => {
  try {
    return jwt.verify(token, JWT_SECRETS[userType]);
  } catch (error) {
    return error;
  }
};

user.middleware = async (req, res, next) => {
  // Check if the route is public
  if (permission.filter((it) => it.url == req.url).length > 0) {
    return next();
  }

  // Check for authorization header
  if (!req.headers.authorization) {
    return res.status(200).json({
      error: "No credentials sent!",
      status: false,
      credentials: false,
    });
  }

  const authorization = req.headers.authorization;
  let userData;

  // Determine user type from headers, default to "User"
  const userType = req.headers.usertype || "User";

  // Verify JWT token first
  const decodedToken = verifyToken(authorization, userType);
  if (!decodedToken) {
    return res.status(200).json({
      error: "Invalid token",
      status: false,
      credentials: false,
    });
  }

  // Get user data based on role
  try {
    if (userType === "Admin") {
      userData = await AdminController.getTokenData(authorization);
    } else if (userType === "User") {
      userData = await UserController.getTokenData(authorization);
    }

    // If user data exists and is valid
    if (userData && userData != null) {
      userData.password = null;
      userData.token = null;

      // Attach user data to request object
      req.user = userData;
      req.userType = userType;
      req.token = authorization;

      // Update user's last activity time if it's a regular user
      if (userType === "User") {
        await UserAuthModel.findByIdAndUpdate(userData._id, {
          updatedAt: new Date(),
        });
      }

      return next();
    }

    // If no valid user data found
    return res.status(200).json({
      status: false,
      credentials: false,
      message: "A token is required for authentication",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Authentication error",
      status: false,
      credentials: false,
    });
  }
};

module.exports = user;
