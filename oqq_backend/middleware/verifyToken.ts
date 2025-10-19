/**
 * oqq_backend/middleware/verifyToken.ts
 *
 * Express middleware to verify that the user is authenticated (valid JWT).
 * - Checks for Authorization header: Bearer <token>
 * - Decodes and attaches the user payload to req.user
 * - Blocks the request if authentication fails or token is invalid
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme!"; // To be secured in production

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "admin" | "moderator" | "advertiser" | "user" | "pending";
    [key: string]: any;
  };
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authentication required. Token missing." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest["user"];
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
