# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

pnpm workspace monorepo (`pnpm-workspace.yaml`: `apps/*`, `packages/*`). Use pnpm, not npm (the stray `package-lock.json` files in the apps are leftovers).

- `apps/api` (package name `backend`) — Express 5 + Drizzle ORM (Postgres) + Redis, TypeScript run via `tsx`
- `apps/web` (package name `frontend`) — React 19 + Vite + TanStack Query + React Router 7 + Tailwind v4 + shadcn/ui
- `packages/types` (`@repo/types`) — Zod schemas shared by both apps (e.g. `@repo/types/auth` holds `loginSchema`/`registerSchema`, used for API body validation and frontend forms). Consumed as raw `.ts` source, no build step.
- `packages/tsconfig.base.json` — base tsconfig extended by the apps.

There is no test suite in either app.

## Commands

Run from the app directory (or `pnpm --filter backend <script>` / `pnpm --filter frontend <script>` from the root).

API (`apps/api`):
- `pnpm dev` — `tsx watch --env-file=.env src/app.ts`
- `pnpm build` — `tsc` (type-check/emit)
- `pnpm lint` / `pnpm lint:fix` / `pnpm format`
- `pnpm db:generate` — generate a migration from `src/db/schema.ts` into `drizzle/`
- `pnpm db:migrate` / `pnpm db:push` / `pnpm db:studio`

Note: `start`, `db:seed` and `db:migrate:debug` reference files that don't exist (`dist/index.js`, `src/db/seed.ts`, `scripts/debug-migrate.ts`).

Web (`apps/web`):
- `pnpm dev` — Vite dev server on `http://localhost:5173` (the only origin allowed by API CORS)
- `pnpm build` — `tsc -b && vite build`
- `pnpm lint`

## Environment

- API env is validated with Zod in `apps/api/env.ts` (outside `src/`, imported as `@/env.js`); the process exits on invalid env. Requires `PORT`, `DATABASE_URL` (`postgresql://`), `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` (≥44 chars), `REDIS_URL` (must be `rediss://` / TLS). Drizzle connects with `ssl: true`.
- Web needs `VITE_BASE_API_URL` (prefixed to every `apiFetch` URL).

## API architecture

Layered: routes → controllers → services → repositories, wired manually in `src/di.ts` (instantiate repository with `db`, inject into service, inject into controller). Add new features by following the same pattern and registering instances in `di.ts`.

- Controllers are classes whose handlers are arrow-function properties wrapped in `asyncHandler`, so thrown errors reach the global `errorHandler`.
- Throw `AppError` subclasses from `src/errors/AppError.ts` (`UnauthorizedError`, `ConflictError`, `ValidationError`, `DatabaseError`, …). `errors/error-handler.ts` also maps Postgres error codes from `DrizzleQueryError` to HTTP statuses; anything else becomes a 500.
- Request validation: `validateBody(schema)` / `validateParams(schema)` in `middleware/validation.ts` (400 with `errorDetails`). Prefer schemas from `@repo/types` when the frontend also needs them.
- Route ordering in `src/app.ts` matters: `/api/auth/*` is public, then `app.use(authenticateToken)` guards everything mounted after it, then the 404 handler and `errorHandler`. New protected routers go between `authenticateToken` and the 404 handler. `authenticateToken` sets `req.user` (typed in `src/types/express.d.ts`).
- Rate limiting (`middleware/rate-limiter.ts`) uses `express-rate-limit` backed by Redis: a general limiter on `/api` and a stricter one on login/register.

Imports: ESM with `nodenext` resolution — relative and `@/` imports must use the `.js` extension (`@/services/auth-service.js`). tsconfig enables `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, and `verbatimModuleSyntax` (use `import type`).

### Auth flow

- Login/register return `{ user, accessToken }` in the body and set an httpOnly `refreshToken` cookie.
- `POST /api/auth/refresh-token` rotates tokens: the old refresh token is blacklisted in Redis and a new pair is issued.
- `POST /api/auth/logout` blacklists both refresh and access tokens.
- Blacklist entries are stored under `REDIS_KEYS.blacklist(hashToken(token))` (`lib/redis-keys.ts`) with TTL equal to the token's expiry; always hash tokens before using them as keys. `authenticateToken` checks the blacklist on every request.
- More background docs live in `apps/api/docs/`.

## Web architecture

- `@/` aliases `apps/web/src` (resolved by `vite-tsconfig-paths`). React Compiler is enabled via Babel in `vite.config.ts`.
- `Providers.tsx`: `QueryClientProvider` → `AuthProvider` → `RouterProvider` + sonner `Toaster`.
- `lib/apiFetch.ts` is the single fetch wrapper: keeps the access token in a module-level variable (not storage), sends `credentials: 'include'`, and on a 401 refreshes once via `/auth/refresh-token`, updates the `authQueryKeys.refresh` query cache, and retries; if refresh fails it clears auth and redirects to `/login`. Errors are thrown as `Error(message)` from the API's `message` field.
- Auth state: `AuthProvider` runs `useRefetchToken` (a query on the refresh endpoint) on load; the query cache entry `authQueryKeys.refresh` is the source of truth for the current user. Login/register/logout mutations update that cache entry and call `setAccessToken`.
- Routing (`router/Router.tsx`): `ProtectedRoute` wraps authenticated pages (inside `layout/AppLayout`), `PublicRoute` wraps `/login` and `/register`.
- Features are grouped under `src/features/<name>/` (api endpoints, schemas, query keys, hooks, providers). shadcn components live in `src/components/ui` (add via the shadcn CLI, config in `components.json`); react-hook-form wrappers in `src/components/RHFComponents`.

## Style

Prettier (root `.prettierrc`): 4-space indent, single quotes, semicolons, no trailing commas, 80 cols.
