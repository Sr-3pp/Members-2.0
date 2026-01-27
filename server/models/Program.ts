import mongoose, { InferSchemaType, Schema } from "mongoose";

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

export type Program = InferSchemaType<typeof ProgramSchema> & {
  _id: string;
};

export default mongoose.models.Program ||
  mongoose.model("Program", ProgramSchema);
