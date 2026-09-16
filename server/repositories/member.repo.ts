import { connectDb } from "../db/mongoose";
import MemberModel from "../models/Member";
import {
  countryCodeFilter,
  searchPage,
  textSearchConditions,
  type SearchQuery,
} from "../utils/search";
import type {
  CreateMemberInput,
  UpdateMemberInput,
} from "~~/shared/types/entities";

export async function findMember() {
  await connectDb();
  return MemberModel.find().lean();
}

const MEMBER_SORT = { name: 1, last_name: 1, _id: 1 } as const;

export async function searchMembers({
  query,
  country,
  category,
  status,
  skip,
  limit,
}: SearchQuery) {
  await connectDb();
  const filter: Record<string, unknown> = {};

  if (status) filter.status = status;
  if (country) filter["country.code"] = countryCodeFilter(country);
  if (category) filter.categories = category;

  if (query) {
    filter.$or = textSearchConditions(query, ["name", "last_name", "folio"]);
  }

  return searchPage(
    () => MemberModel.find(filter).sort(MEMBER_SORT).skip(skip).limit(limit).lean(),
    () => MemberModel.countDocuments(filter),
    { skip, limit },
  );
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
