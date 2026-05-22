# ERISHOT Project Documentation

## 1. Project Overview

ERISHOT is a cinematic photography and videography portfolio site with an admin portal.

The public site has:

- Homepage with hero video, featured work, fragments/gallery preview, story teller section, ratings, and footer.
- Portfolio page with category previews, category filtering, project lightbox, and ratings.
- Contact page with a database-driven image, category-driven service dropdown, social links, and contact form.

The admin portal has:

- Secure email/password login.
- Dashboard with real database counts.
- Upload media.
- Manage projects.
- Control Home.
- Messages with unread notifications and reply-by-email links.
- Settings for logo, contact channels, and display name.
- Logout/session handling.

## 2. Folder Structure

```txt
src/app
```

Next.js route files. These connect URLs like `/`, `/portfolio`, `/contact`, `/admin`, and API routes to the frontend/backend code.

```txt
src/frontend
```

React components and static frontend content. Most visual UI lives here.

```txt
src/backend
```

Server-only logic: Prisma database calls, admin auth, validation, public content loading, and admin store functions.

```txt
src/shared
```

Types and default settings shared between frontend and backend.

```txt
prisma
```

Database schema for PostgreSQL.

```txt
public
```

Public files served by the website, including images, uploaded media, and the hero video.

## 3. Important Public Routes

`/`

Homepage. Uses `src/app/page.tsx`, `HeroSection`, `FeaturedProjects`, `GalleryPreview`, `AboutPreview`, ratings, and footer.

`/portfolio`

Portfolio archive. Shows 1-2 images per category in the `All` view, then `View More` opens that category.

`/contact`

Contact page. Pulls its hero/contact image from the database and uses live portfolio categories as service options.

`/admin`

Admin portal. Requires email/password login.

## 4. Important API Routes

`POST /api/admin/login`

Checks admin email/password, creates a secure session cookie, and returns admin data.

`GET /api/admin/session`

Checks whether the admin session cookie is valid.

`POST /api/admin/logout`

Clears the admin session cookie.

`POST /api/admin/media`

Uploads a media file and creates a draft project/media record.

`PATCH /api/admin/projects/[projectId]`

Changes project status.

`PATCH /api/admin/messages/[messageId]`

Changes message status.

`PATCH /api/admin/settings`

Saves logo/contact/homepage settings.

`POST /api/contact`

Saves contact form messages.

`POST /api/portfolio/reviews`

Saves portfolio ratings/comments.

## 5. Database

The project uses PostgreSQL through Prisma.

Recommended database name:

```txt
erishot
```

Main tables:

- `admin_users`: admin email and password hash.
- `projects`: portfolio/admin project records.
- `media_assets`: uploaded media attached to projects.
- `contact_messages`: messages from the contact form.
- `portfolio_reviews`: public ratings/comments.
- `site_settings`: homepage/logo/contact settings.

The app reads live public portfolio data from the database. If the database is unavailable, some public areas use fallback static content so the site does not fully collapse.

## 6. Environment Variables

Next.js loads `.env.local` before `.env`. That means if the same variable exists in both files, `.env.local` wins.

Required variables:

```env
DATABASE_URL="pooled Supabase/PostgreSQL connection string"
DIRECT_URL="direct Supabase/PostgreSQL connection string"
ADMIN_EMAIL="admin@erishot.com"
ADMIN_PASSWORD_HASH="bcrypt password hash"
ADMIN_SESSION_SECRET="long random secret"
```

Important:

- Login uses the plain password, not the hash.
- The app now accepts bcrypt hashes with either raw `$` or escaped `\$`.
- Keep `.env.local` and `.env` aligned during local development.
- Never commit real secrets to GitHub.

To create a new admin password hash:

```bash
npm run hash:admin-password -- "your new password"
```

Paste the generated `ADMIN_PASSWORD_HASH=...` into `.env.local` and `.env`.

To verify a login locally:

```bash
npm run verify:admin-login -- admin@erishot.com "your plain password"
```

## 7. Admin Login Logic

File:

```txt
src/backend/admin-auth.ts
```

Logic:

1. User submits email/password in `/admin`.
2. Server compares submitted email with `ADMIN_EMAIL`.
3. Server normalizes `ADMIN_PASSWORD_HASH`.
4. Server upserts the admin user into the database.
5. Server runs `bcrypt.compare(plainPassword, passwordHash)`.
6. If valid, server creates an HTTP-only session cookie.
7. Admin pages use that cookie for session persistence.

Session cookie:

```txt
erishot_admin_session
```

The session lasts 8 hours.

## 8. Logo System

Current default logo:

```txt
public/images/erishot-logo-transparent.png
```

The navbar uses this through site settings:

```txt
settings.branding.logoUrl
```

Admin path:

```txt
Admin -> Settings -> Brand & Contact -> Logo image URL
```

To change the logo:

1. Put the new logo in `public/images`.
2. Use a path like `/images/new-logo.png`.
3. Save that path in Admin Settings.

The current transparent logo was generated from the supplied JPG by removing near-black background pixels and saving a PNG with alpha transparency.

## 9. Homepage Logic

Homepage file:

```txt
src/app/page.tsx
```

Main sections:

- `Navbar`
- `HeroSection`
- `FeaturedProjects`
- `CreativeStatement`
- `GalleryPreview`
- `AboutPreview`
- `Testimonials`
- `CTASection`
- `RatingComments`
- `Footer`

Hero video:

```txt
public/videos/erishot-hero.mp4
```

The hero subtitle is gold so it matches the logo.

Fragments:

The fragment section pulls one image from each live category, instead of only the first few projects.

Story Teller:

Current image:

```txt
public/images/storyteller.jpg
```

## 10. Portfolio Logic

Portfolio file:

```txt
src/app/portfolio/page.tsx
```

The `All` view:

- Groups projects by category.
- Shows 1-2 images per category.
- Adds `View More`.
- Clicking `View More` switches to that category.

Category view:

- Shows all projects in that category.
- Allows opening each project in the lightbox.

## 11. Contact Logic

Contact file:

```txt
src/app/contact/page.tsx
```

The contact page:

- Uses a database project image, preferring `Street`.
- Uses live portfolio categories as service dropdown options.
- Saves messages to the database.
- Shows email-format validation above the email input.

## 12. Media Uploads

Uploaded files are saved in:

```txt
public/uploads/admin
```

Admin upload creates:

- A project record.
- A media asset record.
- A public URL for the file.

New uploads start as `Draft`. To show them publicly, move them to `Published` or `Featured` in Admin.

## 13. Ratings

Ratings are stored in:

```txt
portfolio_reviews
```

Only the 3 most recent ratings/comments are shown publicly. The average rating still uses database review aggregation.

## 14. Local Development

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npm run db:generate
```

Push schema to database:

```bash
npm run db:push
```

Start dev server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Useful checks:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

## 15. Hosting With Vercel

Recommended hosting:

- Frontend/backend: Vercel
- Database: Supabase PostgreSQL
- Media: For small projects, local `public/uploads` works in development only. For production, use Supabase Storage, S3, or another file storage service.

Steps:

1. Push the project to GitHub.
2. Create a Vercel project from the GitHub repo.
3. Add environment variables in Vercel:

```env
DATABASE_URL="pooled database URL"
DIRECT_URL="direct database URL"
ADMIN_EMAIL="admin email"
ADMIN_PASSWORD_HASH="bcrypt hash"
ADMIN_SESSION_SECRET="long random secret"
```

4. In Supabase, confirm the database is reachable.
5. Run locally before deploying:

```bash
npm run db:push
npm run build
```

6. Deploy from Vercel.

7. After deploy, test:

```txt
/ 
/portfolio
/contact
/admin
```

## 16. Production Media Note

Files saved to `public/uploads/admin` are reliable locally, but Vercel deployments are immutable. That means uploads made at runtime will not be permanent on Vercel.

For real production uploads, move uploaded media storage to:

- Supabase Storage
- AWS S3
- Cloudinary
- UploadThing

The database can keep the media URL either way.

## 17. Troubleshooting

Admin login fails:

- Check that `.env.local` and `.env` have the same `ADMIN_EMAIL`.
- Check that `ADMIN_PASSWORD_HASH` is a valid bcrypt hash.
- Restart `npm run dev` after changing env files.
- Login with the plain password, not the hash.
- Run:

```bash
npm run verify:admin-login -- admin@erishot.com "plain password"
```

Database error:

- Confirm `DATABASE_URL` points to the pooled Supabase URL.
- Confirm `DIRECT_URL` points to the direct Supabase URL.
- If TLS errors appear locally, keep your Supabase connection string options consistent with the working local setup.

Images not showing:

- Confirm the file exists in `public/images` or `public/uploads/admin`.
- Public paths must start with `/`, for example `/images/storyteller.jpg`.

Changes not showing:

- Restart the dev server.
- Clear browser cache if needed.
- Check that settings were saved in Admin.

