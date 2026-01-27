import mongoose, { InferSchemaType, Schema } from "mongoose";

const EnterpriseSchema = new Schema(
  {
    folio: { type: String, unique: true, index: true },
    name: { type: String },

    phone: { type: String },

    picture: { type: String },

    social: {
      website: { type: String },
      fb: { type: String }, // facebook url/username
      tw: { type: String }, // twitter/x
      in: { type: String }, // linkedin
    },

    country: {
      code: { type: String },
      name: { type: String },
      flag: { type: String },
      zone: { type: String },
    },
    city: { type: String },
    nationality: { type: String },

    languages: [{ type: String }], // array
    description: { type: String }, // array

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

export type Enterprise = InferSchemaType<typeof EnterpriseSchema> & {
  _id: string;
};

export default mongoose.models.Enterprise ||
  mongoose.model("Enterprise", EnterpriseSchema);
