# CLAUDE.md — apps/web

React 19 + Vite + TanStack Query + React Router 7 + Tailwind v4 + shadcn/ui. Package name: `frontend`. See the root `CLAUDE.md` for monorepo-wide rules (pnpm, style, shared `@repo/types`).

## Commands

- `pnpm dev` — Vite on `http://localhost:5173` (the only origin the API's CORS allows)
- `pnpm build` — `tsc -b && vite build` (use as the type-check)
- `pnpm lint`

Needs `VITE_BASE_API_URL` in `.env`; `apiFetch` prefixes it to every URL. No test suite.

## Layout (`src/`)

- `main.tsx`, `App.tsx`, `providers/Providers.tsx` — `QueryClientProvider` → `AuthProvider` → `RouterProvider` + sonner `Toaster`
- `router/` — `Router.tsx`, `ProtectedRoute.tsx` (authenticated pages inside `layout/AppLayout`), `PublicRoute.tsx` (`/login`, `/register`)
- `layout/` — `AppLayout.tsx`, `Header.tsx` (theme toggle via `next-themes`)
- `pages/` — route-level components
- `features/<name>/` — api functions, zod schemas, query keys, hooks, providers (see `features/auth/`)
- `components/ui/` — shadcn components (add with the shadcn CLI; config in `components.json`)
- `components/RHFComponents/` — react-hook-form wrappers (e.g. `RHFInput`)
- `components/common/` — shared app components
- `lib/` — `apiFetch.ts`, `query-client.ts`, `utils.ts` (`cn`)

## Conventions and gotchas

- `@/` aliases `src/` (via `vite-tsconfig-paths`). React Compiler is on (Babel in `vite.config.ts`), so don't hand-write `useMemo`/`useCallback`/`memo` for perf.
- All HTTP goes through `lib/apiFetch.ts`. The access token is a module-level variable (never localStorage/sessionStorage). On 401 it refreshes once via `/auth/refresh-token`, updates the `authQueryKeys.refresh` cache and retries; on failure it clears auth and redirects to `/login`. Errors are thrown as `Error(message)` from the API's `message` field.
- Current user = the `authQueryKeys.refresh` query cache entry. Login/register/logout mutations update it and call `setAccessToken`.
- Forms: react-hook-form + `zodResolver`, reusing schemas from `@repo/types` (e.g. `@repo/types/auth`) where the API shares them.
- Styling: Tailwind v4 utilities, `cn()` for class merging, light/dark theme through `next-themes`. Prefer shadcn components over hand-rolled ones.
- Add a new feature by creating `features/<name>/` following `features/auth/`, then wire the page in `router/Router.tsx` under `ProtectedRoute` or `PublicRoute`.
