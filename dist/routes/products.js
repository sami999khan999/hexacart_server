import express from "express";
import { deleteProduct, getAdminProduct, getAllCategories, getAllProduct, getLatestProducts, getSingleProduct, newProduct, updateProduct, } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";
import { adminOnly } from "../middlewares/auth.js";
const app = express.Router();
// create new product - "/api/v1/product/new"
app.post("/new", adminOnly, singleUpload, newProduct);
// get last 10 product - /api/v1/product/letest
app.get("/latest", getLatestProducts);
// get all product with filters - /api/v1/product/all
app.get("/all", getAllProduct);
// get upique categories - /api/v1/product/categories
app.get("/categories", getAllCategories);
// get all product - /api/v1/product/admin-product
app.get("/admin-product", adminOnly, getAdminProduct);
// get or update or delete a single product
app
    .route("/:id")
    .get(getSingleProduct)
    .put(adminOnly, singleUpload, updateProduct)
    .delete(adminOnly, deleteProduct);
export default app;
