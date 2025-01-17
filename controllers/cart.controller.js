// 3rd-party module

// import model
const CartModel = require("../Models/cart/cart.model");
const ProductModel = require("../Models/product/product.model");

// Define add to cart controller mehtod
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    // Convert quantity to number and set default if not provided
    const itemQuantity = Number(quantity) || 1;

    // find the product
    const product = await ProductModel.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }

    // Find existing cart for the user
    let cart = await CartModel.findOne({ userId });
    if (cart) {
      // Cart exists, check if product is already in cart
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        // Update quantity if product exists (ensure number addition)
        existingItem.quantity = Number(existingItem.quantity) + itemQuantity;
      } else {
        // Add new item if product doesn't exist in cart
        cart.items.push({
          productId,
          productName: product.name,
          quantity: itemQuantity,
          price: product.price,
        });
      }

      cart = await cart.save();
    } else {
      // Create new cart if it doesn't exist
      cart = await CartModel.create({
        userId,
        userName,
        items: [
          {
            productId,
            productName: product.name,
            quantity: itemQuantity,
            price: product.price,
          },
        ],
      });
    }

    // Calculate updated totals
    cart.subTotal = Number(
      cart.items
        .reduce(
          (total, item) => parseInt(total + item.price * item.quantity),
          0
        )
        .toFixed(2)
    );
    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    await cart.save();

    return res.status(200).json({
      status: 200,
      message: "Product added to cart successfully",
      data: cart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Define get cart details controller mehtod
const getCartDetails = async (req, res) => {
  try {
    const userId = req.user._id;

    const cartDetails = await CartModel.findOne({ userId });

    if (cartDetails) {
      return res.status(200).json({
        status: 200,
        message: "Cart details fetch successfully",
        data: cartDetails,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Remove from cart controller mehtod
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Remove product from cart and update totals in one operation
    const updatedCart = await CartModel.findOneAndUpdate(
      { userId },
      {
        $pull: { items: { productId } },
        $inc: { totalItems: -1 },
      },
      { new: true }
    );

    // Recalculate cart totals
    updatedCart.subTotal = updatedCart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    updatedCart.totalItems = updatedCart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    await updatedCart.save();

    return res.status(200).json({
      status: 200,
      message: "Item removed from cart",
      data: updatedCart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// clear cart controller method
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await CartModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          items: [],
          subTotal: 0,
          totalItems: 0,
        },
      },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({
        status: 404,
        message: "Cart not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// update cart quantity controller mehtod
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    // Input validation
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: 400,
        message: "Invalid quantity value",
      });
    }

    // Find the cart for the user
    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        status: 404,
        message: "Cart not found",
      });
    }

    // Find the item index in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        status: 404,
        message: "Product not found in cart",
      });
    }

    // Get the old quantity for calculation
    const oldQuantity = cart.items[itemIndex].quantity;
    const itemPrice = cart.items[itemIndex].price;

    // Update item quantity
    cart.items[itemIndex].quantity = quantity;

    // Recalculate cart totals
    cart.subTotal = Number(
      (cart.subTotal - oldQuantity * itemPrice + quantity * itemPrice).toFixed(
        2
      )
    );
    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Save the updated cart
    await cart.save();

    return res.status(200).json({
      status: 200,
      message: "Cart quantity updated successfully",
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

module.exports = {
  addToCart,
  getCartDetails,
  removeFromCart,
  clearCart,
  updateCartQuantity,
};
