<!-- ===== CLAUDE.md =====

# Project guide

- `apps/web` owns the UI. 
- `apps/api` owns server-side behavior and API endpoints.
- `packages/` contains shared code used by both web and api.
- Shared Zod schemas and TypeScript types should live in packages.
- Do not duplicate shared validation schemas or types in apps/web or apps/api.
- Before proposing a change, trace the current flow and find a similar feature.
  If an API contract changes, check its callers and the relevant tests.
- Use the package manager and scripts defined in this repository.
- Keep each change focused on one behavior that can be checked independently.
- In learning mode, give me a hint first and wait before writing code.
- When I request a code review, use `code-reviewer`. Pass the goal, review
  scope, base ref for a branch review and plan path if I provided one.
- Keep secrets and production data out of prompts, fixtures and logs.

## Verified commands

- Dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Tests: `pnpm test` -->


# Project Guide

## Monorepo Structure

- `apps/web` contains the frontend application.
- `apps/api` contains the backend Node.js application.
- `packages/` contains shared code used by frontend and backend.

## Monorepo Architecture

- This repository uses pnpm workspaces.
- Workspace packages are defined in `pnpm-workspace.yaml`.
- Applications are located in `apps/*`.
- Shared packages are located in `packages/*`.
- Use `workspace:*` when referencing local workspace packages.
- Do not duplicate shared functionality between applications.
- Before creating a new shared package, inspect existing packages.
- Keep dependencies scoped to the workspace package that needs them.

## Shared Packages

- Shared Zod schemas should live in `packages/`.
- Shared TypeScript types should live in `packages/`.
- Avoid duplicating types and validation schemas across applications.
- Before creating a new type or schema, check whether an existing shared definition can be reused.

## Package Manager

- This project uses pnpm.
- Always use pnpm for package management.
- Never use npm or yarn.
- Prefer running scripts through the root workspace when available.

## Development Guidelines

- Before implementing a feature, inspect the existing code.
- Look for similar implementations before creating new ones.
- Keep changes focused and avoid unrelated refactoring.
- Follow existing naming conventions and project architecture.
- Use TypeScript types instead of `any` whenever possible.

## Code Review

- When I request a code review, use the `code-reviewer` agent.
- Follow the review instructions defined in `.claude/agents/code-reviewer.md`.

## Security

- Never expose secrets, API keys or credentials.
- Never include production data in test fixtures or logs.

## Package Naming

- Use `@packages/*` as the namespace for internal workspace packages.
- Do not use `@repo/*` for internal packages.
- Keep package names consistent across package.json files and imports.