# Handle: Project Notes

Single source of truth for the project. Keep it updated after every step.
Contains NO secrets (never paste keys, tokens or full database URLs here).
Last updated: October 2026 (after the reordering release)

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
lib/uploadthing.ts  lib/uploads.ts  lib/uploads-server.ts
lib/sections.ts   (section keys, labels, resolveSectionOrder)
app/layout.tsx  app/globals.css  app/page.tsx (landing)  app/privacy/page.tsx
app/_components/site-header.tsx      (hidden on /dashboard)
app/_components/theme-toggle.tsx     (3 small icons: system / light / dark)
app/_components/projects-carousel.tsx (ProjectsSection: panel + sliding row)
app/generated/prisma/                (generated; npx prisma generate)
app/api/webhooks/clerk/route.ts
app/api/uploadthing/core.ts  route.ts   (avatar, resume, projectImage)
app/[username]/page.tsx  not-found.tsx  opengraph-image.tsx
app/dashboard/page.tsx
app/dashboard/_components/
  dashboard-nav.tsx (sidebar)  dashboard-section.tsx (collapsible card)
  profile-completion.tsx  add-panel.tsx  month-picker.tsx
  sortable-list.tsx  reorder-panel.tsx  section-order-card.tsx
app/dashboard/_actions/reorder.ts   (reorderItems, saveSectionOrder)
app/dashboard/_sections/profile/{actions.ts,form.tsx,section.tsx,uploads.tsx}
app/dashboard/_sections/publish/{actions.ts,section.tsx}
app/dashboard/_sections/skills/{actions.ts,section.tsx}   (chips, grouped)
app/dashboard/_sections/{experience,education,projects,certifications,
  testimonials,links}/{actions.ts,form.tsx,item.tsx,list.tsx}
```
Dashboard order: Overview (header), Profile details, then Links, Projects,
Experience, Education, Skills, Certifications, Testimonials. Publication and
Profile completion live in a right-hand column on wide screens.
Public page order: Intro, Projects (sliding row), Experience, Skills,
Testimonials, Education + Certifications (one box), closing links band.
(Also present, from prisma init: .agents/ .claude/ .windsurf/ skills-lock.json)

---

## 8. Database (9 tables)

User(clerkId unique, email unique, tier FREE|PRO), Profile(userId unique,
username? unique, fullName?, headline?, bio?, avatarUrl?, location?,
resumeUrl?, isPublished, sectionOrder String[], colorMode?, theme?, font?,
openToWork Boolean default false), Experience, Education (both
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
- SEO: `app/robots.ts` (blocks /dashboard and /api/), `app/sitemap.ts`
  (landing, /privacy, published profiles via `listPublishedProfiles()` in
  lib/public-profile.ts; built per request), canonical tags on /, /privacy and
  /<username>. All URLs use `SITE_URL` from lib/url.ts (the www address).
  Search Console "Page with redirect" for the apex domain, http:// and
  /dashboard is expected.
- Theme: CSS tokens + `light-dark()` in globals.css. Light is the default:
  `<html data-theme="light">`, and an inline head script applies the saved
  choice from localStorage key `handle-theme` ("light" | "dark" | "system";
  "system" removes `data-theme`). Shared helpers in
  `app/_components/color-mode.ts`. Toggle in the global header. Dashboard dark
  mode works by remapping Tailwind palette vars in `:root`.
- Appearance (Stage A): `lib/appearance.ts` holds the ONLY allowed ids (8
  themes, 4 font pairs, 3 modes); DB values are resolved against it in
  `getPublishedProfile()` and the dashboard. Theme colors are
  `[data-pf-theme="<id>"]` blocks in globals.css overriding `--pf-*`; fonts are
  `--pf-font-heading` / `--pf-font-body` overridden by `[data-pf-font]` (extra
  fonts in `lib/fonts.ts`, not preloaded, variables on `<html>`).
- Mode sync: signed-in toggle also saves `Profile.colorMode`
  (`app/_actions/color-mode.ts`); the dashboard applies the account mode on
  load (`AccountColorMode`). On a public page the owner's mode is the default
  unless the visitor saved their own; theme + font are also put on `<html>` so
  the site header matches (inline first-paint script + `OwnerAppearance`,
  removed when leaving the page).
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
- Deleting an account also deletes its UploadThing files (`user.deleted`
  webhook, `deleteUploadedFile`, which skips files still referenced elsewhere).

---

## 10. Status

LIVE at https://www.handleprofile.tech: auth + webhook sync, dashboard (all
sections), publish flow with live username check, public page, photo / resume /
project-image uploads (resized in the browser), landing page, privacy page,
"Editorial lavender" redesign (light + dark), collapsible dashboard sections,
skills as grouped chips, Education location + GPA (free text), projects as a
sliding row with the image on the left, long experience descriptions collapsed
behind "Show details", reordering ("Reorder" panel for Links, Projects,
Certifications and Testimonials with mouse drag + up/down buttons, and a "Page
order" card; the public page follows `Profile.sectionOrder`, and
`lib/sections.ts` treats the old untouched default as "not set";
Experience/Education stay in date order, skills stay grouped by category),
UploadThing file cleanup when an account is deleted.

Database changes so far: Education.location and Education.gpa (migration
`education_location_gpa`, applied to handle-prod). Profile.colorMode, theme,
font, openToWork (migration `appearance_open_to_work`, dev only until the
themes release).

KNOWN GAPS (fine to ship):
- An image uploaded in a project form that is then cancelled stays orphaned.
- Clerk sign-in popups do not follow our theme yet.
- Password minimum in Clerk is 8 (consider 10+).
- No analytics or error monitoring besides Vercel logs.

---

## 11. Roadmap

Next, in this order:
1. Release themes + font picker + saved mode + "Open to opportunities" (built,
   needs the production migration `appearance_open_to_work`).
2. Layout templates ("Stage B", section 16; design together before building).
3. Optional polish: empty states with icon + hint, spinner on Saving/Uploading
   buttons, 44px minimum for small buttons, a separate "role/tagline" field,
   nav links on the public page.

Bigger features (design together before building):
4. Messaging (login required; inbox; optional email via Resend; spam limits)
5. Chatbot on public page (login required, streaming, rate limits, prompt
   injection defenses; treat profile text as untrusted data)
6. Resume autofill (needs an AI API; suggestions only, reviewed by the user;
   after the chatbot, they share groundwork)
7. Analytics, Stripe test mode (templates could be a PRO feature)

Parked (not planned for now): Clerk popups in our theme (Clerk appearance
options).

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
- Redesign (Editorial lavender): fonts, tokens, public page, dashboard shell,
  section cards, landing page, site header
- Polish batches: dirty-aware Save button, sidebar highlight, collapsible
  sections, skill chips, live username check, Education location/GPA,
  project images + sliding row, compact boxed public page
- Reordering (list items + public page section order) and UploadThing file
  cleanup on account deletion
- Public page: hero photo is a fixed 4:5 portrait (cropped on display; files
  keep their original shape), top-aligned with the name; smaller bio,
  project and education description text
- Light mode is the default (was: follow the system); the visitor's choice is
  saved in the browser
- Compact landing page: fits one screen on phones (down to 375x667) and
  laptops (1280x720); hero, 3 feature lines, 3 steps, preview card styled like
  the public page (desktop only)
- Dashboard on phones: no sideways scrolling (content grid is
  `minmax(0,1fr)`), sticky section tabs that keep the active tab in view,
  Edit/Delete buttons under each item, shorter "Public page" button
- "résumé" spelled "resume" everywhere in the UI
- SEO basics: robots.txt, sitemap.xml, canonical tags
- Stage A: 8 color themes, 4 font pairs, light/dark saved to the account and
  used as the public page default, "Open to opportunities" badge

---

## 14. Troubleshooting log (things that bit us)

- `prisma migrate dev` said "Drift detected ... reset the schema": the dev
  database had tables but no migration history. Fix (no data loss): mark the
  two old migrations as applied with `prisma migrate resolve --applied <name>`
  using the DIRECT dev URL, then run `migrate dev` again. Never run
  `migrate reset` on a database you care about.
- Always confirm the host before a migration: dev is `morning-band`, prod is
  `aged-hat`.
- Webhook failing with no POST in Vercel logs: the webhook URL must be the
  `www` address (the apex domain redirects and senders do not follow it).
- Clerk 400s on `*.vercel.app`: expected. Use the real domain.
- Local sign-up of a NEW dev user needs ngrok + the dev Clerk webhook pointed
  at the current ngrok address (it changes on every restart). Signing in with
  an existing dev account does not need ngrok.
- zsh: quote globs (`--include="*.tsx"`) and bracket paths.

---

## 15. Design system (Editorial lavender)

- Fonts: Georgia (serif, headings via `font-serif`) + Inter (body).
- Colors (light / dark): background #FAF8F5 / #17121D, surface #FFFFFF /
  #231B2A, ink #281331 / #F6F0FA, muted #6E6677 / #BBAFC6, primary #3D2145 /
  #D4B9EF, border #E7E0E9 / #403249, brand (decoration) #9975CA / #B99BE0.
- Tokens live in app/globals.css as `--pf-*` (+ `pf-*` Tailwind colors). The
  dashboard remaps old Tailwind gray/purple/red/green vars to the same palette.
- Radii: panel 6px (`.panel`), cards `--radius-card` 12px (0.75rem), buttons and chips `--radius-btn` 6px, inputs `--radius-input` 8px.
- Shared classes: `.btn` (+ `-primary -outline -danger -sm`), `.card`
  (+ `.card-accent`), `.panel` (very subtle section box), `.chip`, `.input`,
  `.badge`, `.msg-success`, `.msg-error`, `.field-error`, `.eyebrow`.
- Public page boxes overlap by 1px (`-mt-px`) so borders merge; print removes
  boxes and shows full experience text.
- Accessibility rules we keep: visible focus outlines, labels tied to inputs,
  `role="status"`/`"alert"` messages, aria-expanded on collapsibles, 40-44px
  tap targets, never colour alone for meaning.

---

## 16. Themes and templates (Stage A built; Stage B planned)

Stage A as built: themes Lavender (default), Sky, Cobalt, Blush, Sage, Ocean,
Sunset, Mono; fonts Editorial (default: Georgia + Inter), Modern sans (Plus
Jakarta Sans), Classic serif (Playfair Display + Source Sans 3), Tech (Space
Grotesk + Inter). Dashboard "Appearance" card with live preview, "Open to
opportunities" card. Original plan below.

Stage A, color themes: a handful of palettes (for example Lavender, Sage,
Ocean, Sunset, Mono), each with a light and a dark version. One new nullable
text column `Profile.theme`, validated against a fixed allowlist (never
user-written CSS). The public page wrapper (`.profile-theme`) overrides the
`--pf-*` tokens by a `data-` attribute. The link-preview image (opengraph) picks
up the theme accent. Dashboard gets a theme picker. Needs a production migration
before release (nullable column, same procedure as Education).

Stage A also adds a font picker: a fixed list of 4-5 font pairings (for example
Editorial = Georgia + Inter as today, Modern sans, Classic serif, Mono/tech),
loaded with `next/font`. Separate nullable column `Profile.font`, validated
against the allowlist, added in the SAME migration as `Profile.theme` (one
production migration). The public page wrapper switches font variables by a
`data-` attribute, like themes.

Stage B, layout templates: a second column `Profile.template` plus one renderer
per layout (for example Classic = today, single-column Resume, Sidebar). All
renderers use the same data from `getPublishedProfile()` (the only place that
decides what is public) and all honor `sectionOrder`.

Possible PRO gating later: one free default, extra themes/templates for PRO.

---

## 17. Working in Claude Code (desktop app, Code tab, Local session)

- Put the working rules in CLAUDE.md (read PROJECT_NOTES.md first; minimal
  changes; run `npx tsc --noEmit` and `npm run lint`; end with a test
  checklist; feature branches only; never touch .env, never run migrations or
  anything against production, never `migrate reset`, never `npm audit fix`).
- Keep Manual permission mode until trust is built; use Plan mode for big
  features; review diffs before committing; one fresh session per task.
- Production migrations are always run by hand (direct handle-prod URL, host
  must contain `aged-hat`; dev host contains `morning-band`).

## 18. Current status and next steps (handoff)

### Recently released
- Reordering: drag and up/down buttons for links, projects, certifications and testimonials, plus section order on the public page.
- Account-deletion cleanup: the Clerk `user.deleted` webhook now deletes the user's avatar, resume and project images from UploadThing.
- No database change, so no migration. Run the live checks on https://www.handleprofile.tech if not done yet.

### Next tasks, in order
1. Release Stage A (built on `feature/themes`): themes, font pairs, light/dark saved to the account (also the public page default), "Open to opportunities" badge. Run the production migration `appearance_open_to_work` by hand, then merge.
2. Layout templates, Stage B, after the themes work.
3. Optional polish:
   - Empty states with an icon and an add button.
   - Spinners on Saving/Uploading.
   - 44px minimum size for small buttons.
   - A separate role/tagline field.
   - Nav links on the public page.
4. Later features, in order: messaging, AI chatbot, resume autofill (after the chatbot), Stripe FREE/PRO.

Parked, not planned for now: Clerk popups styled to match the theme.

### Known gaps
- An uploaded image stays orphaned if a project form upload is cancelled before saving.
- Deleting a cancelled project upload needs proof of who uploaded the file (otherwise anyone could delete a fresh upload); design before building.

### Open decisions
- Which plan tier gets which themes and templates (decide when Stripe is added).

### Working preferences
- Short, simple answers.
- Small changes are shown inline; large files get exact sections.
- Every task ends with a numbered test checklist and a commit.
- Never touch production or `.env` files.