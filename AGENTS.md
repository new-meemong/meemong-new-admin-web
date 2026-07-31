# AGENTS.md

<!-- meemong-common v1 start -->
## Meemong shared working agreements

- Keep changes scoped to the requested problem and preserve unrelated user-authored work.
- Apply technically valid, low-risk review feedback in the current change when it improves the touched area.
- After refactoring, verify that names still match the domain intent and actual reuse scope.
- Follow the repository's existing architecture and reuse established shared building blocks and utilities before adding new abstractions.
- Never commit credentials, tokens, production data, or user personal information.
- Run the relevant checks for the changed area and report any check that could not be run.
<!-- meemong-common v1 end -->

## Project overview

This is the Meemong operations admin dashboard built with Next.js 15, React 19, TypeScript, TanStack Query, Zustand, and Firebase.

## Package manager and commands

Use npm and keep `package-lock.json` authoritative.

```bash
npm ci
npm run dev
npm run test
npm run lint
npm run build
```

Run focused Vitest files with `npx vitest run <test-file>`.

## Code organization

- `src/app/` owns App Router pages, layouts, and route groups.
- `src/apis/` owns transport functions and API request/response types.
- `src/queries/` owns TanStack Query hooks and cache behavior built on the API layer.
- `src/stores/` owns client-side Zustand state.
- `src/components/shared/` contains reusable admin UI; domain-specific UI belongs under `src/components/features/` or its dashboard route.
- `src/lib/firebase/` centralizes Firebase initialization and database selection.

## Implementation rules

- Keep API calls in `src/apis/`; UI components should consume query hooks rather than duplicate request logic.
- Reuse the existing table, pagination, modal, dialog, drawer, and form components before creating variants.
- When changing authentication, inspect both `src/middleware.ts` and `src/middlewares/authMiddleware.tsx` and preserve the existing access-token cookie flow.
- Add or update Vitest coverage for pure logic, query behavior, and Firebase database selection when those areas change.

## Verification

- Run `npm run test` for logic or data-layer changes.
- Run `npm run lint` for all code changes.
- Run `npm run build` for routing, configuration, authentication, or production-facing changes.
