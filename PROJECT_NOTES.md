# Handle: Project Notes

Single source of truth for the project. Keep it updated after every step.
Contains NO secrets (never paste keys, tokens or full database URLs here).
Last updated: 9 Oct 2026

---

## 0. How to use this file with an AI chat (paste this part first)

READ FIRST - HOW TO WORK WITH ME
- You have NOT seen my code. Before editing any existing file, ask me to run
  `cat <path>` and paste it. Never assume a file's contents. Never ask for
  .env values or any keys (variable NAMES are fine).
- Files you have never seen: ask for them first.
- Keep it minimal on tokens. For EXISTING files give: file path, the exact old
  text to find, approximate line numbers, and the replacement. No full-file
  rewrites. For NEW files give full code, preceded by a mkdir/touch script.
- Short, clear explanations. End each step with a brief numbered test
  checklist and a git commit command. Multiple steps together are fine when
  they don't depend on each other.
- Be honest when unsure. Check docs or say so instead of guessing at APIs.
- Mac, zsh. Quote paths containing brackets: "app/[username]/page.tsx".
- I'm a frontend-leaning developer returning to work after a Master's.
  Explain unfamiliar steps plainly, one at a time.

---

## 1. What this is

Handle: multi-tenant portfolio platform. Anyone signs up, builds a portfolio,
and shares a public page at `https://www.handleprofile.tech/<username>`.
Planned: AI chatbot per page, user-to-user messaging, FREE/PRO with Stripe.
Portfolio project, free tiers wherever possible.

- Repo: github.com/jayaspassion/handle
- Live site: https://www.handleprofile.tech (canonical)
- The plain `handleprofile.tech` redirects (308) to `www`. Always use `www`.
- Editor: Cursor. Rules file: `.cursor/rules/project.mdc`

---

## 2. Stack

Next.js 16.3.6 (App Router, Turbopack), React 19, TypeScript, Tailwind v4,
Node 24 LTS, PostgreSQL on Neon, Prisma 7.10.0 with driver adapter
(`@prisma/adapter-pg`), config `prisma7.config.ts`, client generated to
`app/generated/prisma`, Clerk (`@clerk/nextjs` 7.9.9), zod, svix 1.75.0
(pinned; 2.6.1 broke verification), UploadThing (`uploadthing`,
`@uploadthing/react`), hosting on Vercel.

Ignore the "Prisma 8 rc" update notice. Don't upgrade mid-project.

---

## 3. Environments: DEV vs PRODUCTION (most important section)

Two completely separate worlds. They share only the code (through git).

| | DEV (your Mac, `npm run dev`) | PRODUCTION (live site) |
|---|---|---|
| Where settings live | local `.env` file | Vercel > Settings > Environment Variables |
| Database | Neon dev project/database | Neon project **handle-prod** |
| Clerk | Development instance | Production instance (`pk_live_` / `sk_live_` keys) |
| Clerk webhook | ngrok URL -> localhost | `https://www.handleprofile.tech/api/webhooks/clerk` |
| Users | dev test users | real users (dev accounts do NOT exist here) |
| Google sign-in | Clerk's shared dev credentials | our own Google Cloud OAuth client |

Rules:
- Never put production keys in the local `.env`.
- Never run `prisma migrate dev` against the production database.
- Test auth ONLY on `https://www.handleprofile.tech`. The `*.vercel.app`
  address shows Clerk 400 errors (production keys only work on our domain).
  That is expected, not a bug.

### Environment variable names (values are never stored here)

| Variable | Type in Vercel | Environment in Vercel |
|---|---|---|
| `DATABASE_URL` | Secret | Production only |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Config | Production only |
| `CLERK_SECRET_KEY` | Secret | Production only |
| `CLERK_WEBHOOK_SECRET` | Secret | Production only |
| `NEXT_PUBLIC_SITE_URL` (= `https://www.handleprofile.tech`) | Config | Production only |
| `UPLOADTHING_TOKEN` | Secret | Production only |

- Preview is deliberately left empty so a test deployment can never touch the
  production database or users.
- Vercel hides Secret values after saving (blank in the list is normal).
- **Changing an env var needs a manual Redeploy** (Deployments > latest > ... >
  Redeploy). Code pushes to `main` deploy automatically.
- Local `.env` has the same variable NAMES (dev values).
- After `.env` or CSS-token changes locally, restart `npm run dev`.

### Database connection strings (Neon)
- **Pooled** string (host contains `-pooler`): used by the live app (Vercel).
- **Direct** string (no `-pooler`): used only for running migrations.
- Both must end with `?sslmode=verify-full` (Neon's default ending is
  `?sslmode=require&channel_binding=require`; our commands replace it).

---

## 4. Services and accounts checklist

| Service | What it does | Notes |
|---|---|---|
| Domain `handleprofile.tech` | our address | GitHub Student Pack. First year free; renewal is paid. DNS managed at: ______ (fill in) |
| Vercel | hosting | auto-deploys `main`. Node version set to 24.x |
| Neon (dev) | dev database | existing project |
| Neon (`handle-prod`) | production database | separate project |
| Clerk (dev + production) | auth | production has CNAME records at the domain's DNS (verified) |
| Google Cloud project | Google sign-in for production | OAuth client; consent screen External, published to production; Branding uses `/privacy` page |
| UploadThing | photo/resume storage | same token in dev and prod for now (consider a separate app later) |
| Svix (inside Clerk) | webhook delivery log | Webhooks > endpoint > Message attempts |

---

## 5. Everyday workflow

### Develop a feature (never straight on `main`)
```bash
git checkout -b feature/<name>
# code + test locally with npm run dev
git add -A && git commit -m "<message>"
git push -u origin feature/<name>     # does NOT go live
```
Go live when tested:
```bash
git checkout main
git merge feature/<name>
git push                               # Vercel deploys this to production
```
Pushing a branch triggers a Vercel preview build that will likely fail
(Preview env vars are empty on purpose). Ignore it; test locally.

### Before every push
```bash
npm run build
npm run lint
npx tsc --noEmit
```
`npm run build` only checks the code on your Mac; it does not deploy.

### Database schema changes (production does NOT update itself)
1. Edit `prisma/schema.prisma`
2. Local: `npx prisma migrate dev`, then `npx prisma generate`, then restart
   `npm run dev`
3. Commit and push the code (including `prisma/migrations/`)
4. Apply to production (copy the **direct** string from Neon with Connection
   pooling OFF, then paste at the prompt):
   ```bash
   read -s "PROD_URL?Paste DIRECT prod URL: "; echo
   PROD_URL="${PROD_URL%%\?*}?sslmode=verify-full"
   DATABASE_URL="$PROD_URL" npx prisma migrate deploy --config prisma7.config.ts
   DATABASE_URL="$PROD_URL" npx prisma migrate status --config prisma7.config.ts
   unset PROD_URL
   ```
   Do this right before or right after the code goes live.
5. Check Neon > handle-prod > Tables.

### Rotate/replace the production DATABASE_URL in Vercel
Neon > Connect > Connection pooling ON > Copy snippet, then:
```bash
read -s "P?Paste POOLED prod URL: "; echo
printf '%s' "${P%%\?*}?sslmode=verify-full" | pbcopy; unset P
```
Paste into Vercel (Production only), Save, then Redeploy.

### Gotchas
- Never run `npm audit fix` (it changed the Prisma version once).
- Never use `prisma migrate dev` or `migrate reset` on production.
- The "N" button in the corner is the Next.js dev indicator (dev only).
- The pg SSL warning in Vercel logs is only a notice; `verify-full` is correct.
- Random bot requests (`/wp-admin/...`) in logs are harmless.

---

## 6. Webhook (Clerk -> our database)

- Endpoint: `https://www.handleprofile.tech/api/webhooks/clerk`
- Events: `user.created`, `user.deleted`
- MUST use the `www` URL. The apex domain redirects (308) and webhook senders
  do not follow redirects. This caused the "Setting up your account" problem.
- `user.created` creates User + empty Profile (ignores stale retries by
  checking Clerk; clears leftover same-email rows only if the old Clerk
  account is gone). `user.deleted` hard-deletes (cascades to everything).
- Signing secret goes in Vercel as `CLERK_WEBHOOK_SECRET`.
- If a user shows "Setting up your account. Refresh in a moment." the webhook
  failed: check Clerk > Webhooks > Message attempts, and Vercel > Logs (search
  `webhooks`). Fix, then **Replay** the message (don't re-sign-up).
- Local testing needs ngrok and a dev webhook endpoint.

---

## 7. Project structure

```
.cursor/rules/project.mdc
AGENTS.md  next.config.ts  package.json  proxy.ts  prisma7.config.ts
PROJECT_NOTES.md
prisma/schema.prisma  prisma/migrations/
lib/prisma.ts  lib/url.ts  lib/public-profile.ts
lib/uploadthing.ts  lib/uploads.ts
app/layout.tsx  app/globals.css  app/page.tsx (landing)
app/privacy/page.tsx
app/_components/theme-toggle.tsx
app/generated/prisma/            (generated; npx prisma generate)
app/api/webhooks/clerk/route.ts
app/api/uploadthing/core.ts  route.ts
app/[username]/page.tsx  not-found.tsx  opengraph-image.tsx
app/dashboard/page.tsx
app/dashboard/_components/add-panel.tsx  month-picker.tsx
app/dashboard/_sections/profile/{actions.ts,form.tsx,section.tsx,uploads.tsx}
app/dashboard/_sections/publish/{actions.ts,section.tsx}
app/dashboard/_sections/{experience,education,projects,skills,
  certifications,testimonials,links}/{actions.ts,form.tsx,item.tsx,list.tsx}
```
Dashboard order: Publish, Profile, Links, Experience, Education, Projects,
Skills, Certifications, Testimonials.
(Also present, from prisma init: .agents/ .claude/ .windsurf/ skills-lock.json)

---

## 8. Database (9 tables)

User(clerkId unique, email unique, tier FREE|PRO), Profile(userId unique,
username? unique, fullName?, headline?, bio?, avatarUrl?, location?,
resumeUrl?, isPublished, sectionOrder String[]), Experience, Education (both
sorted by startDate desc, no order field), Project(tags String[], order),
Skill(order), Certification(order), Testimonial(order), Link(order).
Everything cascades from Profile.

---

## 9. Key patterns (follow these)

- Server Actions: `auth()` -> zod validate -> ownership check INSIDE the Prisma
  query (`where: { id, profile: { user: { clerkId } } }`) -> write ->
  `revalidatePath`. Never trust IDs from forms. updateMany/deleteMany + count.
- One form handles add and edit via hidden "id". Forms are client components
  using `useActionState`; ids via `useId()`; errors with `aria-describedby`;
  `role="status"/"alert"` messages; focus moves on open/close.
- New list items go to the end (order = max+1). Per-profile caps exist.
- URLs: `lib/url.ts` isHttpUrl/normalizeUrl; only http/https; re-checked at
  render. External links use `rel="nofollow ugc noopener noreferrer"`.
- `lib/public-profile.ts` `getPublishedProfile()` is the ONLY place deciding
  what is public (never email/clerkId/tier). avatarUrl/resumeUrl are returned
  only if they pass `isUploadedFileUrl` (https, host ends `.ufs.sh`, path
  starts `/f/`). Never arbitrary user-supplied image URLs.
- Public page: unpublished == nonexistent (same 404). Username lowercase.
- Theme: CSS tokens + `light-dark()` in globals.css; `data-theme` on `<html>`
  set by an inline head script from localStorage key `handle-theme`; toggle in
  the global header. Dashboard dark mode works by remapping Tailwind palette
  vars in `:root`.
- Publish: username 3-30 chars, `[a-z0-9]` with single hyphens, reserved-name
  list, DB unique is the final check, locked while published, needs a name.
- Auth: `proxy.ts` is just `clerkMiddleware()` (deprecated createRouteMatcher
  removed). Protection is checked in the dashboard page, every Server Action
  and the UploadThing middleware.

### Uploads (UploadThing)
- File router `app/api/uploadthing/core.ts`: `avatar` (JPG/PNG/WebP, 2 MB) and
  `resume` (PDF, 4 MB), signed-in users only; `onUploadComplete` saves
  `file.ufsUrl` to the profile and deletes the previous file (delete failures
  are ignored so uploads never break).
- Photos are resized in the browser (max 800px, WebP) before upload.
  PDFs are not resized; over 4 MB shows an error.
- KNOWN GAP: deleting an account removes DB rows but NOT the files in
  UploadThing. Add cleanup in the `user.deleted` webhook.

---

## 10. Status

DONE and working: auth + webhook sync, protected dashboard, all 8 sections
add/edit/delete, profile card, publish flow, public page (timeline, cards,
dark mode, OG image, print), theme toggle, photo + resume upload with
auto-resize and old-file cleanup, landing page `/`, privacy page `/privacy`,
deployed to Vercel on own domain, production DB + Clerk production + webhook
(verified: email sign-up, profile save and publish worked in production).

STILL TO VERIFY IN PRODUCTION (tick when done):
- [ ] Photo upload shows on public page
- [ ] Resume upload and public Resume button
- [ ] One item in each section: add / edit / delete
- [ ] Public page signed out: no email anywhere, links open in new tab
- [ ] `/<handle>/opengraph-image` and link preview
- [ ] Unknown / unpublished handle gives the same 404
- [ ] Google sign-up works (no redirect_uri_mismatch / access_denied)
- [ ] Theme + mobile + print
- [ ] Delete a test account: User/Profile rows disappear
- [ ] `NEXT_PUBLIC_SITE_URL` set to the `www` address and redeployed

SMALL TODOs:
- [ ] Replace `YOUR_EMAIL_HERE` in `app/privacy/page.tsx`
- [ ] Fill in where the domain's DNS is managed (section 4)
- [ ] Raise Clerk password minimum (set to 8)
- [ ] Clerk popups don't follow our theme yet (Clerk appearance options)
- [ ] File cleanup on account deletion (section 9)
- [ ] Consider a separate UploadThing app for production

---

## 11. Roadmap

1. Drag-and-drop reordering for items and sectionOrder (stored, not editable)
2. Messaging (login required; inbox; optional email via Resend)
3. Chatbot on public page (login required, streaming, rate limits, prompt
   injection defenses; treat profile text as untrusted data)
4. Themes, analytics, resume parsing, Stripe test mode

---

## 12. Production test checklist (re-run after big changes)

Use `https://www.handleprofile.tech` in an incognito window.
1. Deployment is Ready in Vercel; landing page, `/privacy` load
2. Signed out, `/dashboard` sends you back to `/`
3. Email sign-up -> dashboard shows your email
4. Neon `handle-prod`: User and Profile rows exist
5. Clerk > Webhooks > Message attempts: 200
6. Google sign-up works
7. Profile save, photo, resume, items in every section
8. Publish a handle; public page works signed out; email not shown
9. 404 for unknown/unpublished handle
10. Theme toggle, mobile layout, print preview

Troubleshooting entry points: Vercel > Logs; Clerk > Webhooks > Message
attempts; browser DevTools Console.

---

## 13. Change log

- Added UploadThing uploads (avatar + resume), client-side resize
- Landing page and privacy page
- Removed deprecated createRouteMatcher
- Deployed to Vercel; domain handleprofile.tech; Neon handle-prod; Clerk
  production; Google OAuth; webhook URL moved to the `www` address