import express from "express";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
// route path
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";
import orderRoute from "./routes/order.js";
import morgan from "morgan";
config({
    path: "./.env",
});
const port = process.env.PORT || 4000;
// mongo DB
connectDB(process.env.MONGO_URI || "");
const app = express();
// Node Cache
export const nodeCache = new NodeCache();
// middlewares
app.use(express.json());
app.use(morgan("dev"));
// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
// image routes
app.use("/uploads", express.static("uploads"));
// error middleware
app.use(errorMiddleware);
app.listen(port, () => {
    console.log(`Server is listening on port:${port}`);
});
