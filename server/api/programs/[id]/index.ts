import { getProgram } from "~~/server/services/program.service";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") as string;
  console.log("Fetching program with ID:", id);
  return await getProgram(id);
});
