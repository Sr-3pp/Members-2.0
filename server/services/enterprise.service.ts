import {
  createEnterprise,
  findEnterpriseById,
  findEnterprise,
  deleteEnterprise,
  updateEnterprise,
  searchEnterprises as repoSearchEnterprises,
} from "../repositories/enterprise.repo";
import type {
  CreateEnterpriseInput,
  UpdateEnterpriseInput,
} from "~~/shared/types/entities";
import { normalizeSearchFilters, type SearchFilters } from "../utils/search";
import { requireEntity } from "../utils/service";

export async function listEnterprises() {
  return await findEnterprise();
}

export async function getEnterprise(id: string) {
  return requireEntity(await findEnterpriseById(id), "Enterprise");
}

export async function registerEnterprise(input: CreateEnterpriseInput) {
  return await createEnterprise(input);
}

export async function removeEnterprise(id: string) {
  return requireEntity(await deleteEnterprise(id), "Enterprise");
}

export async function patchEnterprise(id: string, input: UpdateEnterpriseInput) {
  return requireEntity(await updateEnterprise(id, input), "Enterprise");
}

export async function searchEnterprises(filters: SearchFilters) {
  return await repoSearchEnterprises(normalizeSearchFilters(filters));
}
