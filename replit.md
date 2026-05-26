# DevForge

A cloud-based coding platform (Replit clone) where users can create, run, and share projects in the browser — no local setup required.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm --filter @workspace/replit-clone run dev` — run the frontend (served at `/`)
- `pnpm run typecheck` — full typecheck across all packages (build libs first, then leaf packages)
- `pnpm run typecheck:libs` — build composite lib declaration files
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes to PostgreSQL (dev only)
- Required env: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Wouter (routing) + shadcn/ui + Tailwind CSS v4
- Auth: Clerk (`@clerk/react` v6 on frontend, `@clerk/express` on backend, proxy pattern)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle for API server)

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth OpenAPI spec
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas
- `lib/db/src/schema/` — Drizzle ORM schema (users, projects, activity)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts` — Clerk proxy
- `artifacts/replit-clone/src/` — React frontend
- `artifacts/replit-clone/src/pages/` — all page components
- `artifacts/replit-clone/src/components/` — shared components (layout, create-project-modal, etc.)

## Architecture decisions

- Contract-first API: OpenAPI spec is the source of truth; never write fetch calls by hand
- Clerk proxy pattern: frontend calls `/clerk` path, API server proxies to Clerk's servers
- DB auto-provision user on first `/api/users/me` call (no separate signup flow needed)
- All projects get a free subdomain: `{name}.replit.work.gd`
- Dark-only theme: devtool-inspired palette (HSL 222/16%/10% background, 221/83%/53% primary)

## Product

- **Landing page**: Marketing site with project type grid, features, stats, and CTA
- **Dashboard** (`/home`): Stats overview, recent projects list, activity feed
- **Repls** (`/repls`): All user projects, search/filter by type, create/delete
- **Community** (`/community`): Browse public projects, fork them
- **Agent** (`/agent`): AI chat assistant, select a project and describe what to build
- **Templates** (`/templates`): Pre-configured project starters by category
- **Settings** (`/settings`): Profile editing, plan info, subdomain docs
- **Project Detail** (`/projects/:id`): Stats, subdomain URL, edit name/visibility

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Must run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` or leaf package typechecks will fail (lib declarations must be emitted first)
- `@clerk/react` v6 and `@clerk/themes` v2 are the correct frontend versions (the workspace was scaffolded with old v4/v1 versions that don't exist on npm)
- Clerk listener callback uses `any` typing due to incompatible `Resources` type from Clerk v6
- Always run `pnpm --filter @workspace/db run push` after schema changes

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk configuration and proxy setup details
