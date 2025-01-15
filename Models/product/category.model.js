const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define product category schema
const productCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "category name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ProductCategoryModel = mongoose.model(
  "productCategory",
  productCategorySchema
);
module.exports = ProductCategoryModel;
