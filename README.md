# katabolab blog (`k-blog`)

A minimalist, high-contrast, distraction-free technical publication platform for katabolab.

- **Production URL:** [https://blog.katabolab.com](https://blog.katabolab.com)
- **Vercel Project:** `k-blog` (`greg-hayworths-projects`)
- **Repository:** `gfhayworth/k-blog`

---

## Architecture & Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js (App Router, Turbopack) | Fast static/dynamic hybrid rendering with React 19 |
| **Styling** | Tailwind CSS v4 | `@tailwindcss/typography`, subtle borders, monospace metadata accents, dark/light theme switching (`next-themes`) |
| **Database** | Neon Serverless PostgreSQL | Dedicated `katabo_blog` database isolated on the existing cluster |
| **ORM & Migrations** | Drizzle ORM (`drizzle-kit`) | Type-safe schema definitions and migration management |
| **Authentication** | Auth.js / NextAuth v5 | Passwordless Magic Links dispatched via Resend; strict single-admin authorization |
| **Storage & Media** | Cloudflare R2 | S3-compatible asset store with authenticated file uploader & streaming proxy |
| **DNS & Edge** | Cloudflare + Vercel | CNAME routing with edge proxying and SSL/TLS termination |

---

## Key Features

- **Chronological Prose Index (`/`):** Clean reading experience showing published essays, summaries, dates, and estimated reading times.
- **Prose Reader (`/[slug]`):** High-contrast typography layout with Markdown rendering, cover image presentation, and automatic 404 for draft posts.
- **Syndication:** Dynamic RSS 2.0 feed (`/feed.xml`) and Google sitemap (`/sitemap.xml`).
- **Admin Dashboard (`/admin`):** Full post lifecycle management (Draft/Published status toggles, editing, deletion with instant revalidation).
- **Distraction-Free Editor (`/admin/new`, `/admin/[id]/edit`):**
  - Live side-by-side / toggle Markdown preview.
  - Drag-and-drop file upload to Cloudflare R2 inserting Markdown syntax at cursor.
  - Custom slug and cover image selection.
- **Restricted Access:** Hardened Edge Middleware redirecting unauthorized visitors to `/auth/signin` and rejecting non-whitelisted emails before sending magic links.

---

## Project Structure

```
k-blog/
├── app/
│   ├── [slug]/             # Prose reader for published posts
│   ├── admin/              # Dashboard, post creation, and editor routes
│   ├── api/
│   │   ├── auth/           # NextAuth authentication endpoints
│   │   ├── media/          # Secure proxy streaming media from R2
│   │   └── upload/         # Authenticated image upload endpoint
│   ├── auth/               # Branded auth views (signin, verify-request, error)
│   ├── feed.xml/           # Dynamic RSS feed generator
│   ├── sitemap.ts          # XML Sitemap generator
│   ├── globals.css         # Minimalist theme system & typographic styles
│   └── page.tsx            # Chronological feed index
├── components/
│   ├── header.tsx          # Navigation header and footer
│   ├── post-editor.tsx     # Authoring editor with R2 upload & markdown preview
│   ├── theme-provider.tsx  # Next-themes dark mode provider
│   └── theme-toggle.tsx    # Sun/moon toggle button
├── docs/design/            # Implementation specifications and architecture blueprints
├── drizzle/                # SQL migration files
├── lib/
│   ├── actions.ts          # Server Actions for post CRUD & revalidation
│   ├── db/                 # Drizzle database client & schema
│   ├── markdown.ts         # Markdown renderer and reading time calculator
│   └── r2.ts               # Cloudflare R2 S3 client & helpers
├── auth.ts                 # NextAuth configuration & admin whitelist guard
├── drizzle.config.ts       # Drizzle kit configuration
└── middleware.ts           # Edge middleware protecting /admin/**
```

---

## Local Development

### 1. Prerequisites
- Node.js >= 20.x
- npm

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000` or `https://blog.katabolab.com`
- `AUTH_SECRET` — Random 32+ byte string (`openssl rand -hex 32`)
- `ADMIN_EMAIL` — Whitelisted email addresses (comma-separated)
- `AUTH_FROM_EMAIL` — Sending address for authentication magic links (e.g. `auth@katabolab.com`)
- `DATABASE_URL` — Neon pooled connection string targeting `katabo_blog`
- `DATABASE_URL_UNPOOLED` — Neon unpooled connection string
- `RESEND_API_KEY` — Resend API key for sending emails
- `R2_ACCOUNT_ID` — Cloudflare account ID
- `R2_ACCESS_KEY_ID` — Cloudflare R2 access key
- `R2_SECRET_ACCESS_KEY` — Cloudflare R2 secret key
- `R2_BUCKET_NAME` — Storage bucket name
- `R2_PUBLIC_URL` — Public CDN URL or domain (optional, defaults to internal proxy)

### 4. Database Migrations
Generate or apply Drizzle migrations against Neon:

```bash
npx drizzle-kit generate
```

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the blog.
