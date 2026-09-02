import { connectDb } from "../db/mongoose";
import MemberModel from "../models/Member";
import { escapeRegex, type SearchFilters } from "../utils/search";
import type {
  CreateMemberInput,
  UpdateMemberInput,
} from "~~/shared/types/entities";

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
}: SearchFilters) {
  await connectDb();
  const filter: Record<string, unknown> = {};

  if (status) filter.status = status;
  if (country) filter["country.code"] = country;
  if (category) filter.categories = category;

  if (query) {
    const escapedQuery = escapeRegex(query);
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

export async function createMember(data: CreateMemberInput) {
  await connectDb();
  const doc = await MemberModel.create(data);
  return doc.toObject();
}

export async function deleteMember(id: string) {
  await connectDb();
  return MemberModel.findByIdAndDelete(id).lean();
}

export async function updateMember(id: string, data: UpdateMemberInput) {
  await connectDb();
  return MemberModel.findByIdAndUpdate(id, data, { new: true }).lean();
}
