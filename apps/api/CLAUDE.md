# CLAUDE.md — apps/api

Express 5 + Drizzle ORM (Postgres) + Redis, TypeScript run via `tsx`. Package name: `backend`. See the root `CLAUDE.md` for monorepo-wide rules (pnpm, style, auth flow overview).

## Commands

- `pnpm dev` — `tsx watch --env-file=.env src/app.ts`
- `pnpm build` — `tsc` (use as the type-check)
- `pnpm lint` / `pnpm lint:fix` / `pnpm format`
- `pnpm db:generate` — generate a migration from `src/db/schema.ts` into `drizzle/`
- `pnpm db:migrate` / `pnpm db:push` / `pnpm db:studio`

`start`, `db:seed` and `db:migrate:debug` point at files that don't exist. No test suite.

## Layout (`src/`)

- `app.ts` — middleware order and route mounting (order matters, see below)
- `di.ts` — manual wiring: repository(`db`) → service → controller
- `routes/` → `controllers/` → `services/` → `repositories/`
- `db/schema.ts` (Drizzle schema), `db/db.ts` (connection, `ssl: true`)
- `middleware/` — `auth.ts` (`authenticateToken`), `validation.ts`, `rate-limiter.ts`, `async-handler.ts`
- `errors/` — `AppError.ts` subclasses and the global `error-handler.ts`
- `lib/` — `redis.ts`, `redis-keys.ts`; `utils/` — `jwt.ts`, `password.ts`, `cookie.ts`
- `types/express.d.ts` — augments `req.user`
- `../env.ts` (outside `src/`) — Zod-validated env, imported as `@/env.js`; process exits if invalid
- `docs/` — background write-ups on auth flow, error flow, rate limiting

## Adding a feature

1. Table in `db/schema.ts`, then `pnpm db:generate` and `pnpm db:migrate`.
2. Repository class taking `db`; service class taking the repository; controller class taking the service.
3. Controller handlers are arrow-function properties wrapped in `asyncHandler`.
4. Register instances in `di.ts`, create the router in `routes/`.
5. Mount the router in `app.ts` **after** `authenticateToken` and **before** the 404 handler, unless it must be public (only `/api/auth/*` is).
6. Validate input with `validateBody` / `validateParams`; put schemas in `@packages/types` if the web app needs them too.
7. Throw `AppError` subclasses; never send error responses by hand. The error handler also maps Postgres codes from `DrizzleQueryError`.

## Conventions and gotchas

- ESM + `nodenext`: relative and `@/` imports need the `.js` extension (`@/services/auth-service.js`).
- `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` are on — use `import type`, handle `undefined` from indexed access, don't pass `undefined` to optional props.
- Redis must be `rediss://` (TLS). Token blacklist keys: `REDIS_KEYS.blacklist(hashToken(token))` — always hash first, TTL = token expiry.
- Rate limiters are Redis-backed (`express-rate-limit`): general on `/api`, stricter on login/register.
- Refresh token lives in an httpOnly cookie; access token only in the response body.
