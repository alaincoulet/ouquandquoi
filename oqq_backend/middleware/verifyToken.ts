/**
 * oqq_backend/middleware/verifyToken.ts
 *
 * Middleware Express pour vérifier que l'utilisateur est authentifié (JWT valide)
 * - Vérifie la présence du header Authorization: Bearer <token>
 * - Décode et attache l'objet user (payload JWT) à req.user
 * - Bloque la requête si non authentifié ou token invalide
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme!";

export interface AuthRequest extends Request {
  user?: any;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ error: "Authentification requise (token manquant)" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}
