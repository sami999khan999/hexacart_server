import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { nodeCache } from "../app.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";

export const connectDB = (uri: string) => {
  mongoose
    .connect(uri, {
      dbName: "hexa_cart",
    })
    .then((c) => console.log(`DB Connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
};

export const invalidateCache = async ({
  product,
  order,
  admin,
  productId,
  orderId,
  userId,
}: InvalidateCacheProps) => {
  if (product) {
    const productKey: string[] = [
      "latest-product",
      "catagories",
      "all-products",
      `product-${productId}`,
    ];

    if (typeof productId === "string") {
      productKey.push(`product-${productId}`);
    }

    if (typeof productId === "object") {
      productId.map((i) => productKey.push(`product-${i}`));
    }

    nodeCache.del(productKey);
  }

  if (order) {
    const ordersKeys: string[] = [
      "all-orders",
      `order-${orderId}`,
      `my-order-${userId}`,
    ];

    nodeCache.del(ordersKeys);
  }

  if (admin) {
  }
};

export const reduceStock = async (orderItems: OrderItemType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];

    const product = await Product.findById(order.productId);

    if (!product) {
      throw new Error("Product not Found!");
    }
    product.stock -= order.quantity;

    await product.save();
  }
};
