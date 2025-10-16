/**
 * oqq_backend/routes/passwords.ts
 *
 * Routes Express pour le reset de mot de passe.
 */

import express from "express";
import { requestPasswordReset, resetPassword } from "../controllers/resetController";

const router = express.Router();

// Demande de réinitialisation (envoie un token)
router.post("/request", requestPasswordReset);

// Application du nouveau mot de passe
router.post("/reset", resetPassword);

export default router;
