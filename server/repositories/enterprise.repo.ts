import { connectDb } from "../db/mongoose";
import EnterpriseModel, { Enterprise } from "../models/Enterprise";

export async function findEnterprise() {
  await connectDb();
  return EnterpriseModel.find().lean();
}

export async function findEnterpriseById(id: string) {
  await connectDb();
  return EnterpriseModel.findById(id).lean();
}

export async function createEnterprise(data: Enterprise) {
  await connectDb();
  const doc = await EnterpriseModel.create(data);
  return doc.toObject();
}

export async function deleteEnterprise(id: string) {
  await connectDb();
  return EnterpriseModel.findByIdAndDelete(id).lean();
}

export async function updateEnterprise(id: string, data: Enterprise) {
  await connectDb();
  return EnterpriseModel.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function searchEnterprises(query: string, status?: string, limit = 20) {
  await connectDb();
  const filter: any = {};
  if (status) filter.status = status;
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: "i" } },
      { folio: { $regex: query, $options: "i" } },
    ];
  }
  return EnterpriseModel.find(filter).limit(limit).lean();
}
