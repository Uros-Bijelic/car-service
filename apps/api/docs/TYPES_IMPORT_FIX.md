# Types Import Fix (`@repo/types`)

## Problem
`registerSchema` from `packages/types/auth.ts` could not be imported reliably in `apps/api` and `apps/web` because:
- `apps/web` path mapping pointed to `packages/types/src/*`, but there is no `src` directory in `packages/types`.
- `@repo/types` package exports were too generic and did not provide an explicit root/subpath contract.
- `apps/web` did not declare `@repo/types` as a workspace dependency.

## Changes made
1. Updated `packages/types/package.json` exports:
- Added `".": "./index.ts"`
- Added `"./auth": "./auth.ts"`

2. Added `packages/types/index.ts`:
- Re-exported `auth` module (`export * from './auth';`)

3. Fixed web TypeScript path mapping in `apps/web/tsconfig.paths.json`:
- Changed `@repo/types/*` from `../../packages/types/src/*` to `../../packages/types/*`

4. Added dependency in `apps/web/package.json`:
- `"@repo/types": "workspace:*"`

5. Switched usage to shared schemas:
- `apps/api/src/routes/auth-routes.ts` now imports `{ loginSchema, registerSchema }` from `@repo/types/auth`
- `apps/web/src/pages/Register.tsx` now imports schema/types from `@repo/types/auth`

## Result
Both API and web now resolve and consume shared auth schemas from `@repo/types/auth`.
