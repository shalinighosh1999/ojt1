const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define product category schema
const productSubcategorySchema = new Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productCategory",
    },
    subcategoryName: {
      type: String,
      required: [true, "sub-category name is required"],
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

const ProductSubcategoryModel = mongoose.model(
  "productSubcategory",
  productSubcategorySchema
);
module.exports = ProductSubcategoryModel;
