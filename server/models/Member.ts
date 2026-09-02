import mongoose, { Schema, type Model } from "mongoose";
import type { Member } from "~~/shared/types/entities";

const MemberSchema = new Schema(
  {
    folio: { type: String, unique: true, index: true },
    name: { type: String },
    last_name: { type: String },

    email: { type: String, required: true, unique: true },
    phone: { type: String },
    mobile: { type: String },

    range: {
      type: String,
      enum: ["afiliado", "especialista", "experto", "profesional"],
      default: "afiliado",
      index: true,
    },

    picture: { type: String },

    social: {
      website: { type: String },
      fb: { type: String }, // facebook url/username
      tw: { type: String }, // twitter/x
      in: { type: String }, // linkedin
    },

    categories: [{ type: String }],

    country: {
      code: { type: String },
      name: { type: String },
      flag: { type: String },
      zone: { type: String },
    },
    city: { type: String },
    nationality: { type: String },

    languages: [{ type: String }], // array
    education: { type: String }, // array

    resume: { type: String },

    skills: [
      {
        name: { type: String },
        level: { type: Number }, // 1-10
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive", "pending", "blocked"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

export default (mongoose.models.Member as Model<Member> | undefined) ||
  mongoose.model<Member>("Member", MemberSchema);
