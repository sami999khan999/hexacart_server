import express from "express";
import { myOrders, newOrder } from "../controllers/order.js";
const app = express.Router();
// post a new order - "/api/v1/order/new"
app.post("/new", newOrder);
// get a single order - "/api/v1/order/my"
app.get("/my", myOrders);
export default app;
