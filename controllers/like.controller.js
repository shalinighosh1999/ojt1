// 3rd-party module

// import model
const LikeModel = require("../Models/like/like.model");
const ProductModel = require("../Models/product/product.model");

// Define create like controller method
const toggleLike = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    // Check if user has already liked this product
    const existingLike = await LikeModel.findOne({ productId, userId });
    if (existingLike) {
      // toggle the like status
      existingLike.isLiked = !existingLike.isLiked;
      await existingLike.save();

      return res.status(200).json({
        status: 200,
        message: existingLike.isLiked ? "Liked Product" : "Disliked Product",
        data: existingLike,
      });
    }

    // Get the existing product based on id
    const existingProduct = await ProductModel.find({ _id: productId });

    // create new like
    const newLike = await LikeModel.create({
      productId,
      productName: existingProduct.name,
      userId,
      userName,
      isLiked: true,
    });

    if (newLike) {
      return res.status(201).json({
        status: 201,
        message: "Product Liked successfully",
        data: newLike,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server error",
    });
  }
};

// Define like status controller method
const likeStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Get like status for current user
    const userLikeStatus = await LikeModel.findOne({
      productId,
      userId,
    });

    // Get total likes count for the product
    const totalLikes = await LikeModel.countDocuments({
      productId,
      isLiked: true,
    });

    return res.status(200).json({
      status: 200,
      message: "Liked status retrieve successfully",
      data: {
        isLiked: userLikeStatus ? userLikeStatus.isLiked : false,
        totalLikes,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Define user's liked product controller mehtod
const getUserLikedProducts = async (req, res) => {
  try {
    const userId = req.user._id;

    const products = await LikeModel.find({ userId });
    if (products) {
      return res.status(200).json({
        status: 200,
        message: "Data fetch successfully",
        data: products,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

module.exports = { toggleLike, likeStatus, getUserLikedProducts };
