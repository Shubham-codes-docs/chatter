import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Validate required env vars
if (!process.env["DB_PASSWORD"]) {
  throw new Error("DB_PASSWORD environment variable is required");
}

if (!process.env["JWT_ACCESS_TOKEN_SECRET"]) {
  throw new Error("JWT_ACCESS_TOKEN_SECRET environment variable is required");
}

// Pool configuration
const pool = new Pool({
  host: process.env["DB_HOST"] || "localhost",
  port: parseInt(process.env["DB_PORT"] || "5432"),
  user: process.env["DB_USER"] || "postgres",
  password: process.env["DB_PASSWORD"],
  database: process.env["DB_NAME"] || "chatter_db",

  // Pool settings
  max: 20, // Maximum number of clients in the pool
  min: 2, // Minimum number of clients
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 10000, // Return error after 10s if can't connect

  // SSL settings (for production)
  ssl:
    process.env["NODE_ENV"] === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Pool error handling
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

pool.on("connect", () => {
  console.log("✅ Database pool connected");
});

const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log:
      process.env["NODE_ENV"] === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env["NODE_ENV"] !== "production") {
  globalThis.prismaGlobal = prisma;
}

// Graceful shutdown handler
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  await pool.end();
  console.log("🛑 Database connections closed");
};
