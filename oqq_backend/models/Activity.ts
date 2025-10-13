/**
 * oqq_backend/models/Activity.ts
 * Modèle Mongoose natif pour les activités (oùquandquoi.fr)
 * - Champ user désormais stocké en ObjectId référencé à User
 * - Compatible avec populate('user', 'prenom nom pseudo')
 */

import { Schema, model, Document, Types } from "mongoose";

export interface IActivity extends Document {
  title: string;
  description: string;
  location: string;
  when?: string;
  user: Types.ObjectId;              // ✅ référence User
  category?: string;
  subcategory?: string;
  website?: string;
  contactAllowed?: boolean;
  contactEmail?: string;
  lat?: number;
  lon?: number;
  image?: string;
  createdAt?: Date | string;
  __v?: number;
}

const ActivitySchema = new Schema<IActivity>(
  {
    title:          { type: String, required: true, trim: true },
    description:    { type: String, required: true },
    location:       { type: String, required: true },
    when:           { type: String },
    user:           { type: Schema.Types.ObjectId, ref: "User", required: true }, // ✅
    category:       { type: String },
    subcategory:    { type: String },
    website:        { type: String },
    contactAllowed: { type: Boolean, default: false },
    contactEmail:   { type: String },
    lat:            { type: Number },
    lon:            { type: Number },
    image:          { type: String },
    createdAt:      { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default model<IActivity>("Activity", ActivitySchema);
