import { beforeEach, describe, expect, it, vi } from "vitest";
import { memoryAdapter } from "better-auth/adapters/memory";
import { createApp, defineEventHandler, toWebHandler } from "h3";
import { createAuth } from "../../server/lib/auth";

const state = vi.hoisted(() => ({ auth: null as ReturnType<typeof createAuth> | null }));
vi.mock("../../server/utils/betterAuth", () => ({ getAuth: async () => state.auth }));
import { requireAdmin, requireSameOrigin } from "../../server/utils/auth";

const baseURL = "http://localhost:3000";
const credentials = { email: "admin@example.com", password: "correct-password" };
let database: Record<string, Record<string, unknown>[]>;
let auth: ReturnType<typeof createAuth>;
beforeEach(async () => {
  database = { user: [], account: [], session: [], verification: [], rateLimit: [] };
  auth = createAuth({ database: memoryAdapter(database), secret: "test-secret-with-at-least-thirty-two-characters", baseURL });
  state.auth = auth;
  await auth.api.createUser({ body: { ...credentials, name: "Admin", role: "admin" } });
});

const request = (path: string, body?: object, cookie = "") => auth.handler(new Request(`${baseURL}/api/auth${path}`, {
  method: body ? "POST" : "GET",
  headers: { "Content-Type": "application/json", origin: baseURL, cookie, "x-forwarded-for": "192.0.2.1" },
  ...(body ? { body: JSON.stringify(body) } : {}),
}));
const signIn = () => request("/sign-in/email", credentials);
const cookies = (response: Response) => response.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ");
const protectedRequest = toWebHandler(createApp().use(defineEventHandler((event) => {
  requireSameOrigin(event);
  return requireAdmin(event);
})));
const accessPanel = (cookie = "", origin = baseURL) => protectedRequest(new Request(`${baseURL}/api/members`, { method: "POST", headers: { cookie, origin, host: "localhost:3000" } }));

describe("Better Auth integration", () => {
  it("creates credentials through Better Auth and logs admins in", async () => {
    expect(database.account).toHaveLength(1);
    expect(database.account![0]!.password).not.toBe(credentials.password);
    const response = await signIn();
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    const body = await response.json();
    expect(body.user.role).toBe("admin");
    expect(body.user).not.toHaveProperty("password");
    expect((await accessPanel(cookies(response))).status).toBe(200);
  });

  it("rejects bad passwords and non-admin logins", async () => {
    expect((await request("/sign-in/email", { ...credentials, password: "wrong-password" })).status).toBe(401);
    await auth.api.createUser({ body: { email: "user@example.com", password: credentials.password, name: "User", role: "user" } });
    expect((await request("/sign-in/email", { email: "user@example.com", password: credentials.password })).status).toBe(403);
    expect(database.session).toHaveLength(0);
  });

  it("disables public signup and anonymous admin creation", async () => {
    expect((await request("/sign-up/email", { ...credentials, name: "Intruder" })).status).toBe(400);
    expect((await request("/admin/create-user", { ...credentials, name: "Intruder", role: "admin" })).status).toBe(401);
  });

  it("rejects missing and forged sessions", async () => {
    expect((await accessPanel()).status).toBe(401);
    expect((await accessPanel("better-auth.session_token=forged")).status).toBe(401);
  });

  it("reads current roles rather than trusting a cached cookie", async () => {
    const cookie = cookies(await signIn());
    database.user![0]!.role = "user";
    expect((await accessPanel(cookie)).status).toBe(403);
  });

  it("revokes sessions on logout, including replay of the old cookie", async () => {
    const cookie = cookies(await signIn());
    expect((await request("/sign-out", {}, cookie)).status).toBe(200);
    expect((await accessPanel(cookie)).status).toBe(401);
  });

  it("rejects cross-site login and directory writes", async () => {
    const response = await auth.handler(new Request(`${baseURL}/api/auth/sign-in/email`, {
      method: "POST", headers: { "Content-Type": "application/json", origin: "https://other.example", "sec-fetch-site": "cross-site", "sec-fetch-mode": "cors" }, body: JSON.stringify(credentials),
    }));
    expect(response.status).toBe(403);
    expect((await accessPanel("", "https://other.example")).status).toBe(403);
  });

  it("stores and enforces the login rate limit", async () => {
    for (let i = 0; i < 10; i++) await request("/sign-in/email", { ...credentials, password: "wrong-password" });
    expect((await signIn()).status).toBe(429);
    expect(database.rateLimit!.length).toBeGreaterThan(0);
  });
});
