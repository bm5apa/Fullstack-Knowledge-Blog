# Fullstack Knowledge Blog

A full-stack blogging platform built with **Next.js App Router**, **Prisma**, **Supabase**, and **NextAuth**.  
Supports full article CRUD, tag management, authentication with GitHub OAuth, and authorization checks.  
Deployed on [Vercel](https://vercel.com/).

---

## ✨ Features

- 🔐 **Authentication & Authorization** (NextAuth.js + GitHub OAuth)
- 📝 **Post Management** (create, edit, delete, publish/unpublish)
- 🏷️ **Tagging System** (many-to-many relationships via Prisma)
- 👥 **Role-based Permissions** (author-only editing, admin override)
- 🎨 **Modern UI** with Tailwind CSS
- ⚡ **Server-side Validation** with Zod
- ☁️ **Production-ready** deployment on Vercel

---

## 🔧 Tech Stack

- [Next.js 15 (App Router)](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/)
- [Supabase Postgres](https://supabase.com/)
- [NextAuth.js](https://next-auth.js.org/) — GitHub OAuth provider
- [Tailwind CSS](https://tailwindcss.com/) — UI styling
- [Zod](https://zod.dev/) — input validation
- [Playwright](https://playwright.dev/) — E2E testing (optional)

---

## ⚙️ Environment Variables

Create a `.env.local` file at the project root.  
Vercel will map these automatically on deployment.

# Database

```env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres?pgbouncer=false"

# NextAuth
NEXTAUTH_SECRET="your_random_secret"
NEXTAUTH_URL="http://localhost:3000" # for local dev
GITHUB_ID="your_github_oauth_id"
GITHUB_SECRET="your_github_oauth_secret"

# Deployment site
NEXT_PUBLIC_SITE_URL="https://your-vercel-app.vercel.app"
```

## 🚀 Getting Started (Local Development)

1. Clone the repo

```bash
   git clone https://github.com/your-username/fullstack-knowledge-blog.git
   cd fullstack-knowledge-blog
```

2. Install dependencies

```bash
   yarn install
```

3. Generate Prisma Client & run migrations

```bash
   yarn prisma generate
   yarn prisma migrate dev
```

4. Start the dev server

```bash
   yarn dev
```

Visit http://localhost:3000

## ✅ Testing

- Unit / Integration tests:

```bash
yarn test
```

- E2E tests with Playwright (optional):

```bash
yarn playwright test
```

- Manual sanity checks:

* Sign in via /api/auth/signin with GitHub OAuth
* Create a post with tags → confirm it shows in the list
* Use a second account to test PATCH / DELETE → should return 403 if not the author
* Sign out and sign back in → session should persist correctly

## ☁️ Deployment

- Deployed on Vercel: push to main → auto build & deploy

- Ensure the following env vars are set in Vercel Dashboard:

* DATABASE_URL
* DIRECT_URL
* NEXTAUTH_SECRET
* NEXTAUTH_URL
* GITHUB_ID / GITHUB_SECRET
* NEXT_PUBLIC_SITE_URL
