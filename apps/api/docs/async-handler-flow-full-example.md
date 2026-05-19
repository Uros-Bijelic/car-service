# Async Handler Full Flow (Step-by-Step)

This document explains the full error flow in your app and gives complete code you can copy into your project.

## Mental model first

Think of 4 layers:

1. Controller
2. `asyncHandler`
3. Global `errorHandler`
4. HTTP response to client

Flow:

1. Request hits controller.
2. If controller succeeds -> returns `res.status(...).json(...)`.
3. If controller throws error -> `asyncHandler` catches it and calls `next(err)`.
4. Express sends `err` to global `errorHandler`.
5. `errorHandler` decides status/message and returns response.

## Your question: “If something is wrong in controller, I throw error and errorHandler returns json?”

Yes. Exactly.

In controller:

```ts
throw new UnauthorizedError('Invalid credentials');
```

Then global `errorHandler` sends:

```json
{ "message": "Invalid credentials" }
```

with status `401`.

## Your question: “Will `instanceof AppError` cover subclasses?”

Yes.

If `ForbiddenError`, `DatabaseError`, `ConflictError`, etc. all extend `AppError`, then:

```ts
err instanceof AppError
```

is `true` for all of them.

So one check handles all custom subclasses.

## Your question: “Why Drizzle/Postgres mapping in errorHandler?”

Correct: that mapping belongs in global `errorHandler`.

Reason:
- `DrizzleQueryError`/`pg` errors are low-level DB errors.
- Convert them once in one place into your domain error (`AppError` subclasses).
- Keep controllers clean and consistent.

So yes, this is right in `errorHandler`:

```ts
if (err instanceof DrizzleQueryError && err.cause instanceof PgError) {
  if (err.cause.code === '23505') {
    err = new ConflictError('Resource already exists');
  }
}
```

---

## Full code

## 1) `src/errors/AppError.ts`

You already have this structure. Included here as full reference:

```ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 422);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database error') {
    super(message, 503);
  }
}
```

## 2) `src/middleware/async-handler.ts`

```ts
import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncRequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
```

## 3) `src/middleware/error-handler.ts` (new)

```ts
import type { ErrorRequestHandler } from 'express';
import { DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError as PgError } from 'pg';
import {
  AppError,
  ConflictError,
  DatabaseError
} from '@errors/AppError.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // 1) Map low-level DB errors into your AppError family.
  if (err instanceof DrizzleQueryError && err.cause instanceof PgError) {
    switch (err.cause.code) {
      case '23505': // unique_violation
        err = new ConflictError('Resource already exists');
        break;
      case '08006': // connection_failure
        err = new DatabaseError('Database connection error');
        break;
      default:
        err = new DatabaseError('Database query failed');
        break;
    }
  }

  // 2) Handle all custom app errors (includes all subclasses).
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message
    });
  }

  // 3) Unknown/unexpected error.
  console.error('Unhandled error:', err);
  return res.status(500).json({
    message: 'Internal server error'
  });
};
```

## 4) `src/controllers/auth-controller.ts` (register example with no try/catch)

```ts
import { comparePasswords, hashPassword } from '@utils/password.js';
import type { Response, Request } from 'express';
import { db } from '@db/db.js';
import { users, type NewUser } from '@db/schema.js';
import { eq } from 'drizzle-orm';
import {
  generateAccessJWTtoken,
  generateRefreshJWTtoken,
  verifyRefreshJWT
} from '@utils/jwt.js';
import type { LoginSchema } from '@routes/auth-routes.js';
import type { JwtPayload } from 'jsonwebtoken';
import env from '@env/.js';
import { asyncHandler } from '@middleware/async-handler.js';
import { AppError, UnauthorizedError } from '@errors/AppError.js';

const isProd = env.NODE_ENV === 'production';

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  maxAge: 1000 * 60 * 60 * 24 * 7
};

export const register = asyncHandler(
  async (req: Request<unknown, unknown, NewUser>, res: Response) => {
    const { email, password, username, firstName, lastName, phone } = req.body;
    const hashedPassword = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });

    if (!user) {
      throw new AppError('Failed to create user', 500);
    }

    const accessToken = generateAccessJWTtoken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    const refreshToken = generateRefreshJWTtoken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    return res.status(201).json({
      user,
      accessToken
    });
  }
);

export const login = asyncHandler(
  async (req: Request<unknown, unknown, LoginSchema>, res: Response) => {
    const { email, password } = req.body;

    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user) throw new UnauthorizedError('Invalid credentials');

    const isValidPassword = await comparePasswords(password, user.password);
    if (!isValidPassword) throw new UnauthorizedError('Invalid credentials');

    const accessToken = generateAccessJWTtoken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    const refreshToken = generateRefreshJWTtoken({
      id: user.id,
      email: user.email,
      username: user.username
    });

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      accessToken
    });
  }
);

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) throw new UnauthorizedError('Unauthorized');

  const payload = verifyRefreshJWT(incomingRefreshToken) as JwtPayload;

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.id),
    columns: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) throw new UnauthorizedError('Unauthorized');

  const accessToken = generateAccessJWTtoken({
    id: user.id,
    email: user.email,
    username: user.username
  });

  const rotatedRefreshToken = generateRefreshJWTtoken({
    id: user.id,
    email: user.email,
    username: user.username
  });

  res.cookie('refreshToken', rotatedRefreshToken, refreshCookieOptions);

  return res.status(200).json({
    user,
    accessToken
  });
});
```

## 5) `src/routes/auth-routes.ts` (if controller already wrapped, route is normal)

```ts
authRoutes.post('/login', validateBody(loginSchema), login);
authRoutes.post('/register', validateBody(insertUserSchema), register);
authRoutes.post('/refresh-token', refreshToken);
authRoutes.post('/logout', logout);
```

No extra wrapping needed here because controller itself already uses `asyncHandler`.

## 6) `src/app.ts` register global error handler last

```ts
import { errorHandler } from '@middleware/error-handler.js';

app.use('/api/auth', authRoutes);
app.use(errorHandler); // must be after routes
```

## Key rules to remember

1. Known business/auth/validation errors: throw `AppError` subclasses in controller.
2. Unknown low-level DB errors: let them bubble; map centrally in `errorHandler`.
3. One `instanceof AppError` check is enough for all subclasses.
4. `asyncHandler` removes repetitive `try/catch` for async controllers.

