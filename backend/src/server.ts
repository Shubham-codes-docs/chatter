import { createServer } from "http";
import app from "./app.js";
import prisma, { disconnectDatabase } from "./config/db.js";
import { disconnectRedis } from "./config/redis.js";
import { initSocket } from "./services/SocketService.js";

const httpServer = createServer(app);
initSocket(httpServer);

// graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n📡 ${signal} received, closing gracefully...`);
  await disconnectDatabase();
  await disconnectRedis();
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Start server
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    httpServer.listen(process.env["PORT"], () => {
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
