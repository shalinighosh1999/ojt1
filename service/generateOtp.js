// Import model
const EmailTokenModel = require("../Models/emailToken.model");
const crypto = require("crypto");

async function generateOtp(length = 4) {
  // Ensure the length is a positive integer
  length = Math.abs(Math.floor(length));

  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;

  // Pad with leading zeros if necessary
  return otp.toString().padStart(length, "0");
}

// Create forgot password email token
async function createEmailToken(userId) {
  try {
    const token = new EmailTokenModel({
      _userId: userId,
      token: crypto.randomBytes(16).toString("hex"),
    });
    const createToken = await EmailTokenModel.create(token);

    return createToken;
  } catch (error) {
    throw new Error("Failed to generate new token");
  }
}
module.exports = { generateOtp, createEmailToken };
