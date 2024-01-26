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
        nodeCache.del([
            "admin-stats",
            "admin-pie-charts",
            "admin-bar-charts",
            "admin-line-charts",
        ]);
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
export const calculatePercentage = (thisMonth, lastMonth) => {
    if (lastMonth === 0) {
        return thisMonth * 100;
    }
    const percent = (thisMonth / lastMonth) * 100;
    return Number(percent.toFixed(0));
};
export const getCatagories = async ({ catagories, productsCount, }) => {
    const catagoriesCountPromise = catagories.map((catagory) => Product.countDocuments({ catagory }));
    const catagoriesCount = await Promise.all(catagoriesCountPromise);
    const catagoryCount = [];
    catagories.forEach((catagory, i) => {
        catagoryCount.push({
            [catagory]: Math.round((catagoriesCount[i] / productsCount) * 100),
        });
    });
    return catagoryCount;
};
export const getChartData = ({ length, docArr, today, property, }) => {
    const data = new Array(length).fill(0);
    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
        if (monthDiff < length) {
            if (property) {
                data[length - monthDiff - 1] += i[property];
            }
            else {
                data[length - monthDiff - 1] += 1;
            }
        }
    });
    return data;
};
