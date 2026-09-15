import { connectDb } from "../db/mongoose";
import ProgramModel from "../models/Program";
import EnterpriseModel from "../models/Enterprise";
import {
  countryCodeFilter,
  textSearchConditions,
  type SearchFilters,
} from "../utils/search";
import type {
  CreateProgramInput,
  UpdateProgramInput,
} from "~~/shared/types/entities";

const ENTERPRISE_POPULATE = {
  path: "enterprise",
  select: "name phone country city social picture folio",
};

export async function findProgram() {
  await connectDb();
  return ProgramModel.find().populate(ENTERPRISE_POPULATE).lean();
}

export async function findProgramById(id: string) {
  await connectDb();
  return ProgramModel.findById(id)
    .populate({
      path: "participants",
      select: "name last_name email range picture",
    })
    .populate(ENTERPRISE_POPULATE)
    .lean();
}

export async function searchPrograms({
  query,
  country,
  status,
  limit = 20,
}: SearchFilters) {
  await connectDb();
  const filter: Record<string, unknown> = {};

  if (status) filter.status = status;

  // A program has no country of its own, so the filter resolves through the
  // enterprise running it. No matching enterprise means no matching programs.
  if (country) {
    const enterprises = await EnterpriseModel.find({ "country.code": countryCodeFilter(country) })
      .select("_id")
      .lean();
    filter.enterprise = { $in: enterprises.map(({ _id }) => _id) };
  }

  if (query) {
    filter.$or = textSearchConditions(query, ["title"]);
  }

  return ProgramModel.find(filter)
    .populate(ENTERPRISE_POPULATE)
    .limit(limit)
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
