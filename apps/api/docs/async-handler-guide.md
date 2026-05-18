# Async Handler Guide (Express + Drizzle + PostgreSQL)

This guide explains how to remove repeated `try/catch` blocks from controllers by using `asyncHandler` + a global error middleware.

## Current state in your project

- You already have `asyncHandler` in `src/middleware/async-handler.ts`.
- You already have a custom error hierarchy in `src/errors/AppError.ts`.
- Your controllers in `src/controllers/auth-controller.ts` still use local `try/catch`.
- `src/app.ts` currently has no global Express error handler (`app.use((err, req, res, next) => ...)`).

## Do you need a CustomError class?

Short answer: yes, it is strongly recommended.

Reason:
- `asyncHandler` only forwards errors to `next(err)`.
- You still need a standard way to convert thrown errors into HTTP status + client-safe message.
- `AppError` gives that standard shape (`statusCode`, `isOperational`).

You already have this class, so you should keep using it.

## How `asyncHandler` works

Your function:

```ts
export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
```

What it does:
1. Wraps an async controller.
2. If controller throws/rejects, it automatically calls `next(error)`.
3. Express forwards that error to your global error middleware.
4. You avoid repeating `try/catch` inside each controller.

## Step-by-step integration

1. Keep `AppError` classes in `src/errors/AppError.ts` (already done).
2. Add a global error middleware (new file, e.g. `src/middleware/error-handler.ts`).
3. Register it in `src/app.ts` after routes.
4. Wrap async route handlers with `asyncHandler(...)`.
5. In controllers, throw `AppError` subclasses instead of sending many ad-hoc `res.status(...).json(...)` inside `catch`.
6. Map PostgreSQL/Drizzle errors in one place (global middleware), not inside each controller.

## Example global error middleware

```ts
import type { ErrorRequestHandler } from 'express';
import { AppError, ConflictError } from '@errors/AppError.js';
import { DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError as PgError } from 'pg';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Central DB error mapping
  if (err instanceof DrizzleQueryError && err.cause instanceof PgError) {
    if (err.cause.code === '23505') {
      err = new ConflictError('Resource already exists');
    }
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ message: 'Internal server error' });
};
```

Then in `app.ts`:

```ts
app.use('/api/auth', authRoutes);
app.use(errorHandler);
```

## Example controller style (without repeated try/catch)

```ts
export const register = asyncHandler(async (req, res) => {
  const { email, password, username, firstName, lastName, phone } = req.body;
  const hashedPassword = await hashPassword(password);

  const [user] = await db.insert(users).values({
    username, email, password: hashedPassword, firstName, lastName, phone
  }).returning({
    id: users.id,
    username: users.username,
    email: users.email
  });

  if (!user) throw new AppError('Failed to create user', 500);

  // token generation...
  return res.status(201).json({ user, accessToken });
});
```

## PostgreSQL error analysis from your controllers

File reviewed: `src/controllers/auth-controller.ts`

- `register`:
  - Explicitly checks for PostgreSQL code `23505` (unique violation) through `DrizzleQueryError` + `pg.DatabaseError`.
  - Current client message: `"An account with these credentials already exists."`
  - Fallback message: `"Failed to create a new user"`
- `login`:
  - No PostgreSQL-specific code mapping.
  - On unexpected DB/query failure it returns generic `"Failed to login"`.
- `refreshToken`:
  - No PostgreSQL-specific mapping.
  - Any error inside `try` returns `401 "Invalid refresh token"` (this can hide DB failures as auth failures).
- `logout`:
  - No DB access.

## Suggested PostgreSQL codes to map centrally

- `23505` unique violation -> `409 Conflict`
- `23503` foreign key violation -> `409 Conflict` (or `422`)
- `23502` not-null violation -> `400 Bad Request`
- `22P02` invalid text representation (e.g. bad UUID) -> `400 Bad Request`
- `08006` connection failure -> `503 Service Unavailable`

## Practical recommendation for your app

1. Keep `AppError` (you already have it).
2. Keep `asyncHandler` (you already have it).
3. Add global `errorHandler`.
4. Migrate controllers progressively:
   - start with `register`
   - then `login`
   - then `refreshToken`
5. Move all PostgreSQL/Drizzle code mapping into `errorHandler` to keep controllers clean.

