import { connectDb } from "../db/mongoose";
import ProgramModel, { Program } from "../models/Program";

export async function findProgram() {
  await connectDb();
  return ProgramModel.find().lean();
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

export async function createProgram(data: Program) {
  await connectDb();
  const doc = await ProgramModel.create(data);
  return doc.toObject();
}

export async function deleteProgram(id: string) {
  await connectDb();
  return ProgramModel.findByIdAndDelete(id).lean();
}

export async function updateProgram(id: string, data: Program) {
  await connectDb();
  return ProgramModel.findByIdAndUpdate(id, data, { new: true }).lean();
}
