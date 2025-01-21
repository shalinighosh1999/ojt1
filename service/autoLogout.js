const cron = require("node-cron");
const UserAuthModel = require("../Models/userAuth.model");

// Auto logout function
const autoLogoutCheck = async () => {
  try {
    const twoHoursAgo = new Date(Date.now() - 1 * 60 * 1000); // 2 hours
    // 2 * 60 * 60 * 1000

    const result = await UserAuthModel.updateMany(
      {
        isLoggedIn: true,
        $or: [
          { updatedAt: { $lt: twoHoursAgo } },
          { updatedAt: { $exists: false } },
        ],
      },
      {
        $set: {
          isLoggedIn: false,
          status: "logout",
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`Auto logged out ${result.modifiedCount} users`);
    }
  } catch (error) {
    console.error("Auto logout error:", error);
  }
};

// Schedule cron job to run every minute
cron.schedule("* * * * *", autoLogoutCheck);

module.exports = {
  autoLogoutCheck,
};
