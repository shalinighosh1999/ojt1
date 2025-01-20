// 3rd-party module

// import model
const OrderModel = require("../Models/order/order.model");
const ProductModel = require("../Models/product/product.model");
const UserModel = require("../Models/userAuth.model");

// Define create order controller method
const createOrder = async (req, res) => {
  try {
    const { orderItems, deliveryAddressId, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!orderItems?.length || !deliveryAddressId || !paymentMethod) {
      return res.status(400).json({
        status: false,
        message: "Please provide all required fields",
      });
    }

    // Get user details
    const user = await UserModel.findById(userId);
    const deliveryAddress = user.address.find(
      (addr) => addr._id.toString() === deliveryAddressId
    );
    if (!deliveryAddress) {
      return res.status(404).json({
        status: 404,
        message: "Delivery address not found",
      });
    }
    const formattedAddress = `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.zipcode}`;

    // Get product details and calculate prices
    let itemPrice = 0;
    const processOrderItems = [];

    for (const item of orderItems) {
      const product = await ProductModel.findById(item.productId);

      if (!product || product.quantity < item.quantity) {
        return res.status(400).json({
          status: false,
          message: `Invalid product or insufficient stock for ${
            product?.name || "product"
          }`,
        });
      }

      processOrderItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: Number(product.price.toFixed(2)),
      });

      // calculate the price
      itemPrice += Number((item.quantity * product.price).toFixed(2));
    }

    // Calculate final prices
    const shippingPrice = Number((200).toFixed(2));
    const taxPrice = Number((itemPrice * 0.18).toFixed(2));
    const totalPrice = Number(
      (itemPrice + shippingPrice + taxPrice).toFixed(2)
    );

    // Create order
    const order = await OrderModel.create({
      userId,
      userName: req.user.name,
      orderItems: processOrderItems,
      deliveryAddressId,
      deliveryAddress: formattedAddress,
      paymentMethod,
      itemsPrice: itemPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });

    // Update product quantities
    const updatedOrder = await Promise.all(
      processOrderItems.map((item) =>
        ProductModel.findByIdAndUpdate(item.productId, {
          $inc: { quantity: -item.quantity },
        })
      )
    );

    if (updatedOrder) {
      return res.status(201).json({
        status: 201,
        message: "Order created successfully",
        data: order,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

// Define get all order controller method
const getAllOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const getAllOrder = await OrderModel.find({ userId, isDeleted: false });

    if (getAllOrder.length > 0) {
      return res.status(200).json({
        status: 200,
        message: "Data fetch successfully",
        length: getAllOrder.length,
        data: getAllOrder,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No Order found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Define get single order controller mehtod
const getSingleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const singleOrder = await OrderModel.findOne({
      _id: orderId,
      userId,
      isDeleted: false,
    });

    if (!singleOrder) {
      res.status(404).json({
        status: 404,
        message: "No order found",
      });
    }

    if (singleOrder) {
      return res.status(200).json({
        status: 200,
        message: "Data fetch successfully",
        data: singleOrder,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Define update order status by admin controller method
const updateOrderStatusbyAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (req.userType !== "Admin") {
      return res.status(401).json({
        status: 401,
        message: "You are not authorized to access",
      });
    }

    const updateOrderStatus = await OrderModel.findByIdAndUpdate(
      { _id: orderId },
      {
        orderStatus,
      },
      { new: true }
    );

    if (updateOrderStatus) {
      return res.status(200).json({
        status: 200,
        message: "Order status updated successfully",
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

// Define udpate payment status controller mehtod
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const updateOrder = await OrderModel.findByIdAndUpdate(
      { _id: orderId },
      {
        paymentStatus,
      },
      {
        new: true,
      }
    );

    if (updateOrder) {
      res.status(200).json({
        status: 200,
        message: "Payment status successfully updated",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Define delete order controller mehtod
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const deleteOrder = await OrderModel.findByIdAndUpdate(
      { _id: orderId },
      {
        isDeleted: true,
      },
      { new: true }
    );

    if (deleteOrder) {
      return res.status(200).json({
        status: 200,
        message: "Order deleted successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Define tracking order controller method
const trackingOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const existingOrder = await OrderModel.findOne({
      _id: orderId,
      isDeleted: false,
    }).select("-isDeleted");

    if (!existingOrder) {
      return res.status(404).json({
        status: 404,
        message: "Order not found",
      });
    }

    // // Prepare tracking information
    // const trackingInfo = {
    //   orderId: existingOrder._id,
    //   orderStatus: existingOrder.orderStatus,
    //   orderDate: existingOrder.createdAt,
    //   lastUpdated: existingOrder.updatedAt,
    //   deliveryAddress: existingOrder.deliveryAddress,
    //   items: existingOrder.orderItems.map((item) => ({
    //     productName: item.productName,
    //     quantity: item.quantity,
    //     price: item.price,
    //   })),
    //   paymentStatus: existingOrder.paymentStatus,
    //   paymentMethod: existingOrder.paymentMethod,
    //   pricing: {
    //     itemsPrice: existingOrder.itemsPrice,
    //     shippingPrice: existingOrder.shippingPrice,
    //     taxPrice: existingOrder.taxPrice,
    //     totalPrice: existingOrder.totalPrice,
    //   },
    // };

    let statusMessage;
    switch (existingOrder.orderStatus) {
      case "pending":
        statusMessage = "Your order has been placed and is being processed";
        break;
      case "shipped":
        statusMessage = "Your order is on its way";
        break;
      case "delivered":
        statusMessage = "Your order has been delivered successfully";
        break;
      case "cancelled":
        statusMessage = "This order has been cancelled";
        break;
      default:
        statusMessage = "Order status unknown";
    }

    return res.status(200).json({
      status: 200,
      message: "Order tracking details retrieved successfully",
      statusMessage,
      //   data: trackingInfo,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createOrder,
  getAllOrder,
  getSingleOrder,
  updateOrderStatusbyAdmin,
  updatePaymentStatus,
  deleteOrder,
  trackingOrder,
};
