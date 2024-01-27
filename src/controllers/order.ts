import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandeler from "../utils/utility-class.js";
import { nodeCache } from "../app.js";

export const newOrder = TryCatch(
  async (
    req: Request<{}, {}, NewOrderRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total) {
      return next(new ErrorHandeler("Please Enter All Fields", 400));
    }

    const order = await Order.create({
      shippingInfo,
      orderItems,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    await reduceStock(orderItems);

    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId)),
    });

    return res.status(201).json({
      success: true,
      message: "Order Placed Successfully ",
    });
  }
);

export const myOrders = TryCatch(async (req, res, next) => {
  const { id: user } = req.query;
  let orders = [];

  const key = `my-order-${user}`;

  if (nodeCache.has(key)) {
    orders = JSON.parse(nodeCache.get(key) as string);
  } else {
    orders = await Order.find({ user }).sort({ createdAt: -1 });
    nodeCache.set(key, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: true,
    orders,
  });
});

export const allOrders = TryCatch(async (req, res, next) => {
  let orders = [];

  const key = "all-orders";

  if (nodeCache.has(key)) {
    orders = JSON.parse(nodeCache.get(key) as string);
  } else {
    orders = await Order.find({})
      .populate("user", "name")
      .sort({ createdAt: -1 });
    nodeCache.set(key, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: true,
    orders,
  });
});

export const getSingleOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const key = `order-${id}`;

  let order;

  if (nodeCache.has(key)) {
    order = JSON.parse(nodeCache.get(key) as string);
  } else {
    order = await Order.findById(id).populate("user", "name");

    if (!order) return next(new ErrorHandeler("Order not found", 404));

    nodeCache.set(key, JSON.stringify(order));
  }

  return res.status(200).json({
    success: true,
    order,
  });
});

export const porcessOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  const order = await Order.findById(id);

  if (!order) return next(new ErrorHandeler("Order not found", 404));

  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;

    default:
      order.status = "Delivered";
      break;
  }

  await order.save();

  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    orderId: String(order._id),
    userId: String(order.user),
  });

  return res.status(200).json({
    success: true,
    message: "Order Processed Successfully",
  });
});

export const deleteOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  const order = await Order.findById(id);

  if (!order) {
    return next(new ErrorHandeler("Order Not Found", 404));
  }

  await order.deleteOne();

  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    orderId: String(order._id),
    userId: String(order.user),
  });

  return res.status(200).json({
    success: true,
    message: "Order Deleted Successfully",
  });
});
