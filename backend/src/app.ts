import express, { Application, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import prisma from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import UploadRoutes from "./routes/uploadRoutes.js";
import { errorHandler } from "./middleware/errorMiddleWare.js";

const app: Application = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.1.100:5173",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
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

// auth routes
app.use("/api/auth", authRoutes);
// conversation routes
app.use("/api/conversations", conversationRoutes);
// message routes
app.use("/api/messages", messageRoutes);
// user routes
app.use("/api/users", userRoutes);
// upload routes
app.use("/api/upload", UploadRoutes);

// error handler
app.use(errorHandler);

export default app;
