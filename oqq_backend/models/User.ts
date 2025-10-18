/**
 * oqq_backend/models/User.ts
 *
 * Mongoose + TypeScript model for users (oùquandquoi.fr)
 * - Required fields: nom / prenom / email / password
 * - Stores only native ObjectIds for favorites and recently viewed
 * - Includes secure reset password fields (token + expiry)
 * - Supports Google OAuth (optional googleId)
 * - GDPR compliant (no trackers, password never exported)
 */

import { Schema, model, Document, Types } from "mongoose";

/**
 * IUser interface (TypeScript)
 * - Strongly typed user schema
 * - Matches Mongoose document structure
 */
export interface IUser extends Document {
  _id: Types.ObjectId; // ✅ explicit ObjectId type for TS strict mode
  email: string;
  password: string;
  pseudo?: string;
  motivation?: string;
  photoUrl?: string;
  bio?: string;
  nom: string;                 // Required
  prenom: string;              // Required
  genre?: string;
  tel?: string;
  notifications?: boolean;
  preferredEmailClient?: "gmail" | "outlook" | "yahoo" | "default"; // Préférence de messagerie pour le partage
  favoris: Types.ObjectId[];         // Favorites: native ObjectIds only
  recentlyViewed: Types.ObjectId[];  // Recently viewed (10 max)
  savedSearches: {
    name: string;
    filters: Record<string, any>;
    createdAt: Date;
  }[];
  scheduledActivities: {
    activityId: Types.ObjectId;
    scheduledDate: Date;
    reminders: {
      type: "email" | "sms" | "both";
      timeBefore: number; // minutes avant l'événement
      repeat: number; // nombre de répétitions
    }[];
    notes?: string;
    createdAt: Date;
  }[];
  role: "admin" | "moderator" | "advertiser" | "user" | "pending" | "guest";
  certificationStatus: "none" | "pending" | "validated" | "rejected";
  officialNumber?: string;
  structureType?: "entreprise" | "association" | "mairie" | "autre";
  idDocumentUrl?: string;
  certifiedAt?: Date;
  status: "active" | "suspended";
  // ---- Security & Authentication ----
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  googleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User Mongoose schema
 */
const UserSchema = new Schema<IUser>(
  {
    // === Basic information ===
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    pseudo: { type: String, trim: true },
    motivation: { type: String, trim: true },
    photoUrl: { type: String },
    bio: { type: String, trim: true },
    nom: { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    genre: { type: String },
    tel: { type: String },
    notifications: { type: Boolean, default: true },
    preferredEmailClient: { 
      type: String, 
      enum: ["gmail", "outlook", "yahoo", "default"], 
      default: "default" 
    },

    // === Relations ===
    favoris: [
      { type: Schema.Types.ObjectId, ref: "Activity", required: false },
    ],
    recentlyViewed: [
      { type: Schema.Types.ObjectId, ref: "Activity", required: false },
    ],

    // === Saved searches ===
    savedSearches: [
      {
        name: { type: String },
        filters: { type: Schema.Types.Mixed },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // === Scheduled activities (calendar) ===
    scheduledActivities: [
      {
        activityId: { type: Schema.Types.ObjectId, ref: "Activity", required: true },
        scheduledDate: { type: Date, required: true },
        reminders: [
          {
            type: { type: String, enum: ["email", "sms", "both"], required: true },
            timeBefore: { type: Number, required: true }, // minutes
            repeat: { type: Number, default: 1 },
          },
        ],
        notes: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // === Roles and permissions ===
    role: {
      type: String,
      enum: ["admin", "moderator", "advertiser", "user", "pending", "guest"],
      default: "pending",
    },
    certificationStatus: {
      type: String,
      enum: ["none", "pending", "validated", "rejected"],
      default: "none",
    },
    officialNumber: { type: String },
    structureType: {
      type: String,
      enum: ["entreprise", "association", "mairie", "autre"],
    },
    idDocumentUrl: { type: String },
    certifiedAt: { type: Date },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    // === Security / OAuth ===
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    googleId: { type: String, unique: false, sparse: true },

    // === Timestamps ===
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// === Export model ===
export default model<IUser>("User", UserSchema);
