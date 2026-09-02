import mongoose, { Schema, type Model } from "mongoose";
import type { Program } from "~~/shared/types/entities";

const ProgramSchema = new Schema(
  {
    title: { type: String, required: true },
    length: { type: Number, required: true }, // length in days
    enterprise: {
      type: Schema.Types.ObjectId,
      ref: "Enterprise",
      index: true,
    },
    skills: [
      {
        name: { type: String },
        level: { type: Number }, // 1-10
      },
    ], // array of skills
    description: { type: String },
    photo: { type: String },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member", // model name
        index: true,
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

export default (mongoose.models.Program as Model<Program> | undefined) ||
  mongoose.model<Program>("Program", ProgramSchema);
