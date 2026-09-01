import { connectDb } from "../db/mongoose";
import MemberModel, { type Member } from "../models/Member";

export interface MemberSearchFilters {
  query?: string;
  country?: string;
  category?: string;
  status?: string;
  limit?: number;
}

export async function findMember() {
  await connectDb();
  return MemberModel.find().lean();
}

export async function searchMembers({
  query,
  country,
  category,
  status,
  limit = 20,
}: MemberSearchFilters) {
  await connectDb();
  const filter: Record<string, unknown> = {};

  if (status) filter.status = status;
  if (country) filter["country.code"] = country;
  if (category) filter.categories = category;

  if (query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escapedQuery, $options: "i" } },
      { last_name: { $regex: escapedQuery, $options: "i" } },
      { folio: { $regex: escapedQuery, $options: "i" } },
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
