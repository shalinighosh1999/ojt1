// 3rd-party module
const mongoose = require("mongoose");

// import model
const ProductCategoryModel = require("../Models/product/category.model");
const ProductSubcategoryModel = require("../Models/product/subCategory.model");
const productModel = require("../Models/product/product.model");
const ProductRatingModel = require("../Models/rating/product.rating.model");

// Define createProduct controller mehtod
const createProduct = async (req, res) => {
  try {
    const {
      categoryId,
      subcategoryId,
      name,
      description,
      price,
      quantity,
      image,
      images,
      color,
      brand,
    } = req.body;

    const category = await ProductCategoryModel.findOne({
      _id: categoryId,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        status: 404,
        mesasge: "No Category found",
      });
    }

    const subCategory = await ProductSubcategoryModel.findOne({
      _id: subcategoryId,
      isActive: true,
    });

    if (!subCategory) {
      return res.status(404).json({
        status: 404,
        mesasge: "No sub-category found",
      });
    }

    // Create the product with the verified data
    const productData = {
      categoryId,
      categoryName: category.name,
      subcategoryId,
      subcategoryName: subCategory.subcategoryName,
      name,
      userName: req.user.name,
      description,
      price,
      quantity,
      image,
      images,
      color,
      brand,
      createdBy: req.user._id,
    };

    const product = await productModel.create(productData);

    return res.status(201).json({
      status: 201,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define get product controller method
const getProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const totalProducts = await productModel.countDocuments({});
    const totalPages = Math.ceil(totalProducts / limit);

    const getProduct = await productModel.aggregate([
      {
        $match: {},
      },
      // Get likes information
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "productId",
          pipeline: [{ $match: { isLiked: true } }],
          as: "likes",
        },
      },
      // get rating information
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "productId",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                totalRatings: { $sum: 1 },
              },
            },
          ],
          as: "ratings",
        },
      },
      {
        $addFields: {
          totalLikes: { $size: "$likes" },
          rating: {
            average: { $round: [{ $first: "$ratings.averageRating" }, 1] },
            count: { $first: "$ratings.totalRatings" },
          },
        },
      },
      {
        $project: {
          likes: 0,
          ratings: 0,
        },
      },
      //pagination
      { $skip: skip },
      { $limit: limit },
    ]);

    //products were found after aggregation
    if (getProduct.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No products found",
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          productsPerPage: limit,
          totalProducts: totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        length: 0,
        data: [],
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Data fetch successfully",

      length: getProduct.length,
      data: getProduct,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        productsPerPage: limit,
        totalProducts: totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define edit product controller method
const editProduct = async (req, res) => {
  try {
    const prouctId = req.params.productId;

    const getProduct = await productModel.findById(prouctId);

    if (getProduct) {
      return res.status(200).json({
        status: 200,
        message: "Data fetch successfully",
        data: getProduct,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define update product controller mehtod
const updateProduct = async (req, res) => {
  try {
    const prouctId = req.params.productId;

    const productData = req.body;

    const existingProduct = await productModel.findById(prouctId);
    if (!existingProduct) {
      return res.status(400).json({
        message: "Product in not found in the database",
      });
    }

    const result = await productModel.findByIdAndUpdate(prouctId, productData, {
      new: true,
    });

    return res.status(200).json({
      status: 200,
      message: "Product updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define delete product controller method
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    const existingProduct = await productModel.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Product not found in the database",
      });
    }

    await productModel.findByIdAndDelete(productId);

    return res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define categorywise subcategorywise product controller
const getcategorySubcategoryProduct = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.body;

    const products = await productModel.find({
      categoryId: categoryId,
      subcategoryId: subcategoryId,
    });

    if (products.length <= 0) {
      return res.status(404).json({
        status: 404,
        message: "No product found",
      });
    }

    return res.status(200).json({
      status: 200,
      length: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      messgage: "Internal server error",
    });
  }
};

// Define product search controller mehtod
const searchProduct = async (req, res) => {
  try {
    // Extract query parameters from the request
    const { name } = req.query;

    let searchFilter = {};

    if (name) {
      searchFilter.name = { $regex: name, $options: "i" };
    }

    if (!name) {
      return res.status(400).json({
        status: 400,
        message:
          "At least one of the title or brand query parameters is required.",
      });
    }

    const result = await productModel.find(searchFilter);

    if (result.length <= 0) {
      return res.status(404).json({
        status: 404,
        message: "No product found",
      });
    } else {
      return res.status(200).json({
        status: 200,
        message: "Data successfully fetch",
        length: result.length,
        data: result,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Get single prooduct controller
const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const productDetails = await productModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(productId) },
      },
      // Get likes information
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "productId",
          pipeline: [{ $match: { isLiked: true } }],
          as: "likes",
        },
      },
      // Get commetn information
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "productId",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { userName: 1, comment: 1, createdAt: 1 } },
          ],
          as: "comments",
        },
      },
      // Get ratings information
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "productId",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                totalRatings: { $sum: 1 },
              },
            },
          ],
          as: "ratings",
        },
      },
      {
        $addFields: {
          totalLikes: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
          rating: {
            average: { $round: [{ $first: "$ratings.averageRating" }, 1] },
            count: { $first: "$ratings.totalRatings" },
          },
        },
      },
      {
        $project: {
          likes: 0,
          ratings: 0,
        },
      },
    ]);

    if (!productDetails || productDetails.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }

    if (productDetails) {
      return res.status(200).json({
        status: 200,
        message: "Data fetch successfully",
        data: productDetails[0],
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      messgage: "Internal server error",
    });
  }
};

// Define product sort controller mehtod
const sortProduct = async (req, res) => {
  try {
    const {
      sortBy = "price",
      order = "asc",
      colors,
      minPrice,
      maxPrice,
    } = req.query;

    // Validate sort parameters
    const validSortFields = ["price", "color"];
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid sort field. Allowed fields: price, color",
      });
    }

    const validOrders = ["asc", "desc"];
    if (!validOrders.includes(order.toLowerCase())) {
      return res.status(400).json({
        status: 400,
        message: "Invalid sort order. Use 'asc' or 'desc'",
      });
    }

    // Build query object
    const query = {};

    // Add color filter if provided
    if (colors) {
      const colorArray = colors.split(",").map((color) => color.trim());
      query.color = { $in: colorArray };
    }

    // Add price range filter if provided
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Build sort object
    const sortObject = {};

    // Handle color sorting
    if (sortBy === "color") {
      sortObject["color.0"] = order === "asc" ? 1 : -1; // Sort by first color in the array
    } else {
      sortObject[sortBy] = order === "asc" ? 1 : -1;
    }

    // Execute query with sorting
    const products = await productModel
      .find(query)
      .sort(sortObject)
      .select("-__v");

    // Return response
    return res.status(200).json({
      status: 200,
      message: "Products retrieved successfully",
      total: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Define filter product controller method
const filterProduct = async (req, res) => {
  try {
    const { brand, color, minPrice, maxPrice, rating } = req.query;

    let filterQuery = {};

    if (brand) {
      filterQuery.brand = { $regex: brand, $options: "i" };
    }

    if (color) {
      filterQuery.color = { $in: [color] };
    }

    if (minPrice || maxPrice) {
      filterQuery.price = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        filterQuery.price.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        filterQuery.price.$lte = Number(maxPrice);
      }
    }

    let products = await productModel.find(filterQuery);

    if (rating) {
      const ratingValue = parseFloat(rating);
      if (!isNaN(ratingValue)) {
        // Get product IDs
        const productIds = products.map((product) => product._id);

        // Fetch average ratings for these products
        const productRatings = await ProductRatingModel.aggregate([
          {
            $match: {
              productId: { $in: productIds },
              isDeleted: false,
            },
          },
          {
            $group: {
              _id: "$productId",
              averageRating: { $avg: "$rating" },
            },
          },
          {
            $match: {
              averageRating: { $gte: ratingValue },
            },
          },
        ]);

        // Get product IDs that meet the rating criteria
        const filteredProductIds = productRatings.map((item) => item._id);

        // Filter the products array to only include products with matching ratings
        products = products.filter((product) =>
          filteredProductIds.some((id) => id.equals(product._id))
        );
      }
    }

    return res.status(200).json({
      status: 200,
      message: "Products filtered successfully",
      totalProducts: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Define get product brand controller mehtod
const getProductsBrand = async (req, res) => {
  try {
    // Use distinct to get unique brand values
    const brands = await productModel.distinct("brand");

    // Filter out any null or empty brand values
    const filteredBrands = brands.filter((brand) => brand && brand.trim());

    // Check if any brands were found
    if (filteredBrands.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No brands found",
      });
    }

    // Return success response with brands
    if (filteredBrands) {
      return res.status(200).json({
        status: 200,
        message: "Brands retrieved successfully",
        data: filteredBrands,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Define get product color controller mehtod
const getProductsColor = async (req, res) => {
  try {
    // Use aggregate to unwind the color array and get unique values
    const colors = await productModel.aggregate([
      // Unwind the colors array
      { $unwind: "$color" },

      {
        $group: {
          _id: "$color",
        },
      },

      {
        $match: {
          _id: { $ne: null, $ne: "" },
        },
      },

      {
        $project: {
          _id: 0,
          color: "$_id",
        },
      },
    ]);

    // Extract colors into a simple array
    const colorArray = colors.map((item) => item.color);

    // Check if any colors were found
    if (colorArray.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No colors found",
      });
    }

    // Return success response with color array
    return res.status(200).json({
      status: 200,
      message: "Colors retrieved successfully",
      data: colorArray,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createProduct,
  getProduct,
  editProduct,
  updateProduct,
  deleteProduct,
  getcategorySubcategoryProduct,
  searchProduct,
  getSingleProduct,
  sortProduct,
  filterProduct,
  getProductsBrand,
  getProductsColor,
};
