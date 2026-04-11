import redis from "../config/redis.js";

export const checkRateLimit = async (
  identifier: string,
  action: string,
  limit: number,
  windowSeconds: number,
): Promise<void> => {
  const key = `rate:${identifier}:${action}`;
  const count = await redis.incr(key);

  if (count === 1) await redis.expire(key, windowSeconds);

  if (count > limit) throw new Error(`Rate limit exceeded for ${action}`);
};
