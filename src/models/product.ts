import { timeStamp } from "console";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter Name!"],
    },
    photo: {
      type: String,
      required: [true, "Please enter Photo!"],
    },
    price: {
      type: Number,
      required: [true, "Please enter Price!"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter Stock!"],
    },
    catagory: {
      type: String,
      required: [true, "Please enter Catagory!"],
      trim: true,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
