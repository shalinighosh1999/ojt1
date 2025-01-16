const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define product ratng schema
const productRating = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userAuth",
    },
    userName: {
      type: String,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    productName: {
      type: String,
    },
    rating: {
      type: Number,
      require: [true, "Product rating is required"],
      min: 1,
      max: 5,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      trim: true,
      maxLength: 1000,
    },
    review: {
      type: String,
      trim: true,
      maxLength: 1000,
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

const ProductRatingModel = mongoose.model("rating", productRating);
module.exports = ProductRatingModel;
