import { requireAdmin, requireSameOrigin } from "../utils/auth";

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;
  const isWrite = !["GET", "HEAD", "OPTIONS"].includes(event.method);
  const isPanelApi = /^\/api\/(members|enterprises|programs|uploads)(\/|$)/.test(path);
  if (isWrite && isPanelApi) {
    requireSameOrigin(event);
    await requireAdmin(event);
  }
});
