import { listPrograms } from "~~/server/services/program.service";

export default defineEventHandler(async () => {
  return await listPrograms();
});
