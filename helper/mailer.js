// 3rd-party module
const nodeMailer = require("nodemailer");

//  Set up email transport
const transport = (senderEmail, password) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com", // fallback if environment variable is not set,
    port: process.env.EMAIL_PORT || 587, // default to standard SMTP port
    secure: false,
    requireTLS: true,
    auth: {
      user: senderEmail,
      pass: password,
    },
  });
  return transporter;
};

// Forgot password email verification
const forgotPasswordVerificationEmail = async (
  req,
  res,
  existingUser,
  transporter,
  generateTokenForForgotPassword
) => {
  // Verification email template
  const verificationEmailOptions = {
    from: `eShop <${process.env.SENDER_EMAIL}>`, // Professional format for sender
    to: existingUser.email,
    subject: "Action Required: Verify Your Account",
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Hello ${existingUser.name},</h2>
            <p style="color: #555; font-size: 16px;">
              You have requested to reset your password. Please click the button below to set a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${req.protocol}://${req.get(
      "host"
    )}/api/v1/user/password-confirmation/${existingUser.email}/${
      generateTokenForForgotPassword.token
    }" 
                 style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">
                 Reset Password
              </a>
            </div>
            <p style="color: #555; font-size: 14px;">
    Or copy and paste this link into your browser:
  </p>
  <p style="word-wrap: break-word; color: #555;">
  ${req.protocol}://${req.get("host")}/api/v1/user/password-confirmation/${
      existingUser.email
    }/${generateTokenForForgotPassword.token}
  </p>
            <p style="color: #555; font-size: 14px;">
              If you didn't request this, please ignore this email and your password will remain unchanged.
            </p>
            <p style="color: #555; font-size: 14px;">
              This password reset link is valid for 5 minutes.
            </p>
            <p style="color: #333; font-size: 16px;">
              Thank you,<br/>
              <strong>eShop</strong> Team
            </p>
          </div>
        `,
  };

  try {
    const info = await transporter.sendMail(verificationEmailOptions);
    // console.log(`Email sent: ${info.messageId}`);

    // Return if succesfully main is send
    return { status: true, messageId: info.messageId };
  } catch (error) {
    // console.error("Error sending email:", error.message);
    return {
      status: false,
      message: error.message,
    };
  }
};

// Forgot password email verification
const forgotPasswordVerificationEmailWithOtp = async (
  req,
  res,
  existingUser,
  transporter,
  otp
) => {
  // Verification email template
  const verificationEmailOptions = {
    from: `eShop <${process.env.SENDER_EMAIL}>`,
    to: existingUser.email,
    subject: "Password Reset OTP",
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Hello ${existingUser.name},</h2>
            <p style="color: #555; font-size: 16px;">
              You have requested to reset your password. Here is your OTP:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
                ${otp}
              </div>
            </div>
            <p style="color: #555; font-size: 14px;">
              This OTP is valid for 5 minutes only.
            </p>
            <p style="color: #555; font-size: 14px;">
              If you didn't request this, please ignore this email and your password will remain unchanged.
            </p>
            <p style="color: #333; font-size: 16px;">
              Thank you,<br/>
              <strong>eShop</strong> Team
            </p>
          </div>
        `,
  };

  try {
    const info = await transporter.sendMail(verificationEmailOptions);
    // console.log(`Email sent: ${info.messageId}`);

    // Return if succesfully main is send
    return { status: true, messageId: info.messageId };
  } catch (error) {
    // console.error("Error sending email:", error.message);
    return {
      status: false,
      message: error.message,
    };
  }
};

// Recall user password
const recallUserPassword = async (req, res, existingUser, transporter) => {
  // Verification email template
  const verificationEmailOptions = {
    from: `eShop <${process.env.SENDER_EMAIL}>`, // Professional format for sender
    to: existingUser.email,
    subject: "Action Required: Reset your Password",
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
              <h2 style="color: #333;">Hello ${existingUser.name},</h2>
              <p style="color: #555; font-size: 16px;">
               This is your password: <b>${existingUser.password}</b>
              </p>
          `,
  };

  try {
    const info = await transporter.sendMail(verificationEmailOptions);
    // console.log(`Email sent: ${info.messageId}`);

    // Return if succesfully main is send
    return { status: true, messageId: info.messageId };
  } catch (error) {
    // console.error("Error sending email:", error.message);
    return {
      status: false,
      message: error.message,
    };
  }
};

module.exports = {
  transport,
  forgotPasswordVerificationEmail,
  forgotPasswordVerificationEmailWithOtp,
  recallUserPassword,
};
