import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, catagory, price, stock } = req.body;
    const photo = req.file;
    await Product.create({
        name,
        catagory: catagory.toLowerCase(),
        price,
        stock,
        photo: photo?.path,
    });
    return res.status(201).json({
        success: true,
        message: "Product Created Successfully",
    });
});
