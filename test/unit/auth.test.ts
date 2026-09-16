import { describe, expect, it } from "vitest";
import { loginSchema, isPanelPath, isAdminRole } from "../../shared/utils/auth";

describe("authentication rules", () => {
  it("normalizes email without changing passwords", () => {
    expect(loginSchema.parse({ email: " ADMIN@Example.com ", password: " secret " }))
      .toEqual({ email: "admin@example.com", password: " secret " });
    expect(loginSchema.safeParse({ email: "invalid", password: "" }).success).toBe(false);
  });

  it("protects exactly the panel route and its descendants", () => {
    expect(isPanelPath("/panel")).toBe(true);
    expect(isPanelPath("/panel/members")).toBe(true);
    expect(isPanelPath("/panels")).toBe(false);
    expect(isPanelPath("//external.example/panel")).toBe(false);
  });

  it("recognizes the admin plugin's roles without accepting partial matches", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("user,admin")).toBe(true);
    expect(isAdminRole("superadmin")).toBe(false);
    expect(isAdminRole("user")).toBe(false);
    expect(isAdminRole(null)).toBe(false);
  });
});
