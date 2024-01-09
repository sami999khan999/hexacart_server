import express from "express";
import {
  allOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  porcessOrder,
} from "../controllers/order.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

// post a new order - "/api/v1/order/new"
app.post("/new", newOrder);

// get a single order - "/api/v1/order/my"
app.get("/my", myOrders);

// get a all order - "/api/v1/order/all"
app.get("/all", adminOnly, allOrders);

app
  .route("/:id")
  .get(getSingleOrder)
  .put(adminOnly, porcessOrder)
  .delete(adminOnly, deleteOrder);

export default app;
