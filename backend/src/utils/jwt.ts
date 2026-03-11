import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env["JWT_ACCESS_TOKEN_SECRET"] as string, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (
  payload: JwtPayload,
  rememberMe: boolean = false,
): string => {
  return jwt.sign(payload, process.env["JWT_REFRESH_TOKEN_SECRET"] as string, {
    expiresIn: rememberMe ? "30d" : "7d",
  });
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(
      token,
      process.env["JWT_ACCESS_TOKEN_SECRET"] as string,
    ) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(
      token,
      process.env["JWT_REFRESH_TOKEN_SECRET"] as string,
    ) as JwtPayload;
  } catch (error) {
    return null;
  }
};
