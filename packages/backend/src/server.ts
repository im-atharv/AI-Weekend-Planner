import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import config from "./config/index.js";
import planRoutes from "./routes/plans.js";
import userRoutes from "./routes/users.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://curate-ai.onrender.com"],
  credentials: true
}))
app.use(express.json());

connectDB();

app.use("/api/plans", planRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Curate backend is running" });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Curate backend listening on port ${config.port}`);
});