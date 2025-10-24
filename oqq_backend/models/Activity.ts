/**
 * oqq_backend/models/Activity.ts
 *
 * Mongoose TypeScript model for activities (oùquandquoi.fr)
 * - Each activity is linked to its owner (user / advertiser)
 * - Supports image upload, description, location, category, and subcategory
 * - Includes visibility and publication status flags
 */

import { Schema, model, Document, Types } from "mongoose";

export interface IActivity extends Document {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  when: string; // Date ou plage de dates au format string (ex: "05/07/2026" ou "10/06/2026 - 12/06/2026")
  location: string; // Adresse complète (ex: "84000 Avignon")
  lat?: number;
  lon?: number;
  image?: string; // Chemin de l'image (ex: "/images/xxx.jpg")
  website?: string;
  contactEmail?: string;
  contactAllowed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  status: "draft" | "published" | "archived";
  user: Types.ObjectId; // reference to the user (advertiser/admin)
}

const ActivitySchema = new Schema<IActivity>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, trim: true },
    when: { type: String, required: true }, // Date ou plage au format string
    location: { type: String, required: true }, // Adresse complète
    lat: { type: Number },
    lon: { type: Number },
    image: { type: String }, // Chemin de l'image
    website: { type: String },
    contactEmail: { type: String },
    contactAllowed: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // advertiser who owns the activity
  },
  { timestamps: true, strict: false }
);

export default model<IActivity>("Activity", ActivitySchema);
