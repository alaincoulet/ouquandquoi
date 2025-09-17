/**
 * oqq_backend/models/User.ts
 *
 * Modèle Mongoose TypeScript pour les utilisateurs oùquandquoi.fr
 * - Champs “nom” et “prénom” obligatoires (required: true)
 * - Favoris uniquement sous forme de tableau d’ObjectId natifs (référence Activity)
 * - Ajout : consulté récemment ("recentlyViewed") — 10 activités max, ordonnées, ObjectId natifs
 * - Support reset password sécurisé (token/expiry, pas de questions secrètes)
 * - Support Google OAuth (champ googleId, optionnel)
 * - Données RGPD conformes (aucun mot de passe exporté, pas de trackers)
 */

import { Schema, model, Document, Types } from "mongoose";

/**
 * Interface TypeScript du modèle utilisateur oùquandquoi.fr
 * - Aucun champ string custom d’id pour les favoris ou consultés récemment
 * - Tous les champs sensibles optionnels (reset, googleId…)
 */
export interface IUser extends Document {
  email: string;
  password: string;
  pseudo?: string;
  motivation?: string;
  photoUrl?: string;
  bio?: string;
  nom: string;                // Obligatoire
  prenom: string;             // Obligatoire
  genre?: string;
  tel?: string;
  notifications?: boolean;
  favoris: Types.ObjectId[];       // Tableau ObjectId natifs, jamais de string !
  recentlyViewed: Types.ObjectId[]; // Ajout : consulté récemment (10 max)
  savedSearches: {
    name: string;
    filters: Record<string, any>;
  }[];
  role: "admin" | "user" | "annonceur" | "pending" | "guest";
  certificationStatus: "none" | "pending" | "validated" | "rejected";
  officialNumber?: string;
  structureType?: "entreprise" | "association" | "mairie" | "autre";
  idDocumentUrl?: string;
  certifiedAt?: Date;
  status: "active" | "suspended";
  // ---- Sécurité/authentification ----
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  googleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ---- Schéma User Mongoose ----
const UserSchema = new Schema<IUser>(
  {
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:    { type: String, required: true },
    pseudo:      { type: String, trim: true },
    motivation:   { type: String, trim: true },
    photoUrl:    { type: String },
    bio:         { type: String, trim: true },
    nom:         { type: String, required: true, trim: true },
    prenom:      { type: String, required: true, trim: true },
    genre:       { type: String },
    tel:         { type: String },
    notifications: { type: Boolean, default: true },
    favoris:     [{ type: Schema.Types.ObjectId, ref: "Activity", required: false }], // Favoris
    recentlyViewed: [{ type: Schema.Types.ObjectId, ref: "Activity", required: false }], // <== Nouveau champ "consulté récemment"
    savedSearches: [{
      name:    { type: String },
      filters: { type: Schema.Types.Mixed }
    }],
    role: {
      type: String,
      enum: ["admin", "user", "annonceur", "pending", "guest"],
      default: "pending"
    },
    certificationStatus: {
      type: String,
      enum: ["none", "pending", "validated", "rejected"],
      default: "none"
    },
    officialNumber:   { type: String },
    structureType:    { type: String, enum: ["entreprise", "association", "mairie", "autre"] },
    idDocumentUrl:    { type: String },
    certifiedAt:      { type: Date },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    // --- Champs sécurité / reset / OAuth ---
    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
    googleId: { type: String, unique: false, sparse: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default model<IUser>("User", UserSchema);
