# Backend Review: Pros, Cons, and Upgrade Recommendations

## Scope
This review covers the current backend in `apps/api/src`, with focus on auth flow, error handling, validation, architecture, and data access.

## What Is Good (Pros)

1. Clear layered structure
- You already separate concerns into `routes -> controller -> service -> repository`.
- Dependency injection in `src/di.ts` keeps construction centralized and test-friendly.

2. Good baseline security defaults
- `helmet`, `cors`, `cookie-parser`, and `httpOnly` refresh cookies are in place.
- Password hashing uses `bcrypt` and token verification is centralized in JWT utils.

3. Strong environment validation
- `env.ts` validates critical runtime config and fails fast on invalid environment variables.

4. Centralized async error forwarding
- `asyncHandler` reduces repetitive `try/catch` in controllers.

5. Database error normalization
- `error-handler.ts` maps many Postgres/Drizzle failures into consistent API responses.

6. Modern DB modeling
- Drizzle schema and relations are well structured and readable.

## What Is Bad / Risky (Cons)

1. Password can leak on register response (high)
- In `AuthService.register`, returned `user` comes from repository and is safe today, but this safety depends on repository returning a custom projection.
- `findByEmail` in repository returns full user including password, and `refreshToken` returns full user directly from service.
- This creates inconsistent response shaping and higher accidental leak risk.

2. Refresh token flow is stateless and not revocable (high)
- Refresh tokens are validated cryptographically but not stored/rotated with server-side revocation tracking.
- `logout` only clears cookie client-side; stolen refresh tokens can still be used until expiry.

3. Global auth middleware placement can block future public routes (medium)
- `app.use(authenticateToken)` is mounted globally after auth routes.
- Any new route added below it becomes protected by default, which can cause accidental auth requirements.

4. Validation schema is too close to raw DB insert schema (medium)
- `register` uses `createInsertSchema(users)` directly.
- DB schema is not always equivalent to API contract; clients should not inherit every DB-level field/constraint.

5. JWT config values in env are not used (medium)
- `JWT_ACCESS_EXPIRY` and `JWT_REFRESH_EXPIRY` exist in `env.ts` but token generation hardcodes `'15mins'` and `'7d'`.

6. Error response style is inconsistent (low/medium)
- Validation middleware returns `{ message, errorDetails }` with HTTP 400.
- AppError-driven validation currently maps to 422.
- Mixed conventions make frontend handling less predictable.

7. Leftover commented legacy code increases maintenance noise (low)
- Large commented blocks in controller/repository/service reduce signal-to-noise and can confuse onboarding.

8. Minor correctness/consistency issues (low)
- Typo in message: `Validation fails!`.
- Access token expiry string `'15mins'` is non-standard style; `'15m'` is clearer and aligns with env default.

## Recommended Update Plan

1. Introduce explicit API DTOs and response mappers
- Create `PublicUser` DTO and always map entity -> API response in one place.
- Never return repository rows directly from service/controller.

2. Implement refresh token rotation with revocation
- Store hashed refresh tokens (or token family/session IDs) in DB.
- On refresh: verify, rotate, invalidate old token.
- On logout: revoke current session token server-side.

3. Split public and protected route groups
- Keep `/api/auth/*` public endpoints in one router.
- Mount protected routers with route-level middleware, e.g. `app.use('/api/me', authenticateToken, meRoutes)`.

4. Replace DB-derived register schema with API-specific schema
- Define `registerSchema` in route layer (or dedicated `schemas` folder).
- Include only client-allowed fields and explicit password policy.

5. Make JWT expiry and cookie max-age config-driven
- Read `JWT_ACCESS_EXPIRY` and `JWT_REFRESH_EXPIRY` from env in jwt utils.
- Keep cookie `maxAge` aligned with refresh token TTL.

6. Standardize error contract
- Use one shape everywhere, e.g. `{ code, message, details? }`.
- Pick a single status strategy for validation errors (400 or 422) and enforce consistently.

7. Add tests around auth critical path
- Unit tests: `AuthService` register/login/refresh/logout logic.
- Integration tests: `/login`, `/refresh-token`, `/logout` behavior and cookie flags.

## Quick Wins

1. Remove commented legacy blocks from service/controller/repository.
2. Introduce `toPublicUser()` mapper and use it everywhere.
3. Start using env-driven JWT expirations immediately.
4. Add one regression test that proves `password` never appears in any auth response.

## Suggested Snippets

```ts
// 1) Shared public-user mapper (response safety)
export type PublicUser = {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: 'admin' | 'customer' | 'mechanic';
  createdAt: Date;
  updatedAt: Date;
};

export const toPublicUser = (user: {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: 'admin' | 'customer' | 'mechanic';
  createdAt: Date;
  updatedAt: Date;
}): PublicUser => ({
  id: user.id,
  email: user.email,
  username: user.username,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});
```

```ts
// 2) API-specific register schema (instead of raw createInsertSchema(users))
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(128),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  phone: z.string().max(30).optional()
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

```ts
// 3) JWT expiry driven by env
import jwt from 'jsonwebtoken';
import { env } from '@/env.js';

export const generateAccessJWTtoken = (payload: object) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRY });

export const generateRefreshJWTtoken = (payload: object) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRY });
```

```ts
// 4) Example protected route mounting (avoid accidental global lock)
app.use('/api/auth', authRoutes); // public
app.use('/api/me', authenticateToken, meRoutes); // protected
app.use('/api/appointments', authenticateToken, appointmentRoutes); // protected
```

```ts
// 5) Standardized error response helper
export type ErrorBody = {
  code: string;
  message: string;
  details?: Array<{ field?: string; message: string }>;
};

export const sendError = (
  res: import('express').Response,
  status: number,
  body: ErrorBody
) => res.status(status).json(body);
```
