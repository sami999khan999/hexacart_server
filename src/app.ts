import express from "express";
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";

const port = 4000;

// mongo DB
connectDB();

const app = express();

// middlewares
app.use(express.json());

// Routes
app.use("/api/v1/user", userRoute);

// error middleware
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is listening on port:${port}`);
});
