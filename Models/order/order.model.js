const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define order items schema
const orderItemsSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
  },
  productName: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be atleast 1"],
  },
  price: {
    type: Number,
    required: [true, "price is required"],
  },
});

// Define order schema
const orderSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userAuth",
    },
    userName: {
      type: String,
      trim: true,
    },
    orderItems: {
      type: [orderItemsSchema],
      required: [true, "order items is required"],
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "At least one order item is required",
      },
    },
    deliveryAddressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userAuth",
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: ["credit_card", "debit_card", "upi", "net_banking", "paypal"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    itemsPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    taxPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalPrice: {
      type: Number,
      min: 0,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const OrderModel = mongoose.model("order", orderSchema);
module.exports = OrderModel;
