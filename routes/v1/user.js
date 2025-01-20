// user related route are comming here

var express = require("express");
var router = express.Router();
const multer = require("multer");
const path = require("path");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// import controller
const userController = require("../../controllers/user.controller");
const adminController = require("../../controllers/admin.controller");
const ProductController = require("../../controllers/product.controller");
const LikeController = require("../../controllers/like.controller");
const CommentController = require("../../controllers/comment.controller");
const ProductRatingController = require("../../controllers/rating.controller");
const CartController = require("../../controllers/cart.controller");
const OrderController = require("../../controllers/order.controller");

// import others
const {
  userRegisterValidator,
  loginValidator,
  passwordValidator,
} = require("../../helper/validation");

// ************************************** Auth route ************************************
// Define user registration route
router.post(
  "/user-registration",
  userRegisterValidator,
  userController.userRegistration
);

// Define user login route
router.post("/user-login", loginValidator, userController.userLogin);

// Define user update password route
router.post(
  "/update-password",
  passwordValidator,
  userController.updatePassword
);

// Define get user profile route
router.get("/get-profile", userController.getProfile);

// Define user logout route
router.post("/logout", userController.logout);

// *************************************************** product route *******************************

// Define create product route
router.post("/create-product", ProductController.createProduct);

// Define get product route
router.get("/get-product", ProductController.getProduct);

// Define get product category route
router.get("/get-category", adminController.getProductCategory);

// Define get product sub-category route
router.get("/get-subcategory", adminController.getProductCategory);

// Define get category wise sub-categorywise product route
router.post(
  "/get-category-subcategory-product",
  ProductController.getcategorySubcategoryProduct
);

// Define product search route
router.get("/product-search", ProductController.searchProduct);

// get single product route
router.get(
  "/get-single-product/:productId",
  ProductController.getSingleProduct
);

// ******************************************* Like route ********************************
// Define create like route
router.post("/create-like", LikeController.toggleLike);

// Define like status route
router.get("/like-status/:productId", LikeController.likeStatus);

// Define user's liked product route
router.get("/user-like-product", LikeController.getUserLikedProducts);

// Define user can like other comment
router.post("/like-other-comment/:commentId", LikeController.likeOtherComment);

// ************************************* Comment route ***************************************

// Define create comment route
router.post("/create-comment", CommentController.createComment);

// Define update comment route
router.put("/update-comment/:commentId", CommentController.upateComment);

// Define delete comment route
router.delete("/delete-comment/:commentId", CommentController.deleteCommnet);

// Get comment for a product
router.get(
  "/products/:productId/comments",
  CommentController.getProductComment
);

// Define user can add commnet on other comment
router.post(
  "/comments/:commentId/reply",
  CommentController.commentOnOtherComment
);

// *********************************** product rating *******************************
// Define create create route
router.post("/create-rating", ProductRatingController.createRating);

// Define get user rating route
router.get("/get-rating", ProductRatingController.getRating);

// Define get single product rating route
router.get(
  "/get-rating/:productId",
  ProductRatingController.getSingleProductRating
);

// Define update product rating
router.put(
  "/update-product-rating/:productId",
  ProductRatingController.updateProductRating
);

// Define delete product rating
router.delete(
  "/delete-product-rating/:ratingId",
  ProductRatingController.deleteProductRating
);

// ***************************************** Cart route *******************************************

// Adding product to cart route
router.post("/add-to-cart", CartController.addToCart);

// Get cart details route
router.get("/get-cart-details", CartController.getCartDetails);

// Remove from cart route
router.delete("/remove-from-cart/:productId", CartController.removeFromCart);

// clear cart route
router.delete("/clear-cart", CartController.clearCart);

// update item quantity in cart route
router.put(
  "/update-cart-quantity/:productId",
  CartController.updateCartQuantity
);

// ***************************************** Product Order Route *******************************************

// Define create order route
router.post("/create-order", OrderController.createOrder);

// Define all order for a particular user route
router.get("/get-all-order", OrderController.getAllOrder);

// Define single order for a particular user route
router.get("/get-single-order/:orderId", OrderController.getSingleOrder);

// Define update payment status route
router.patch(
  "/update-payment-status/:orderId",
  OrderController.updatePaymentStatus
);

// Define cancel order route
router.delete("/delete-order/:orderId", OrderController.deleteOrder);

// Define order tracking route
router.get("/track-order/:orderId", OrderController.trackingOrder);

module.exports = router;
