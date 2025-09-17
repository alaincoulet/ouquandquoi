/**
 * oqq_backend/controllers/userController.ts
 *
 * Contrôleur principal utilisateurs (oùquandquoi.fr)
 * - Inscription (register)
 * - Connexion (login)
 * - Gestion favoris (add/remove, get) 100% via _id natif MongoDB (ObjectId)
 * - Reset password sécurisé (token/email, pas de questions secrètes)
 * - Mise à jour profil (pseudo/nom/prénom/mot de passe)
 * - Suppression de compte sécurisée (via authentification classique)
 * - Toutes les réponses excluent le mot de passe !
 * - Prend en compte le champ "motivation" lors de l’inscription (pour validation admin)
 */

import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../utils/email";

const JWT_SECRET = process.env.JWT_SECRET || "changeme!"; // À stocker dans .env en prod

/**
 * Inscription utilisateur (register)
 * Route POST /api/users/register
 * Ajoute et stocke le champ motivation saisi à l’inscription
 */
export async function registerUser(req: Request, res: Response) {
  try {
    // On récupère tous les champs y compris motivation
    const { email, password, pseudo, nom, prenom, motivation } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe obligatoires." });
    if (!nom || !prenom)
      return res.status(400).json({ message: "Nom et prénom obligatoires." });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Cet email est déjà utilisé." });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password: passwordHash,
      pseudo,
      nom,
      prenom,
      role: "pending",
      motivation: motivation?.trim() || undefined // Ajout champ motivation si présent
    });

    await user.save();

    // Ne jamais renvoyer le mot de passe
    const userToReturn = user.toObject();
    if ("password" in userToReturn) (userToReturn as any).password = undefined;

    res.status(201).json({
      message: "Utilisateur créé avec succès (en attente de validation par un admin).",
      user: userToReturn,
    });
  } catch (err) {
    console.error("Erreur registerUser:", err);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
}

/**
 * Connexion utilisateur (login)
 * Route POST /api/users/login
 * ⚠️ Correction : le JWT et le user renvoyé utilisent bien _id (convention MongoDB)
 */
export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email et mot de passe requis." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Utilisateur non trouvé." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Mot de passe invalide." });

    // 🚨 Contrôle du rôle de l'utilisateur
    if (user.role !== "user" && user.role !== "admin") {
      return res.status(403).json({
        error: "Votre compte est en attente de validation par un administrateur.",
      });
    }

    // On ne transmet JAMAIS le champ password !
    const userPayload = {
      _id: user._id,  // <-- Uniformisation ! (au lieu de id)
      email: user.email,
      pseudo: user.pseudo,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      token,
      user: userPayload,
    });

  } catch (err) {
    console.error("Erreur loginUser:", err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
}

/**
 * Lecture des favoris de l'utilisateur connecté (via ObjectId natif)
 * Route GET /api/users/favorites
 */
export async function getFavorites(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Non authentifié" });
    const token = authHeader.split(" ")[1];
    let userId = "";
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded._id;
    } catch {
      return res.status(401).json({ error: "Token invalide" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    // Ne retourner que des _id natifs stringifiés
    res.json({ favorites: user.favoris.map(id => id.toString()) });
  } catch (err) {
    console.error("Erreur getFavorites:", err);
    res.status(500).json({ error: "Erreur serveur favoris (lecture)" });
  }
}

/**
 * Ajout d'une activité aux favoris de l'utilisateur (ObjectId natif uniquement)
 * Route PATCH /api/users/favorites/:activityId
 */
export async function addFavorite(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Non authentifié" });
    // LOG 1
    console.log("==== [addFavorite] Nouvelle requête ====");
    console.log("[addFavorite] Authorization header:", authHeader);

    const token = authHeader.split(" ")[1];
    let userId = "";
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded._id;
      // LOG 2
      console.log("[addFavorite] JWT décodé userId:", userId, "token:", token);
    } catch {
      return res.status(401).json({ error: "Token invalide" });
    }

    const activityId = req.params.activityId;
    // LOG 3
    console.log("[addFavorite] activityId reçu:", activityId, "isValid?", mongoose.Types.ObjectId.isValid(activityId));

    // ======= ICI, les 2 lignes suivantes sont COMMENTÉES =======
    // if (!mongoose.Types.ObjectId.isValid(activityId)) {
    //   return res.status(400).json({ error: "activityId invalide" });
    // }
    // ============================================================

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    // LOG 4
    console.log("[addFavorite] User trouvé, favoris AVANT:", user.favoris.map(id => id.toString()));

    // Ajout uniquement si l'activité n'est pas déjà dans favoris
    if (!user.favoris.map(id => id.toString()).includes(activityId)) {
      // LOG 5
      console.log("[addFavorite] Ajout de l'activité dans favoris:", activityId);
      user.favoris.push(new mongoose.Types.ObjectId(activityId));
      await user.save();
      // LOG 6
      console.log("[addFavorite] Favoris APRÈS save:", user.favoris.map(id => id.toString()));
    } else {
      // LOG 7
      console.log("[addFavorite] activityId déjà présent, aucun ajout");
    }

    res.json({ success: true, favoris: user.favoris.map(id => id.toString()) });
  } catch (err) {
    console.error("Erreur addFavorite:", err);
    res.status(500).json({ error: "Erreur serveur favoris (ajout)" });
  }
}

/**
 * Suppression d'une activité des favoris (via ObjectId natif)
 * Route DELETE /api/users/favorites/:activityId
 */
export async function removeFavorite(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Non authentifié" });
    const token = authHeader.split(" ")[1];
    let userId = "";
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded._id;
    } catch {
      return res.status(401).json({ error: "Token invalide" });
    }

    const activityId = req.params.activityId;
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return res.status(400).json({ error: "activityId invalide" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    user.favoris = user.favoris.filter(
      (favId) => favId.toString() !== activityId
    );
    await user.save();

    res.json({ success: true, favoris: user.favoris.map(id => id.toString()) });
  } catch (err) {
    console.error("Erreur removeFavorite:", err);
    res.status(500).json({ error: "Erreur serveur favoris (suppression)" });
  }
}

/**
 * Demande de réinitialisation de mot de passe (envoi email)
 * Route POST /api/users/forgot-password
 */
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis." });

    const user = await User.findOne({ email });
    // Toujours retourner 200 même si l'utilisateur n'existe pas (pour sécurité)
    if (!user)
      return res.status(200).json({ message: "Si ce compte existe, un email a été envoyé." });

    // Générer un token unique (hex), stocker le hash + date d'expiration courte
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(token, 10);
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    await user.save();

    await sendResetPasswordEmail(user.email, token);

    res.status(200).json({ message: "Si ce compte existe, un email a été envoyé." });
  } catch (err) {
    console.error("Erreur forgotPassword:", err);
    res.status(500).json({ message: "Erreur lors de la demande de réinitialisation." });
  }
}

/**
 * Réinitialisation du mot de passe via lien unique (token)
 * Route POST /api/users/reset-password
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword)
      return res.status(400).json({ message: "Paramètres manquants." });

    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires)
      return res.status(400).json({ message: "Lien de réinitialisation invalide ou expiré." });

    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid || user.resetPasswordExpires < new Date())
      return res.status(400).json({ message: "Lien de réinitialisation invalide ou expiré." });

    // Changement du mot de passe
    const newHash = await bcrypt.hash(newPassword, 10);
    user.password = newHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    console.error("Erreur resetPassword:", err);
    res.status(500).json({ message: "Erreur lors de la réinitialisation." });
  }
}

/**
 * Mise à jour du profil utilisateur (nom, prénom, pseudo, mot de passe)
 * Route PATCH /api/users/profile
 */
export async function updateProfile(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Non authentifié" });
    const token = authHeader.split(" ")[1];
    let userId = "";
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded._id;
    } catch {
      return res.status(401).json({ error: "Token invalide" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const { pseudo, nom, prenom, oldPassword, newPassword } = req.body;
    let updatedFields: Partial<IUser> = {};

    if (pseudo && pseudo !== user.pseudo) {
      const existing: IUser | null = await User.findOne({ pseudo });
      if (existing && existing._id && existing._id.toString() !== userId) {
        return res.status(409).json({ error: "Ce pseudo est déjà utilisé." });
      }
      user.pseudo = pseudo;
      updatedFields.pseudo = pseudo;
    }

    if (typeof nom !== "undefined") {
      if (!nom.trim()) {
        return res.status(400).json({ error: "Le nom ne peut pas être vide." });
      }
      user.nom = nom.trim();
      updatedFields.nom = user.nom;
    }

    if (typeof prenom !== "undefined") {
      if (!prenom.trim()) {
        return res.status(400).json({ error: "Le prénom ne peut pas être vide." });
      }
      user.prenom = prenom.trim();
      updatedFields.prenom = user.prenom;
    }

    // Changement de mot de passe sécurisé
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch)
        return res.status(401).json({ error: "Ancien mot de passe incorrect." });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      updatedFields.password = user.password;
    }

    await user.save();

    // Ne jamais renvoyer le mot de passe
    const userToReturn = user.toObject();
    if ("password" in userToReturn) (userToReturn as any).password = undefined;

    res.json({
      message: "Profil mis à jour.",
      user: userToReturn,
    });
  } catch (err) {
    console.error("Erreur updateProfile:", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du profil." });
  }
}

/**
 * Liste tous les utilisateurs en attente de validation (role: "pending")
 * Route GET /api/users/pending (admin only)
 */
export async function getPendingUsers(req: Request, res: Response) {
  try {
    const pendingUsers = await User.find({ role: "pending" })
      .select("email pseudo nom prenom motivation createdAt") // On expose que l'essentiel
      .sort({ createdAt: 1 });

    res.json({ users: pendingUsers });
  } catch (err) {
    console.error("Erreur getPendingUsers:", err);
    res.status(500).json({ message: "Erreur serveur (listing users pending)" });
  }
}

/**
 * Valide un utilisateur en attente (passe de "pending" à "user")
 * Route PATCH /api/users/validate/:userId (admin only)
 */
export async function validateUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    if (user.role !== "pending") {
      return res.status(400).json({ message: "Utilisateur déjà validé ou statut incompatible" });
    }

    user.role = "user";
    await user.save();

    res.json({ 
      message: "Utilisateur validé avec succès",
      user: {
        _id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        pseudo: user.pseudo,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Erreur validateUser:", err);
    res.status(500).json({ message: "Erreur serveur (validation utilisateur)" });
  }
}

/**
 * Suppression définitive du compte utilisateur connecté (authentification classique)
 * Route DELETE /api/users/me
 */
export async function deleteMe(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Non authentifié" });
    const token = authHeader.split(" ")[1];
    let userId = "";
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded._id;
    } catch {
      return res.status(401).json({ error: "Token invalide" });
    }

    // Suppression définitive sans question secrète
    await User.findByIdAndDelete(userId);

    res.json({ message: "Compte supprimé définitivement. Nous sommes désolés de vous voir partir !" });
  } catch (err) {
    console.error("Erreur deleteMe:", err);
    res.status(500).json({ error: "Erreur lors de la suppression du compte." });
  }
}

/**
 * Ajoute une activité à la liste "Consulté récemment" de l'utilisateur (10 max)
 * Route PATCH /api/users/recently-viewed/:activityId
 */
export async function addRecentlyViewed(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Non authentifié" });
    const token = authHeader.split(" ")[1];
    let userId = "";
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded._id;
    } catch {
      return res.status(401).json({ error: "Token invalide" });
    }

    const activityId = req.params.activityId;
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return res.status(400).json({ error: "activityId invalide" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    // Mise à jour logique :
    // - Si activityId existe déjà : on la retire de la liste (pour la replacer devant)
    // - On insère devant (début du tableau)
    // - On coupe à 10 éléments max
    user.recentlyViewed = [
      new mongoose.Types.ObjectId(activityId),
      ...user.recentlyViewed.filter(
        (id) => id.toString() !== activityId
      ),
    ].slice(0, 10);

    await user.save();

    res.json({ success: true, recentlyViewed: user.recentlyViewed.map(id => id.toString()) });
  } catch (err) {
    console.error("Erreur addRecentlyViewed:", err);
    res.status(500).json({ error: "Erreur serveur (ajout consulté récemment)" });
  }
}

/**
 * Liste ordonnée des activités “consultées récemment” (avec populate)
 * Route GET /api/users/recently-viewed
 */
export async function getRecentlyViewed(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Non authentifié" });
    const token = authHeader.split(" ")[1];
    let userId = "";
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded._id;
    } catch {
      return res.status(401).json({ error: "Token invalide" });
    }

    // On récupère la liste peuplée des activités (ordre conservé)
    const user = await User.findById(userId).populate("recentlyViewed");
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    // On renvoie l’ordre du tableau tel quel : la plus récente est en premier (index 0)
    res.json({ recentlyViewed: user.recentlyViewed });
  } catch (err) {
    console.error("Erreur getRecentlyViewed:", err);
    res.status(500).json({ error: "Erreur serveur (lecture consulté récemment)" });
  }
}
