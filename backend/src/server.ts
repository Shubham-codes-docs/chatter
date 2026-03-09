import express, { Application, Response } from "express";
import cors from "cors";
import prisma, { disconnectDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

const app: Application = express();

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

app.use("/api/auth", authRoutes);

// graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n📡 ${signal} received, closing gracefully...`);
  await disconnectDatabase();
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Start server
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    app.listen(process.env["PORT"], () => {
      console.log(
        `✅ Server running on http://localhost:${process.env["PORT"]}`,
      );
      console.log(`🌍 Environment: ${process.env["NODE_ENV"]}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
