import express, { Application, Response } from "express";
import cors from "cors";
import prisma from "./config/db.js";

const app: Application = express();
const PORT = process.env["PORT"] || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// health check route
app.get("/health", async (_, res: Response) => {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    res.status(200).json({ status: "ok", database: "connected", userCount });
  } catch (error) {
    res.status(500).json({
      message: "Server is running",
      database: "Disconnected ❌",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
