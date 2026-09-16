import { connectDb } from "../db/mongoose";
import ProgramModel from "../models/Program";
import EnterpriseModel from "../models/Enterprise";
import {
  countryCodeFilter,
  searchPage,
  textSearchConditions,
  type SearchQuery,
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

const PROGRAM_SORT = { title: 1, _id: 1 } as const;

export async function searchPrograms({
  query,
  country,
  status,
  skip,
  limit,
}: SearchQuery) {
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

  return searchPage(
    () =>
      ProgramModel.find(filter)
        .populate(ENTERPRISE_POPULATE)
        .sort(PROGRAM_SORT)
        .skip(skip)
        .limit(limit)
        .lean(),
    () => ProgramModel.countDocuments(filter),
    { skip, limit },
  );
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
