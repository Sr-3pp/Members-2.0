import {
  createProgram,
  findProgramById,
  findProgram,
  deleteProgram,
  updateProgram,
} from "../repositories/program.repo";
import type {
  CreateProgramInput,
  UpdateProgramInput,
} from "~~/shared/types/entities";
import { requireEntity } from "../utils/service";

export async function listPrograms() {
  return await findProgram();
}

export async function getProgram(id: string) {
  return requireEntity(await findProgramById(id), "Program");
}

export async function registerProgram(input: CreateProgramInput) {
  return await createProgram(input);
}

export async function removeProgram(id: string) {
  return requireEntity(await deleteProgram(id), "Program");
}

export async function patchProgram(id: string, input: UpdateProgramInput) {
  return requireEntity(await updateProgram(id, input), "Program");
}
