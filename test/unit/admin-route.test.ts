import { beforeEach, describe, expect, it, vi } from "vitest";
import { createError } from "h3";

const state = { user: { value: null as null | { role: string } }, isAdmin: { value: false }, error: { value: null as Error | null }, refresh: vi.fn() };
const navigateTo = vi.fn((destination) => destination);
vi.stubGlobal("useAuth", () => state);
vi.stubGlobal("navigateTo", navigateTo);
vi.stubGlobal("createError", createError);
vi.stubGlobal("defineNuxtRouteMiddleware", (handler: unknown) => handler);
// The plain unit runner has no Nuxt path aliases.
vi.mock("~~/shared/utils/auth", () => ({ isPanelPath: (path: string) => path === "/panel" || path.startsWith("/panel/") }));
const { default: middleware } = await import("../../app/middleware/admin.global");
const run = (path: string) => (middleware as Function)({ path, fullPath: path });
beforeEach(() => {
  vi.clearAllMocks();
  state.user.value = null;
  state.isAdmin.value = false;
  state.error.value = null;
});

describe("panel route middleware", () => {
  it("redirects anonymous visitors and preserves the destination", async () => {
    await run("/panel/members");
    expect(state.refresh).toHaveBeenCalledOnce();
    expect(navigateTo).toHaveBeenCalledWith({ path: "/login", query: { redirect: "/panel/members" } });
  });
  it("rejects signed-in non-admins", async () => {
    state.user.value = { role: "member" };
    await expect(run("/panel")).rejects.toMatchObject({ statusCode: 403 });
  });
  it("allows admins", async () => {
    state.user.value = { role: "admin" };
    state.isAdmin.value = true;
    await run("/panel");
    expect(navigateTo).not.toHaveBeenCalled();
  });
  it("fails closed when session loading fails", async () => {
    state.error.value = new Error("Session unavailable");
    await expect(run("/panel")).rejects.toThrow("Session unavailable");
    expect(navigateTo).not.toHaveBeenCalled();
  });
  it("leaves public routes alone", async () => {
    await run("/");
    expect(state.refresh).not.toHaveBeenCalled();
  });
});
