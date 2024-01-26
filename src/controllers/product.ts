import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandeler from "../utils/utility-class.js";
import { rm } from "fs";
import { nodeCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";

export const newProduct = TryCatch(
  async (
    req: Request<{}, {}, NewProductRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, catagory, price, stock } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandeler("Please add Photo!", 400));

    if (!name || !catagory || !price || !stock) {
      rm(photo.path, () => {
        console.log("Deleted");
      });

      return next(new ErrorHandeler("Please enter all Fields!", 400));
    }

    await Product.create({
      name,
      catagory: catagory.toLowerCase(),
      price,
      stock,
      photo: photo?.path,
    });

    await invalidateCache({ product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);

// Revalidate on New, Update, Delete product and on New order
export const getLatestProducts = TryCatch(async (req, res, next) => {
  let products = [];

  if (nodeCache.has("latest-product")) {
    products = JSON.parse(nodeCache.get("latest-product") as string);
  } else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(6);
    nodeCache.set("latest-product", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

// Revalidate on New, Update, Delete product and on New order
export const getAllCategories = TryCatch(async (req, res, next) => {
  let catagories = [];

  if (nodeCache.has("catagories")) {
    catagories = JSON.parse(nodeCache.get("catagories") as string);
  } else {
    catagories = await Product.distinct("catagory");
    nodeCache.set("catagories", JSON.stringify(catagories));
  }

  return res.status(200).json({
    success: true,
    catagories,
  });
});

// Revalidate on New, Update, Delete product and on New order
export const getAdminProduct = TryCatch(async (req, res, next) => {
  let products = [];

  if (nodeCache.has("all-products")) {
    products = JSON.parse(nodeCache.get("all-products") as string);
  } else {
    products = await Product.find({}).sort({ createdAt: -1 });
    nodeCache.set("all-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

// Revalidate on New, Update, Delete product and on New order
export const getSingleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;

  if (nodeCache.has(`product-${id}`)) {
    product = JSON.parse(nodeCache.get(`product-${id}`) as string);
  } else {
    product = await Product.findById(id);

    if (!product) {
      return next(new ErrorHandeler("Product not Found", 404));
    }

    nodeCache.set(`product-${id}`, JSON.stringify(product));
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, catagory, price, stock } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);

  if (!product) {
    return next(new ErrorHandeler("Invalid product ID", 404));
  }

  if (photo) {
    rm(product.photo!, () => {
      console.log("Old photo Deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (catagory) product.catagory = catagory;

  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandeler("Product not Found", 404));
  }

  rm(product.photo!, () => {
    console.log("Product photo Deleted");
  });

  await product.deleteOne();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const getAllProduct = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, price, catagory } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };

    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };

    if (catagory) baseQuery.catagory = catagory;

    const productsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProduct] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);
