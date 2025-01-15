const { check } = require("express-validator");

// For Registration Valdation
exports.adminRegisterValidator = [
  check("name", "name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_lowercase: true,
    gmail_remove_dots: true,
  }),
  check("mobileNo", "Mobile no. must be 10 digits").isLength({
    min: 10,
    max: 10,
  }),
  check(
    "password",
    "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
];

exports.userRegisterValidator = [
  check("name", "name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail().normalizeEmail({
    gmail_lowercase: true,
    gmail_remove_dots: true,
  }),
  check("mobileNo", "Mobile no. must be 10 digits").isLength({
    min: 10,
    max: 10,
  }),
  check(
    "password",
    "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
  check("address.*.state").trim().notEmpty().withMessage("State is required"),
  check("address.*.city").trim().notEmpty().withMessage("City is required"),
  check("address.*.street").trim().notEmpty().withMessage("Street is required"),
  check("address.*.zipcode")
    .trim()
    .notEmpty()
    .withMessage("Zipcode is required"),
];

// For login validation
exports.loginValidator = [
  check("email")
    .isEmail()
    .withMessage("Please provide a valid email.")
    .normalizeEmail(),
  check("password")
    .not()
    .isEmpty()
    .isStrongPassword({
      minLength: 6,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
];

// For update passwrod validator
exports.passwordValidator = [
  check(
    "currentPassword",
    "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
  check(
    "newPassword",
    "Password must be greater than 6 character and contains at least one uppercase letter, one lowercase letter, one number and one special character"
  ).isStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }),
];

// For product category validator
exports.productCategoryValidator = [
  check("name").trim().notEmpty().withMessage("Category name is required"),
  check("description").trim().notEmpty().withMessage("Description is required"),
  check("image")
    .notEmpty()
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),
];

// For product subcategory validator
exports.productSubcategoryValidator = [
  check("categoryId").notEmpty().withMessage("Category ID is required"),
  // .isMongoId()
  // .withMessage("Invalid category ID format"),

  check("subcategoryName")
    .notEmpty()
    .withMessage("Subcategory name is required")
    .trim(),

  check("description").notEmpty().withMessage("Description is required").trim(),

  check("image")
    .notEmpty()
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),
];

// For product validator
exports.productValidator = [
  check("categoryId")
    .notEmpty()
    .withMessage("CategoryId is required")
    .isMongoId()
    .withMessage("Invalid category ID format"),

  // Subcategory validation
  check("subcategoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory ID format"),

  // Product details validation
  check("name").notEmpty().withMessage("Product name is required").trim(),

  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .trim(),

  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a positive integer"),

  check("image").notEmpty().isURL().withMessage("Image must be a valid URL"),

  check("images")
    .isArray()
    .withMessage("Images must be an array")
    .notEmpty()
    .withMessage("At least one product image is required"),
];
