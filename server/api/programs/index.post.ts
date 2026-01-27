import { registerProgram } from "~~/server/services/program.service";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await registerProgram(body);
});
