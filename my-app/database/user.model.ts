import { Schema, models, model, Document } from "mongoose";

export interface IUser extends Document {
  clerkId?: string; 
  email: string;
  name: string;
  image: string;
  interests: string[]; 
  bio?: string;
  location?: string;
  portfolio?: string;
  github?: string;
  institution?: string;
  // --- ML RECOMMENDATION FIELDS ---
  preferredCategories: string[];
  preferredMode: string;
  skillLevel: string;
  // --- OPPHUB V2 FIELDS ---
  organisations: string[];
  lastOpportunityVisit: Date | null;
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String },
  interests: { type: [String], default: [] }, 
  bio: { type: String },
  location: { type: String },
  portfolio: { type: String },
  github: { type: String },
  institution: { type: String },
  // --- ML RECOMMENDATION FIELDS ---
  preferredCategories: { type: [String], default: [] },
  preferredMode: { type: String, enum: ['online', 'offline', 'hybrid', 'any'], default: 'any' },
  skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  // --- OPPHUB V2 FIELDS ---
  organisations: { type: [{ type: Schema.Types.ObjectId, ref: 'Organisation' }], default: [] },
  lastOpportunityVisit: { type: Date, default: null },
}, { timestamps: true });

const User = models.User || model("User", UserSchema);

export default User;