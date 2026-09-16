# Admin authentication

Better Auth handles email/password login, MongoDB-backed sessions, cookies,
logout and rate limiting. The `/login` page uses Nuxt UI's `UAuthForm`.
The admin plugin supplies roles and the server-side account creation API.
Public sign-up is disabled. Only admins can create a login session.

Global route middleware protects `/panel` and its descendants. Independent
server middleware protects writes to member, enterprise, program and upload
APIs. Directory reads remain public. Session cookie caching is disabled so
protected requests see current roles and revoked sessions.

## Setup

Set these environment variables in `.env` or your deployment:

- `MONGODB_URI`: database connection string.
- `NUXT_BETTER_AUTH_URL`: the application's origin, e.g. `http://localhost:3000`.
- `NUXT_BETTER_AUTH_SECRET`: a random secret of at least 32 characters.
  Generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

To create an admin, also set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12–256 characters),
and optionally `ADMIN_NAME`, then run `pnpm admin:create`. The command uses
Better Auth's server API, creates both user and credential records, and rejects
existing accounts. Remove the bootstrap variables afterward.

Better Auth uses its own `user`, `account`, `session`, and `rateLimit` collections.
The old custom `users` records and `members-session` cookies are not compatible
and are not migrated or deleted. Recreate any admin from the earlier custom
implementation using `pnpm admin:create`. `NUXT_SESSION_PASSWORD` is no longer used.

Sessions last eight hours; signing out revokes the session in MongoDB. Login
allows ten attempts per IP per fifteen minutes using database-backed rate limits.
Use HTTPS in production and configure the deployment proxy to overwrite forwarded
IP headers so clients cannot spoof the IP used by Better Auth's rate limiter.

References: [Better Auth Nuxt integration](https://better-auth.com/docs/integrations/nuxt),
[MongoDB adapter](https://better-auth.com/docs/adapters/mongo),
[admin plugin](https://better-auth.com/docs/plugins/admin).
