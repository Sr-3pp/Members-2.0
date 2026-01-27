import {
  createEnterprise,
  findEnterpriseById,
  findEnterprise,
  deleteEnterprise,
  updateEnterprise,
  searchEnterprises as repoSearchEnterprises,
} from "../repositories/enterprise.repo";

import { Enterprise } from "../models/Enterprise";

export async function listEnterprises() {
  return await findEnterprise();
}

export async function getEnterprise(id: string) {
  const enterprise = await findEnterpriseById(id);
  if (!enterprise) {
    throw createError({
      statusCode: 404,
      statusMessage: "Enterprise not found",
    });
  }
  return enterprise;
}

export async function registerEnterprise(input: Enterprise) {
  return await createEnterprise(input);
}

export async function removeEnterprise(id: string) {
  const enterprise = await findEnterpriseById(id);
  if (!enterprise) {
    throw createError({
      statusCode: 404,
      statusMessage: "Enterprise not found",
    });
  }

  return await deleteEnterprise(id);
}

export async function patchEnterprise(id: string, input: Enterprise) {
  const enterprise = await findEnterpriseById(id);
  if (!enterprise) {
    throw createError({
      statusCode: 404,
      statusMessage: "Enterprise not found",
    });
  }
  return await updateEnterprise(id, input);
}

export async function searchEnterprises(query: string, status?: string, limit = 20) {
  return await repoSearchEnterprises(query, status, limit);
}
