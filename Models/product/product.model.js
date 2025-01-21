const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define product category schema
const productSchema = new Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productCategory",
      required: [true, "CategoryId is required"],
    },
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    subcategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productSubcategory",
    },
    subcategoryName: {
      type: String,
      required: [true, "sub-category name is required"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    userName: {
      type: String,
    },
    brand: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    color: {
      type: [String],
      trim: true,
      default: [],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    image: {
      type: String,
    },
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
    },
    createdBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const ProductSubcategoryModel = mongoose.model("product", productSchema);
module.exports = ProductSubcategoryModel;
