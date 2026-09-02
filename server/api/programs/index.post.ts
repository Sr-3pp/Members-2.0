import { registerProgram } from "~~/server/services/program.service";
import type { CreateProgramInput } from "~~/shared/types/entities";

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateProgramInput>(event);
  return await registerProgram(body);
});
