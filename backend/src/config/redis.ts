import { Redis } from "ioredis";

const redis = new Redis({
  port: 6379,
  host: process.env["REDIS_HOST"],
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

redis.on("close", () => {
  console.log("Shutting down redis");
});

export const disconnectRedis = async () => {
  await redis.quit();
};

export default redis;
