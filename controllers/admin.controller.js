// Import 3rd-party module
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

// Import model
const AdminAuthModel = require("../Models/adminAuth.model");
const ProductCategoryModel = require("../Models/product/category.model");
const ProductSubcategoryModel = require("../Models/product/subCategory.model");

// Generate Token
const createToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET_KEY_ADMIN);
};

// Get token Data
const getTokenData = async (token) => {
  let admindata = await AdminAuthModel.findOne({ token: token }).exec();
  return admindata;
};

// Admin registration controller
const adminRegistration = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: "Validation Errors",
      errors: errors.array(),
    });
  }
  try {
    const { name, email, mobileNo, password } = req.body;
    const existingUser = await AdminAuthModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: 409,
        message: "Sorry, User already exists with this email",
      });
    }
    let userData = {
      name,
      email,
      mobileNo,
      password,
    };

    const hashPassword = await AdminAuthModel.generateHashPassword(password);
    userData.password = hashPassword;

    const tokenData = {
      name: name,
      email: email,
      mobileNo,
    };

    // Token created
    const token = createToken(tokenData);
    userData.token = token;

    const result = await AdminAuthModel.create(userData);
    if (result) {
      return res.status(201).json({
        status: 201,
        message: "Data created successfully",
        data: result,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define admin login controller
const adminLogin = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: "Validation Errors",
      errors: errors.array(),
    });
  }
  try {
    const { email, password } = req.body;

    const existingUser = await AdminAuthModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        message: "Your are not register. Please register yourself",
      });
    }

    const matchPassword = await AdminAuthModel.validPassword(
      password,
      existingUser.password // pass the user password which is already hashed
    );

    if (!matchPassword) {
      return res.status(401).json({
        status: 401,
        message: "Invalid password",
      });
    }

    if (existingUser) {
      return res.status(200).json({
        status: 200,
        message: "Login successfully",
        data: existingUser,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define update password controller
const updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: "Validation Errors",
      errors: errors.array(),
    });
  }
  try {
    const userId = req.user._id;

    const { currentPassword, newPassword } = req.body;

    const existingUser = await AdminAuthModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const matchPassword = await AdminAuthModel.validPassword(
      currentPassword,
      existingUser.password // pass the user password which is already hashed
    );
    if (!matchPassword) {
      return res.status(401).json({
        status: 401,
        message: "Invalid password",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        status: 400,
        message: "New password must be different from current password",
      });
    }

    const hashPassword = await AdminAuthModel.generateHashPassword(
      newPassword // Hash the password
    );

    existingUser.password = hashPassword;
    const result = await existingUser.save();

    if (result) {
      res.status(200).json({
        status: 200,
        message: "Password updated successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define create product category controller method
const createProductCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: "Validation Errors",
      errors: errors.array(),
    });
  }
  try {
    const productCategory = await ProductCategoryModel.create(req.body);

    if (productCategory) {
      return res.status(201).json({
        status: 201,
        message: "Data created successfully",
        data: productCategory,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define get product category controller mehtod
const getProductCategory = async (req, res) => {
  try {
    const getProductCategory = await ProductCategoryModel.find({});

    return res.status(200).json({
      status: 200,
      message: "Data fetch successfully",
      length: getProductCategory.length,
      data: getProductCategory,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define edit product category
const editProductCategory = async (req, res) => {
  try {
    const productId = req.params.categoryId;

    const getProduct = await ProductCategoryModel.findById(productId);

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

// Define update product category
const updateProductCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const productData = req.body;

    const existingCategory = await ProductCategoryModel.findById(categoryId);
    if (!existingCategory) {
      return res.status(400).json({
        message: "Product category in not found in the database",
      });
    }

    const result = await ProductCategoryModel.findByIdAndUpdate(
      categoryId,
      productData,
      {
        new: true,
      }
    );

    return res.status(200).json({
      status: 200,
      message: "Category updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define delete product category controller mehtod
const deleteProductCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const existingCategory = await ProductCategoryModel.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({
        status: "error",
        message: "Product category not found in the database",
      });
    }

    await ProductCategoryModel.findByIdAndDelete(categoryId);

    return res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Define product sub-category controller method
const createProductSubcategory = async (req, res) => {
  try {
    const productSubcategory = await ProductSubcategoryModel.create(req.body);
    const productCategory = await ProductCategoryModel.findById(
      req.body.categoryId
    );

    if (productSubcategory) {
      return res.status(201).json({
        status: 201,
        message: "Data created successfully",
        data: productSubcategory,
        categoryName: productCategory.name,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define get product category controller mehtod
const getProductSubcategory = async (req, res) => {
  try {
    const getProductSubcategory = await ProductSubcategoryModel.find({});

    return res.status(200).json({
      status: 200,
      message: "Data fetch successfully",
      data: getProductSubcategory,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define edit product subcategory
const editProductSubcategory = async (req, res) => {
  try {
    const productId = req.params.subcategoryId;

    const getSubcategroy = await ProductSubcategoryModel.findById(productId);

    if (getSubcategroy) {
      return res.status(200).json({
        status: 200,
        message: "Data fetch successfully",
        data: getSubcategroy,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define update product subcategory
const updateProductSubcategory = async (req, res) => {
  try {
    const subcategoryId = req.params.subcategoryId;

    const productData = req.body;

    const existingSubcategory = await ProductSubcategoryModel.findById(
      subcategoryId
    );
    if (!existingSubcategory) {
      return res.status(400).json({
        message: "Product sub-category in not found in the database",
      });
    }

    const result = await ProductSubcategoryModel.findByIdAndUpdate(
      subcategoryId,
      productData,
      {
        new: true,
      }
    );

    return res.status(200).json({
      status: 200,
      message: "Sub-category updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define delete product sub-category controller mehtod
const deleteProductSubcategory = async (req, res) => {
  try {
    const subcategoryId = req.params.subcategoryId;

    const existingSubcategory = await ProductSubcategoryModel.findById(
      subcategoryId
    );
    if (!existingSubcategory) {
      return res.status(404).json({
        status: "error",
        message: "Product sub-category not found in the database",
      });
    }

    await ProductSubcategoryModel.findByIdAndDelete(subcategoryId);

    return res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Export the controller
module.exports = {
  createToken,
  getTokenData,
  adminRegistration,
  adminLogin,
  updatePassword,
  createProductCategory,
  createProductSubcategory,
  getProductCategory,
  editProductCategory,
  updateProductCategory,
  deleteProductCategory,
  getProductSubcategory,
  editProductSubcategory,
  updateProductSubcategory,
  deleteProductSubcategory,
};
