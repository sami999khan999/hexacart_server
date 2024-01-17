import express from "express";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";
// route path
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";
import orderRoute from "./routes/order.js";
import paymentRoute from "./routes/payment.js";
import dashboardRoute from "./routes/stats.js";
config({
    path: "./.env",
});
const port = process.env.PORT || 4000;
const stripeKey = process.env.STRIPE_KEY || "";
connectDB(process.env.MONGO_URI || "");
export const stripe = new Stripe(stripeKey);
// Node Cache
export const nodeCache = new NodeCache();
const app = express();
// middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);
// image routes
app.use("/uploads", express.static("uploads"));
// error middleware
app.use(errorMiddleware);
app.listen(port, () => {
    console.log(`Server is listening on port:${port}`);
});
