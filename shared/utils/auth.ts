import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password").max(256),
});

export type LoginInput = z.infer<typeof loginSchema>;
export const isPanelPath = (path: string) => path === "/panel" || path.startsWith("/panel/");

export const isAdminRole = (role?: string | null) => role?.split(",").includes("admin") ?? false;
