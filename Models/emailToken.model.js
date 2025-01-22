// 3rd-party moduel
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define token Schema for Email verification
const tokenSchema = new Schema(
  {
    _userId: {
      type: Schema.Types.ObjectId,
      ref: "userAuth",
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: {
        expires: 300, // 300 seconds = 5 min
      },
    },
  },
  {
    versionKey: false,
  }
);

const EmailToken = new mongoose.model("emailToken", tokenSchema);
module.exports = EmailToken;
