const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define comment schema
const commentSchema = new Schema(
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
      trim: true,
    },
    comment: {
      type: String,
      required: [true, "comment is required"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const CommentModel = mongoose.model("comment", commentSchema);
module.exports = CommentModel;
