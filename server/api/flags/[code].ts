import { providerFlagUrl } from "~~/shared/utils/countries";
import { requireRouterParam } from "~~/server/utils/request";

const FLAG_PARAM = /^([a-z]{2})(?:\.svg)?$/;

/**
 * Serves a country flag, downloading it from the provider the first time and
 * keeping a copy in the `flags` storage so later requests never leave the app.
 */
export default defineEventHandler(async (event) => {
  const match = FLAG_PARAM.exec(requireRouterParam(event, "code").toLowerCase());
  if (!match) {
    throw createError({ statusCode: 400, statusMessage: "Invalid country code" });
  }
  const code = match[1]!;
  const key = `${code}.svg`;
  const storage = useStorage("flags");

  let svg = await storage.getItemRaw<Buffer | string>(key);
  if (!svg) {
    svg = await $fetch<string>(providerFlagUrl(code), { responseType: "text" }).catch(() => {
      throw createError({ statusCode: 404, statusMessage: "Flag not found" });
    });
    await storage.setItemRaw(key, svg);
  }

  setResponseHeaders(event, {
    "Content-Type": "image/svg+xml",
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  return typeof svg === "string" ? svg : svg.toString("utf8");
});
