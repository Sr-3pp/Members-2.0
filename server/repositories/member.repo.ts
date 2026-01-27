import { connectDb } from "../db/mongoose";
import MemberModel, { Member } from "../models/Member";

export async function findMember() {
  await connectDb();
  return MemberModel.find().lean();
}

export async function searchMembers(query: string, status?: string, limit = 20) {
  await connectDb();
  const filter: any = {};
  if (status) filter.status = status;
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: "i" } },
      { last_name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }
  return MemberModel.find(filter).limit(limit).lean();
}

export async function findMemberById(id: string) {
  await connectDb();
  return MemberModel.findById(id).lean();
}

export async function createMember(data: Member) {
  await connectDb();
  const doc = await MemberModel.create(data);
  return doc.toObject();
}

export async function deleteMember(id: string) {
  await connectDb();
  return MemberModel.findByIdAndDelete(id).lean();
}

export async function updateMember(id: string, data: Member) {
  await connectDb();
  return MemberModel.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function getMembersByCategory(category: string) {
  await connectDb();
  return MemberModel.find({ categories: category }).lean();
}
