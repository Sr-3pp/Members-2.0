import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { admin } from "better-auth/plugins/admin";
import { APIError } from "better-auth/api";
import { isAdminRole } from "../../shared/utils/auth";

// Shared by Nitro and the admin bootstrap command.
export function createAuth(options: {
  database: NonNullable<BetterAuthOptions["database"]>;
  secret: string;
  baseURL: string;
}) {
  return betterAuth({
    ...options,
    appName: "Members Directory",
    advanced: { disableOriginCheck: false, disableCSRFCheck: false },
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 12, maxPasswordLength: 256 },
    plugins: [admin()],
    session: {
      expiresIn: 60 * 60 * 8,
      cookieCache: { enabled: false },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      customRules: { "/sign-in/email": { window: 15 * 60, max: 10 } },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session, context) => {
            const user = await context?.context.internalAdapter.findUserById(session.userId) as { role?: string | null } | null;
            if (!isAdminRole(user?.role)) {
              throw new APIError("FORBIDDEN", { message: "Admin access required" });
            }
          },
        },
      },
    },
  });
}
