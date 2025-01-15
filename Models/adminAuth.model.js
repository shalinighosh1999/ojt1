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

// Define adminAuth schema
const adminAuthSchema = new Schema(
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
      trim: true,
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
    },
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Method to hash the password using bcrypt before saving the user
adminAuthSchema.statics.generateHashPassword = async function (password) {
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
adminAuthSchema.statics.validPassword = async function (
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

const adminAuthModel = mongoose.model("adminAuth", adminAuthSchema);
module.exports = adminAuthModel;
