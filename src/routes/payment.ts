import express from "express";
import {
  allCoupon,
  applyDiscount,
  deleteCoupon,
  newCoupon,
  newPaymentIntent,
} from "../controllers/payment.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

// payment - "/api/v1/payment/create"
app.post("/create", newPaymentIntent);

// create a new coupon - "/api/v1/payment/coupon/new"
app.post("/coupon/new", adminOnly, newCoupon);

// get discount - "/api/v1/payment/discount"
app.get("/discount", applyDiscount);

// get all coupons - "/api/v1/payment/coupon/all"
app.get("/coupon/all", adminOnly, allCoupon);

// delete a coupon - "/api/v1/payment/coupon/:id"
app.delete("/coupon/:id", adminOnly, deleteCoupon);

export default app;
