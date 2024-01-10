import express from "express";
import {
  getBarCharts,
  getDashboardStats,
  getLineCharts,
  getPieCharts,
} from "../controllers/stats.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

// reute - /api/v1/dashboard/stats
app.get("/stats", adminOnly, getDashboardStats);

// reute - /api/v1/dashboard/pie
app.get("/pie", adminOnly, getPieCharts);

// reute - /api/v1/dashboard/bar
app.get("/bar", adminOnly, getBarCharts);

// reute - /api/v1/dashboard/line
app.get("/line", adminOnly, getLineCharts);

export default app;
