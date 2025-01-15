const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define like schema
const likeSchema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    productName: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userAuth",
    },
    userName: {
      type: String,
      required: [true, "userName is required"],
      trim: true,
    },
    isLiked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const LikeModel = mongoose.model("like", likeSchema);
module.exports = LikeModel;
