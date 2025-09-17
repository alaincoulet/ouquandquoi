/**
 * oqq_backend/models/Activity.ts
 * Modèle Mongoose natif pour les activités (oùquandquoi.fr)
 * - Utilise exclusivement les champs présents en base MongoDB
 * - Prêt pour toutes les opérations CRUD et relations (_id natif obligatoire)
 */

import { Schema, model, Document } from "mongoose";

/**
 * Interface TypeScript pour une activité
 */
export interface IActivity extends Document {
  title: string;
  description: string;
  location: string;
  when?: string;
  user?: string;
  category?: string;
  subcategory?: string;
  website?: string;
  contactAllowed?: boolean;
  contactEmail?: string;
  lat?: number;
  lon?: number;
  image?: string;
  createdAt?: Date | string;
  // Champs internes Mongoose
  __v?: number;
}

// Schéma Mongoose natif pour les activités
const ActivitySchema = new Schema<IActivity>(
  {
    title:           { type: String, required: true, trim: true },
    description:     { type: String, required: true },
    location:        { type: String, required: true },
    when:            { type: String },
    user:            { type: String }, // À relier à User._id si tu veux peupler
    category:        { type: String },
    subcategory:     { type: String },
    website:         { type: String },
    contactAllowed:  { type: Boolean, default: false },
    contactEmail:    { type: String },
    lat:             { type: Number },
    lon:             { type: Number },
    image:           { type: String },
    createdAt:       { type: Date, default: Date.now }
    // Pas de champs favoris ici (seulement dans User)
  },
  { timestamps: true }
);

export default model<IActivity>("Activity", ActivitySchema);
