import mongoose from "mongoose";
import { nodeCache } from "../app.js";
import { Product } from "../models/product.js";
export const connectDB = (uri) => {
    mongoose
        .connect(uri, {
        dbName: "hexa_cart",
    })
        .then((c) => console.log(`DB Connected to ${c.connection.host}`))
        .catch((e) => console.log(e));
};
export const invalidateCache = async ({ product, order, admin, productId, orderId, userId, }) => {
    if (product) {
        const productKey = [
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
        const ordersKeys = [
            "all-orders",
            `order-${orderId}`,
            `my-order-${userId}`,
        ];
        nodeCache.del(ordersKeys);
    }
    if (admin) {
    }
};
export const reduceStock = async (orderItems) => {
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
