import { connectDb } from "../db/mongoose";
import EnterpriseModel from "../models/Enterprise";
import { escapeRegex, type SearchFilters } from "../utils/search";
import type {
  CreateEnterpriseInput,
  UpdateEnterpriseInput,
} from "~~/shared/types/entities";

export async function findEnterprise() {
  await connectDb();
  return EnterpriseModel.find().lean();
}

export async function findEnterpriseById(id: string) {
  await connectDb();
  return EnterpriseModel.findById(id).lean();
}

export async function createEnterprise(data: CreateEnterpriseInput) {
  await connectDb();
  const doc = await EnterpriseModel.create(data);
  return doc.toObject();
}

export async function deleteEnterprise(id: string) {
  await connectDb();
  return EnterpriseModel.findByIdAndDelete(id).lean();
}

export async function updateEnterprise(id: string, data: UpdateEnterpriseInput) {
  await connectDb();
  return EnterpriseModel.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function searchEnterprises({
  query,
  country,
  status,
  limit = 20,
}: SearchFilters) {
  await connectDb();
  const filter: Record<string, unknown> = {};

  if (status) filter.status = status;
  if (country) filter["country.code"] = country;

  if (query) {
    const escapedQuery = escapeRegex(query);
    filter.$or = [
      { name: { $regex: escapedQuery, $options: "i" } },
      { folio: { $regex: escapedQuery, $options: "i" } },
    ];
  }

  return EnterpriseModel.find(filter).limit(limit).lean();
}
