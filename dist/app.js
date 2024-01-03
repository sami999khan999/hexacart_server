import express from "express";
import userRoute from "./routes/user.js";
const port = 3000;
const app = express();
// user Router
app.use("/api/v1/user", userRoute);
app.listen(() => {
    console.log(`Server is listening on port:${port}`);
});
