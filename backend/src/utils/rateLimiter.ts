import redis from "../config/redis.js";

export const checkRateLimit = async (
  userId: string,
  action: string,
  limit: number,
  windowSeconds: number,
): Promise<void> => {
  const key = `rate:${userId}:${action}`;
  const count = await redis.incr(key);

  if (count === 1) await redis.expire(key, windowSeconds);

  if (count > limit) throw new Error(`Rate limit exceeded for ${action}`);
};
