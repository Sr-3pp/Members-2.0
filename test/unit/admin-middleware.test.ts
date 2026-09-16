import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp, defineEventHandler, getRequestURL, toWebHandler } from "h3";

const { requireAdmin, requireSameOrigin } = vi.hoisted(() => ({
  requireAdmin: vi.fn(), requireSameOrigin: vi.fn(),
}));
vi.mock("../../server/utils/auth", () => ({ requireAdmin, requireSameOrigin }));
vi.stubGlobal("defineEventHandler", defineEventHandler);
vi.stubGlobal("getRequestURL", getRequestURL);
const { default: middleware } = await import("../../server/middleware/admin");
const app = createApp().use(middleware).use(defineEventHandler(() => ({ ok: true })));
const request = toWebHandler(app);
afterEach(() => vi.resetAllMocks());

describe("admin API protection", () => {
  it.each(["members", "enterprises", "programs", "uploads/picture"])("checks admin access for writes to %s", async (path) => {
    const response = await request(new Request(`http://localhost/api/${path}`, { method: "POST" }));
    expect(response.status).toBe(200);
    expect(requireAdmin).toHaveBeenCalledOnce();
    expect(requireSameOrigin).toHaveBeenCalledOnce();
  });

  it("blocks unauthenticated writes before the handler runs", async () => {
    requireAdmin.mockRejectedValue({ statusCode: 401, message: "Sign in required" });
    const response = await request(new Request("http://localhost/api/members/123", { method: "DELETE" }));
    expect(response.status).toBe(401);
  });

  it("blocks non-admin writes", async () => {
    requireAdmin.mockRejectedValue({ statusCode: 403, message: "Admin access required" });
    const response = await request(new Request("http://localhost/api/programs/123", { method: "PATCH" }));
    expect(response.status).toBe(403);
  });

  it("keeps public reads available", async () => {
    const response = await request(new Request("http://localhost/api/members"));
    expect(response.status).toBe(200);
    expect(requireAdmin).not.toHaveBeenCalled();
  });
});
