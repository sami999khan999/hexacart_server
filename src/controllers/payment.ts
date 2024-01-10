import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandeler from "../utils/utility-class.js";

export const newPaymentIntent = TryCatch(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) {
    return next(new ErrorHandeler("Please Enter Amount", 400));
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number(amount) * 100,
    currency: "usd",
  });

  return res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

export const newCoupon = TryCatch(async (req, res, next) => {
  const { coupon, amount } = req.body;

  if (!coupon || !amount) {
    return next(new ErrorHandeler("Please Enter Both Fileds", 400));
  }

  await Coupon.create({
    code: coupon,
    amount,
  });

  return res.status(201).json({
    success: true,
    message: "Coupon Created Successfully",
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ code: coupon });

  if (!discount) {
    return next(new ErrorHandeler("Invalid Coupon Code", 400));
  }

  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});

export const allCoupon = TryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});

  if (!coupons) {
    return next(new ErrorHandeler("Coupons Not Available", 400));
  }

  return res.status(200).json({
    success: true,
    coupons,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  const coupon = await Coupon.findById(id);

  if (!coupon) {
    return next(new ErrorHandeler("Coupont Not Found", 400));
  }

  coupon.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Coupon Deleted Successfully",
  });
});
