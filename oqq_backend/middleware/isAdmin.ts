/**
 * oqq_backend/middleware/isAdmin.ts
 *
 * Express middleware to verify that the user is authenticated AND has admin or moderator privileges.
 * - Checks for the presence and validity of the JWT
 * - Allows access if role is "admin" or "moderator"
 * - Denies access otherwise (401 or 403)
 * - Attaches the decoded user to req.user for downstream use
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme!"; // To be secured in production

export interface AuthRequest extends Request {
  user?: any; // Can be typed more strictly with IUser if needed
}

export function isAdminOrModerator(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Not authenticated. Token missing." });
  }

  const token = authHeader.split(" ")[1];
  let user;
  try {
    user = jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return res.status(401).json({ error: "Invalid token." });
  }

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return res.status(403).json({ error: "Access restricted to administrators and moderators." });
  }

  // Attach decoded user to the request object for later use
  req.user = user;
  next();
}
