# System Design & Implementation Plan: Minimalist Blog

- **Target Domain:** `blog.katabolab.com`
- **Hosting Platform:** Vercel (standalone project)
- **Database:** Neon Serverless PostgreSQL (new `katabo_blog` database on existing instance)
- **Authentication:** Passwordless Magic Link via Resend (reusing `k-mail` Resend credentials)
- **Media Storage:** Cloudflare R2 Bucket (reusing `k-mail` Cloudflare credentials)
- **Target Location in Workspace:** Standalone repository sibling to `k-mail`

---

## 1. Architectural Blueprint

The application operates as an independent Next.js deployment. It shares infrastructure credentials from the `k-mail` project while maintaining strict data and logical isolation.

```
                          +-------------------------+
                          |   blog.katabolab.com    |
                          +------------+------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
            [Public Surface]                       [Admin Surface]
            - / (Chronological Index)              - /admin (Dashboard)
            - /[slug] (Prose Reader)               - /admin/new (Editor)
            - /feed.xml (RSS)                      - /admin/[id]/edit
            - /sitemap.xml                                 |
                   |                                [Edge Middleware]
                   |                           (Magic Link Session Cookie)
                   |                                       |
       +-----------v---------------------------------------v-----------+
       |                       Next.js App Router                      |
       +-------------+--------------------+--------------------+-------+
                     |                    |                    |
                     v                    v                    v
           +------------------+  +------------------+  +---------------+
           |   Neon Postgres  |  |   Resend API     |  | Cloudflare R2 |
           |   (katabo_blog)  |  | (Shared k-mail)  |  | (Shared k-mail|
           | - posts          |  | - Auth Magic     |  |   credentials)|
           | - auth_tokens    |  |   Links only     |  | - Blog Images |
           +------------------+  +------------------+  +---------------+
```

---

## 2. Infrastructure & Credential Mapping (Reused from `k-mail`)

| Service | Source in `k-mail` | Utilization in `blog` |
| :--- | :--- | :--- |
| **Neon PostgreSQL** | Existing connection host & user | New database instance `katabo_blog` on same cluster |
| **Resend** | `RESEND_API_KEY` | Dispatching passwordless magic link authentication emails |
| **Cloudflare R2** | Account ID, Access Key ID, Secret Access Key | Storing blog images/covers via S3-compatible SDK (`@aws-sdk/client-s3`) |
| **DNS / Vercel** | Vercel team/account | New CNAME record `blog` -> `cname.vercel-dns.com` |

---

## 3. Data Model (`drizzle-orm`)

```typescript
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  summary: text('summary'),
  content: text('content').notNull(), // Markdown / MDX source
  coverImageUrl: text('cover_image_url'),
  status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(), // admin email
  token: text('token').notNull().unique(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});
```

---

## 4. Numbered Implementation Plan

### Step 1: Standalone Project Initialization
1. Initialize a clean Next.js project (App Router, TypeScript) in `k-blog`.
2. Configure Tailwind CSS with `@tailwindcss/typography` and `next-themes` for clean light/dark modes.
3. Establish a minimalist typographic system (subtle borders, muted grays, monospace metadata accents).

### Step 2: Dedicated Database Provisioning
1. Connect to the existing Neon cluster using credentials from `k-mail`.
2. Provision a new isolated database: `CREATE DATABASE katabo_blog;`.
3. Set up Drizzle ORM configured with `@neondatabase/serverless` targeting `katabo_blog`.
4. Run migrations to create `posts`, `verification_tokens`, and `sessions` tables.

### Step 3: Passwordless Auth with Resend
1. Configure Auth.js / NextAuth v5 with the Resend email provider using the reused `RESEND_API_KEY`.
2. Enforce strict single-user authorization:
   - Restrict allowed logins strictly to `ADMIN_EMAIL`.
   - Any login request from unrecognized email addresses is immediately rejected.
3. Guard `/admin/**` with Edge Middleware, redirecting unauthenticated requests to `/auth/signin`.

### Step 4: Cloudflare R2 Image Upload Pipeline
1. Install `@aws-sdk/client-s3` and configure an S3-compatible client pointing to Cloudflare R2 using credentials extracted from `k-mail`:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME` (or dedicated blog subfolder/bucket)
   - `R2_PUBLIC_URL`
2. Create an authenticated upload endpoint (`/api/upload`) supporting image file types (`png`, `jpg`, `webp`, `gif`, `svg`).
3. Return the public CDN URL upon upload.

### Step 5: Authoring UI & Markdown Editor (`/admin`)
1. **Dashboard (`/admin`)**: Minimalist table showing post list, status pills (`Draft` / `Published`), last modified timestamps, and actions.
2. **Editor (`/admin/new`, `/admin/[id]/edit`)**:
   - Clean, distraction-free authoring screen.
   - Title, custom slug, and summary inputs.
   - Drag-and-drop & file picker integration that directly uploads to Cloudflare R2 and inserts `![alt](r2_public_url)` at cursor.
   - Live Markdown preview toggle.
   - Cover image selector tied to R2 uploader.
   - Save Draft / Publish triggers using Next.js Server Actions with immediate cache revalidation.

### Step 6: Public Reader Experience (`blog.katabolab.com`)
1. **Feed (`/`)**: Chronological list of published posts with dates, reading time estimates, and titles.
2. **Post View (`/[slug]`)**: High-contrast, typography-focused layout with syntax-highlighted code blocks, responsive R2 images, and clean back-links.
3. **Syndication**: Dynamic `/feed.xml` (RSS) and `/sitemap.xml`.

### Step 7: Deployment & DNS Routing
1. Create a dedicated Vercel project linked to the blog repository.
2. Add custom domain `blog.katabolab.com`.
3. Add CNAME record to DNS provider: `blog` -> `cname.vercel-dns.com`.
4. Configure all environment variables in Vercel.

---

## 5. Risks & Unknowns

1. **R2 Public Access**: Verify whether the existing R2 bucket in `k-mail` has public read access via a custom domain (e.g., `media.katabolab.com`) or if a dedicated public bucket should be created for blog assets.
2. **Resend Sending Domain**: Verify that the sending domain configured in Resend matches `katabolab.com` (e.g., `auth@katabolab.com` or `login@mail.katabolab.com`) to ensure high email deliverability.

---

## 6. Validation Checklist

- [ ] Existing `katabolab.com` and `mail.katabolab.com` continue running without interruption.
- [ ] New `katabo_blog` database exists on Neon without modifying any `k-mail` schemas.
- [ ] Entering an unauthorized email rejects the login request without sending a link.
- [ ] Authorized email receives a magic link sent via Resend and authenticates into `/admin`.
- [ ] Image uploaded in the editor uploads to Cloudflare R2 and returns a publicly viewable URL.
- [ ] Draft posts return 404 on the public route until published.
- [ ] `blog.katabolab.com` resolves with active SSL/TLS and displays published posts.
