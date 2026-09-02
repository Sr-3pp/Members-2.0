import { connectDb } from "../db/mongoose";
import ProgramModel from "../models/Program";
import type {
  CreateProgramInput,
  UpdateProgramInput,
} from "~~/shared/types/entities";

export async function findProgram() {
  await connectDb();
  return ProgramModel.find()
    .populate({
      path: "enterprise",
      select: "name phone country city social picture folio",
    })
    .lean();
}

export async function findProgramById(id: string) {
  await connectDb();
  return ProgramModel.findById(id)
    .populate({
      path: "participants",
      select: "name last_name email range picture",
    })
    .populate({
      path: "enterprise",
      select: "name phone country city social picture folio",
    })
    .lean();
}

export async function createProgram(data: CreateProgramInput) {
  await connectDb();
  const doc = await ProgramModel.create(data);
  return doc.toObject();
}

export async function deleteProgram(id: string) {
  await connectDb();
  return ProgramModel.findByIdAndDelete(id).lean();
}

export async function updateProgram(id: string, data: UpdateProgramInput) {
  await connectDb();
  return ProgramModel.findByIdAndUpdate(id, data, { new: true }).lean();
}
