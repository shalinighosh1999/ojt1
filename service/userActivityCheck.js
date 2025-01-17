// // activityMiddleware.js
// const UserAuthModel = require("../Models/userAuth.model");

// const updateUserActivity = async (req, res, next) => {
//   try {
//     if (req.user && req.user._id) {
//       await UserAuthModel.findByIdAndUpdate(req.user._id, {
//         lastActivityTime: new Date(),
//       });
//     }
//     next();
//   } catch (error) {
//     console.error("Error updating user activity:", error);
//     next();
//   }
// };

// module.exports = updateUserActivity;
