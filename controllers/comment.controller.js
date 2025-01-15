// 3rd-party module

// Import model
const ProductModel = require("../Models/product/product.model");
const CommentModel = require("../Models/comment/comment.model");

// Define create comment controller method
const createComment = async (req, res) => {
  try {
    const { productId, comment } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    // get existing product
    const existingProduct = await ProductModel.find({ _id: productId });

    // create comment
    const createComment = await CommentModel.create({
      productId,
      productName: existingProduct.name,
      userId,
      userName,
      comment,
    });

    if (createComment) {
      return res.status(201).json({
        status: 201,
        message: "Comment created successfully",
        data: createComment,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Define upate comment controller mehtod
const upateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    // Validate if comment text is provided
    if (!comment) {
      return res.status(400).json({
        status: 400,
        message: "Comment text is required",
      });
    }

    // Find comment and verify ownership
    const existingComment = await CommentModel.findOne({
      _id: commentId,
      userId,
      isDeleted: false,
    });
    if (!existingComment) {
      return res.status(404).json({
        status: 404,
        message: "Comment not found or you don't have permission to update",
      });
    }

    // update the comment
    const updatedComment = await CommentModel.findByIdAndUpdate(
      commentId,
      { comment },
      { new: true }
    );

    if (updatedComment) {
      return res.status(200).json({
        status: 200,
        message: "Comment updated successfully",
        data: updatedComment,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server error" });
  }
};

// Define delete comment controller mehtod
const deleteCommnet = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    // Find comment and verify ownership
    const existingComment = await CommentModel.findOne({
      _id: commentId,
      userId,
      isDeleted: false,
    });
    if (!existingComment) {
      return res.status(404).json({
        status: 404,
        message: "Comment not found or you don't have permission to update",
      });
    }

    // soft delete comment
    const deleteComment = await CommentModel.findByIdAndUpdate(
      commentId,
      {
        isDeleted: true,
      },
      { new: true }
    );

    if (deleteComment) {
      return res.status(200).json({
        status: 200,
        message: "Comment deleted successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Define getProductComment controller method
const getProductComment = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get all comments for the product
    const allComments = await CommentModel.find({
      productId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .select("-isDeleted");

    if (allComments) {
      res.status(200).json({
        status: 200,
        message: "Comment fetch successfully",
        data: allComments,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server error",
    });
  }
};

module.exports = {
  createComment,
  upateComment,
  deleteCommnet,
  getProductComment,
};
