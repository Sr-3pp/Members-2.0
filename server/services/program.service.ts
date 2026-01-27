import {
  createProgram,
  findProgramById,
  findProgram,
  deleteProgram,
  updateProgram,
} from "../repositories/program.repo";

import { Program } from "../models/Program";

export async function listPrograms() {
  return await findProgram();
}

export async function getProgram(id: string) {
  const program = await findProgramById(id);
  if (!program) {
    throw createError({
      statusCode: 404,
      statusMessage: "Program not found",
    });
  }
  return program;
}

export async function registerProgram(input: Program) {
  return await createProgram(input);
}

export async function removeProgram(id: string) {
  const program = await findProgramById(id);
  if (!program) {
    throw createError({
      statusCode: 404,
      statusMessage: "Program not found",
    });
  }

  return await deleteProgram(id);
}

export async function patchProgram(id: string, input: Program) {
  const program = await findProgramById(id);
  if (!program) {
    throw createError({
      statusCode: 404,
      statusMessage: "Program not found",
    });
  }
  return await updateProgram(id, input);
}
