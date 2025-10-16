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
  date: Date;
  location: {
    address: string;
    city: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
  imageUrl?: string;
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
    date: { type: Date, required: true },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
      coordinates: {
        lat: { type: Number },
        lon: { type: Number },
      },
    },
    imageUrl: { type: String },
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
  { timestamps: true }
);

export default model<IActivity>("Activity", ActivitySchema);
