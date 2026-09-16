import { connectDb } from "../db/mongoose";
import EnterpriseModel from "../models/Enterprise";
import {
  countryCodeFilter,
  searchPage,
  textSearchConditions,
  type SearchQuery,
} from "../utils/search";
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

const ENTERPRISE_SORT = { name: 1, _id: 1 } as const;

export async function searchEnterprises({
  query,
  country,
  status,
  skip,
  limit,
}: SearchQuery) {
  await connectDb();
  const filter: Record<string, unknown> = {};

  if (status) filter.status = status;
  if (country) filter["country.code"] = countryCodeFilter(country);

  if (query) {
    filter.$or = textSearchConditions(query, ["name", "folio"]);
  }

  return searchPage(
    () => EnterpriseModel.find(filter).sort(ENTERPRISE_SORT).skip(skip).limit(limit).lean(),
    () => EnterpriseModel.countDocuments(filter),
    { skip, limit },
  );
}
