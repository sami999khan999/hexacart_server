import express from "express";
import { deleatUser, getAllUsers, getUser, newUser, } from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";
const app = express.Router();
// routes - "/api/v1/user/new"
app.post("/new", newUser);
// routes - "/api/v1/user/all"
app.get("/all", adminOnly, getAllUsers);
// routes - "/api/v1/user/:id"
app.get("/:id", adminOnly, getUser);
// routes - "/api/v1/user/:id"
app.delete("/:id", adminOnly, deleatUser);
export default app;
