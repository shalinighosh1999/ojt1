const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

// Define customer email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

// Define customer mobile number validation
const validateMobileNumber = (mobileNo) => {
  const mobileRegex = /^[0-9]{10}$/;

  return mobileRegex.test(mobileNo);
};

// Define user auth schema
const userAuthSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      validate: [validateEmail, "Please enter a valid email"],
    },
    mobileNo: {
      type: Number,
      unique: true,
      required: [true, "Mobile number is required"],
      validate: [
        validateMobileNumber,
        "Please enter a valid 10-digit phone number",
      ],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    hashedPassword: {
      type: String,
      required: [true, "hashed password is required"],
    },
    token: {
      type: String,
    },
    address: [
      {
        state: {
          type: String,
          required: [true, "state is required"],
          trim: true,
        },
        city: {
          type: String,
          required: [true, "city is required"],
          trim: true,
        },
        street: { type: String, trim: true, default: "N/A" },
        zipcode: {
          type: Number,
          required: [true, "zipcode is required"],
        },
      },
    ],
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["login", "logout"],
      default: "logout",
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    otp: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Method to hash the password using bcrypt before saving the user
userAuthSchema.statics.generateHashPassword = async function (password) {
  try {
    // Generate a salt with a cost factor of 10
    const salt = await bcrypt.genSalt(10);

    // Hash the provided password using the generated salt
    const hashPassword = await bcrypt.hash(password, salt);

    // Return the hashed password to be saved
    return hashPassword;
  } catch (error) {
    // If an error occurs during the hashing process, throw a custom error message
    throw new Error("Error generating hash");
  }
};

// Validate password
userAuthSchema.statics.validPassword = async function (
  password,
  hashedPassword
) {
  try {
    // Compare the provided password with the stored hashed password
    const comparePassword = await bcrypt.compare(password, hashedPassword);

    // Return true if the password matches, otherwise return false
    return comparePassword;
  } catch (error) {
    // If an error occurs during the comparison process, throw a custom error message
    throw new Error("Error comparing passwords");
  }
};

const userAuthModel = mongoose.model("userAuth", userAuthSchema);
module.exports = userAuthModel;
