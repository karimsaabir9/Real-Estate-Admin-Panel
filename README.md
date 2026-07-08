# Real Estate Admin Panel

An admin panel for managing real estate properties, owners, tenants, and deals, with a modern glassmorphism design.

## Tech Stack

- **[Next.js 16](https://nextjs.org)** — App Router
- **[tRPC](https://trpc.io)** — end-to-end type-safe API
- **[Better Auth](https://better-auth.com)** — email/password authentication
- **[Drizzle ORM](https://orm.drizzle.team)** — type-safe ORM
- **[Neon](https://neon.tech)** — serverless Postgres
- **[TanStack Query](https://tanstack.com/query)** — data fetching/caching
- **[Tailwind CSS](https://tailwindcss.com)** + **[shadcn/ui](https://ui.shadcn.com)** (Radix) — UI components
- **[Cloudinary](https://cloudinary.com)** — image uploads (profile pictures + property images)

## Features

- Sign Up / Sign In (Better Auth, session cookie based)
- Dashboard — stat cards, income chart, weekly rent chart, daily activity donut, recent deals/tenants
- Registrations — property types CRUD
- Properties — CRUD + image upload (Cloudinary)
- Owners — CRUD
- Tenants — CRUD, linked to a property + payment status
- Deals — CRUD, linked to property/owner/tenant
- Report — date filtering, CSV export
- Settings — Profile (picture upload, personal info) + Security (password change)

## Getting Started

### 1. Configure `.env`

Copy `.env.example` to `.env`, then fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string (`console.neon.tech` → Connect) |
| `BETTER_AUTH_SECRET` | Random secret, 32+ characters (`openssl rand -hex 32`) |
| `BETTER_AUTH_URL` | App URL (`http://localhost:3000` in dev) |
| `NEXT_PUBLIC_APP_URL` | Same URL as above |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name (main dashboard page) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | An **Unsigned** upload preset (Settings → Upload → Upload presets) |

### 2. Install dependencies

```bash
npm install
```

### 3. Push the database schema

```bash
npm run db:push
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/sign-in` automatically. Use "Sign Up" to create your first account.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push the Drizzle schema to the database (dev) |
| `npm run db:generate` | Generate migration files |
| `npm run db:studio` | Open Drizzle Studio to browse the database |

## Project Structure

```
src/
  app/
    (auth)/          # Sign In / Sign Up pages
    (dashboard)/     # Protected pages (Dashboard, Properties, Owners, ...)
    api/
      auth/[...all]/ # Better Auth route handler
      trpc/[trpc]/   # tRPC route handler
  components/        # UI components (shadcn/ui + custom)
  lib/               # Helpers (auth-client, cloudinary, format, utils)
  server/
    api/             # tRPC routers
    auth/            # Better Auth config
    db/              # Drizzle schema + client
  trpc/              # tRPC client/provider (React Query)
```

## Deployment

Deploys well to [Vercel](https://vercel.com). Remember to set the environment variables listed above in production, then run `npm run db:push` (or generate a proper migration with `db:generate` and apply it) against the production database.
# Real-Estate-Admin-Panel
