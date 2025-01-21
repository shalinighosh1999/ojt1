async function generateOtp(length = 4) {
  // Ensure the length is a positive integer
  length = Math.abs(Math.floor(length));

  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;

  // Pad with leading zeros if necessary
  return otp.toString().padStart(length, "0");
}

module.exports = generateOtp;
