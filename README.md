# Fullstack Knowledge Base

> Next.js (App Router) + Prisma + PostgreSQL + NextAuth (GitHub OAuth). SSR homepage, protected dashboard, RBAC (author/admin), Zod validation.

## ✨ Features

- SSR homepage (Prisma query, no-cache)
- Auth: NextAuth v4 (GitHub OAuth), DB sessions/JWT
- RBAC: author-only edit/delete; ADMIN can manage all
- RESTful API under `app/api` (GET/POST/PATCH/DELETE)
- Input validation with Zod

## 🧱 Tech Stack

- Next.js 14 (App Router), React 18, TypeScript
- NextAuth v4 (GitHub provider)
- PostgreSQL + Prisma
- Local via Docker (Postgres) or Supabase (free)

## 🚀 Getting Started

```bash
yarn
# OPTION A: Local Postgres (Docker Desktop required)
docker compose up -d
# OPTION B: Supabase — set DATABASE_URL to your connection string

yarn prisma generate
yarn prisma migrate dev --name init
yarn dev
```
