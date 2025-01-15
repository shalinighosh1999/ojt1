// import model
const ProductCategoryModel = require("../Models/product/category.model");
const ProductSubcategoryModel = require("../Models/product/subCategory.model");
const productModel = require("../Models/product/product.model");

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
      createdBy: req.user._id,
    };

    const product = await productModel.create(productData);

    // Populate the category and subcategory information
    // const populatedProduct = await productModel
    //   .findById(product._id)
    //   .populate({
    //     path: "categoryId",
    //     select: "name description image",
    //   })
    //   .populate({
    //     path: "subcategoryId",
    //     select: "subcategoryName description image",
    //   });

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
    const getProduct = await productModel.find({});

    return res.status(200).json({
      status: 200,
      message: "Data fetch successfully",
      length: getProduct.length,
      data: getProduct,
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
  console.log(req);
  try {
    const prouctId = req.params.productId;

    const productData = req.body;
    console.log(productData);

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

module.exports = {
  createProduct,
  getProduct,
  editProduct,
  updateProduct,
  deleteProduct,
  getcategorySubcategoryProduct,
  searchProduct,
};
