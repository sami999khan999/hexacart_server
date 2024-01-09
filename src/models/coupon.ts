import mongoose from "mongoose";

const Schema = mongoose.Schema;

const couponSchema = new Schema(
  {
    coupon: {
      type: String,
      required: [true, "Please Enter the Coupon Code"],
      unique: true,
    },
    amount: {
      type: Number,
      required: [true, "Please Enter Discount Amount"],
    },
  },
  {
    timestamps: true,
  }
);
