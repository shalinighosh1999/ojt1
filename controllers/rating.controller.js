// 3rd-party moduel

// import model
const ProductModel = require("../Models/product/product.model");
const ProductRatingModel = require("../Models/rating/product.rating.model");

// Define create rating controller mehtod
const createRating = async (req, res) => {
  try {
    const { productId, rating, title, review } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    if (!productId || !rating) {
      return res.status(400).json({
        status: 400,
        message: "Product ID and rating are required fields",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 400,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if user has already rated this product
    const existingRating = await ProductRatingModel.findOne({
      userId,
      productId,
    });
    if (existingRating) {
      return res.status(400).json({
        status: 400,
        message: "You have already rated this product",
      });
    }

    // Check existing products
    const existingProduct = await ProductModel.findById(productId);

    // Create new rating
    const newRating = await ProductRatingModel.create({
      userId,
      userName,
      productId,
      productName: existingProduct.name,
      rating,
      title,
      review,
    });

    // Calculate new average rating for the product
    const allProductRatings = await ProductRatingModel.find({ productId });
    const averageRating =
      allProductRatings.reduce((acc, curr) => acc + curr.rating, 0) /
      allProductRatings.length;

    // Update product with new average rating
    await ProductModel.findByIdAndUpdate(productId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRatings: allProductRatings.length,
    });

    return res.status(201).json({
      status: 201,
      message: "Rating created successfully",
      data: newRating,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Define get rating  controller mehtod
const getRating = async (req, res) => {
  try {
    const userId = req.user._id;

    const ratings = await ProductRatingModel.find({ userId })
      .sort({
        createdAt: -1,
      })
      .select("-userId");

    if (ratings) {
      return res.status(200).json({
        status: 200,
        message: "User ratings retrieved successfully",
        data: ratings,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

module.exports = { createRating, getRating };
