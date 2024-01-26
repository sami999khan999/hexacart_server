import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { nodeCache } from "../app.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";
import { Document } from "mongoose";

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
    nodeCache.del([
      "admin-stats",
      "admin-pie-charts",
      "admin-bar-charts",
      "admin-line-charts",
    ]);
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

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) {
    return thisMonth * 100;
  }

  const percent = (thisMonth / lastMonth) * 100;

  return Number(percent.toFixed(0));
};

export const getCatagories = async ({
  catagories,
  productsCount,
}: {
  catagories: string[];
  productsCount: number;
}) => {
  const catagoriesCountPromise = catagories.map((catagory) =>
    Product.countDocuments({ catagory })
  );

  const catagoriesCount = await Promise.all(catagoriesCountPromise);

  const catagoryCount: Record<string, number>[] = [];

  catagories.forEach((catagory, i) => {
    catagoryCount.push({
      [catagory]: Math.round((catagoriesCount[i] / productsCount) * 100),
    });
  });

  return catagoryCount;
};

interface MyDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}
type FuncProps = {
  length: number;
  docArr: MyDocument[];
  today: Date;
  property?: "discount" | "total";
};

export const getChartData = ({
  length,
  docArr,
  today,
  property,
}: FuncProps) => {
  const data: number[] = new Array(length).fill(0);

  docArr.forEach((i) => {
    const creationDate = i.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

    if (monthDiff < length) {
      if (property) {
        data[length - monthDiff - 1] += i[property]!;
      } else {
        data[length - monthDiff - 1] += 1;
      }
    }
  });

  return data;
};
