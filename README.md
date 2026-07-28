# Todo App — Next.js 16 + nuqs + Prisma + Cloudflare Workers

A single-page todo app:

- **Next.js 16.2.11** (App Router, Server Actions, Server Components)
- **nuqs** for URL-backed search + filter state (`q`, `status`, `priority`)
- **Prisma 6** (driver adapters) + **Postgres**
- Deployed to **Cloudflare Workers** via the **OpenNext Cloudflare adapter**
- **CI/CD**: GitHub Actions → Cloudflare Workers

## Why Hyperdrive?

Cloudflare Workers can't open a raw TCP socket straight to Postgres. The
standard pattern is **Hyperdrive**, which Cloudflare provides as a connection
pooler/binding — your code talks to `env.HYPERDRIVE`, Cloudflare handles the
actual Postgres connection. Locally, Prisma just uses `DATABASE_URL` directly
via `pg`. `src/lib/prisma.ts` handles both cases with the same `PrismaClient`
(via `@prisma/adapter-pg`), so nothing in your app code changes between
environments.

## 1. Install

```bash
npm install
cp .env.example .env
# edit .env with your local Postgres connection string
```

## 2. Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Any Postgres works for local dev (local install, Docker, Neon, Supabase,
Cloudflare's own Postgres partners, etc.) — just point `DATABASE_URL` at it.

## 3. Run locally

```bash
npm run dev
```

## 4. Set up Cloudflare

```bash
# one-time login
npx wrangler login

# create the Hyperdrive binding pointed at your production Postgres
npx wrangler hyperdrive create todo-app-db \
  --connection-string="postgresql://user:pass@host:5432/todoapp"
```

Copy the returned `id` into `wrangler.jsonc` under `hyperdrive[0].id`.

Then generate the typed `CloudflareEnv` interface:

```bash
npm run cf:typegen
```

## 5. Deploy manually (sanity check before wiring CI)

```bash
npx prisma migrate deploy   # run against your production DB
npm run cf:build            # opennextjs-cloudflare build
npm run cf:deploy           # build + wrangler deploy
```

`npm run cf:preview` builds and runs the Worker locally via `workerd` if you
want to test the Cloudflare runtime before deploying.

## 6. CI/CD (GitHub Actions)

`.github/workflows/deploy.yml` is already set up to:

- run on every push/PR to `main`
- install deps, generate the Prisma client, run `prisma migrate deploy`
- build with the OpenNext Cloudflare adapter
- `wrangler deploy --dry-run` on pull requests (build check only)
- `wrangler deploy` for real on pushes to `main`

Add these repository secrets (Settings → Secrets and variables → Actions):

| Secret | Where to get it |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens (needs Workers Scripts:Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → right sidebar of any zone/Workers overview |
| `DATABASE_URL` | Your production Postgres connection string (used only to run migrations in CI — the deployed Worker itself uses the Hyperdrive binding, not this secret) |

## Project layout

```
src/
  app/
    page.tsx          Server Component — reads filters, queries Prisma
    actions.ts         Server Actions — create/toggle/delete/update todo
    layout.tsx          Wraps the app in <NuqsAdapter>
  components/
    todo-form.tsx       Add-todo form (client, calls a Server Action)
    todo-filters.tsx     Search + status + priority filters (client, nuqs)
    todo-list.tsx        Renders filtered todos (server)
    todo-item.tsx         Toggle/delete row (client)
  lib/
    prisma.ts          PrismaClient via @prisma/adapter-pg (DATABASE_URL or Hyperdrive)
    search-params.ts    Shared nuqs parsers + server-side cache
  types/todo.ts
prisma/schema.prisma
wrangler.jsonc          Worker + Hyperdrive binding config
open-next.config.ts      OpenNext Cloudflare adapter config
.github/workflows/deploy.yml
```

## How filter/search works

- `TodoFilters` is a client component using `useQueryStates` from `nuqs` to
  keep `q`, `status`, and `priority` in the URL (shareable, back-button
  friendly, debounced on typing).
- `page.tsx` (a Server Component) parses those same params server-side with
  `searchParamsCache` from `nuqs/server`, builds a Prisma `where` clause, and
  queries Postgres directly — no client-side fetch/loading state needed.
