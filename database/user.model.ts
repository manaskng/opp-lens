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
}, { timestamps: true });

const User = models.User || model("User", UserSchema);

export default User;