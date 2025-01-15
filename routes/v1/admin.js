// Admin related routes are comming here

var express = require("express");
var router = express.Router();
const multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// import controller
const adminController = require("../../controllers/admin.controller");
const ProductController = require("../../controllers/product.controller");

// import others
const {
  adminRegisterValidator,
  loginValidator,
  passwordValidator,
  productCategoryValidator,
  productSubcategoryValidator,
} = require(".././../helper/validation");

///////////////////////////////////////  epin ///////////////////////////////////////////////////

// Define admin registration route
router.post(
  "/admin-registration",
  adminRegisterValidator,
  adminController.adminRegistration
);

// Define admin login route
router.post("/admin-login", loginValidator, adminController.adminLogin);

// Define update password route
router.post(
  "/update-password",
  passwordValidator,
  adminController.updatePassword
);

///////////////////////////////////////  epin ///////////////////////////////////////////////////

// Define create product category route
router.post(
  "/create-category",
  productCategoryValidator,
  adminController.createProductCategory
);

// Define get product category route
router.get("/get-category", adminController.getProductCategory);

// Define edit product category route
router.get("/edit-category/:categoryId", adminController.editProductCategory);

// Define update Product category route
router.post(
  "/update-category/:categoryId",
  adminController.updateProductCategory
);

// Define delete product category route
router.post(
  "/delete-categroy/:categoryId",
  adminController.deleteProductCategory
);

// Define create product sub-category route
router.post(
  "/create-subcategory",
  productSubcategoryValidator,
  adminController.createProductSubcategory
);

// Define get product sub-category route
router.get("/get-subcategory", adminController.getProductSubcategory);

// Define edit product subcategory route
router.get(
  "/edit-subcategory/:subcategoryId",
  adminController.editProductSubcategory
);

// Define update Product subcategory route
router.post(
  "/update-subcategory/:subcategoryId",
  adminController.updateProductSubcategory
);

// Define delete product subcategory route
router.post(
  "/delete-subcategroy/:subcategoryId",
  adminController.deleteProductSubcategory
);

// Define create product route
router.post("/create-product", ProductController.createProduct);

// Define get product route
router.get("/get-product", ProductController.getProduct);

// Define edit product route
router.get("/edit-product/:productId", ProductController.editProduct);

// Define update product route
router.post("/update-product/:productId", ProductController.updateProduct);

// Define delete product route
router.post("/delete-product/:productId", ProductController.deleteProduct);

module.exports = router;
