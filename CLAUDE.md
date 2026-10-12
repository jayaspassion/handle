@AGENTS.md
# Handle: rules for Claude

Read PROJECT_NOTES.md first. It is the source of truth for the stack, patterns, design system, roadmap and troubleshooting.

## How to answer
- Keep answers short, simple and clear.
- For small changes, edit the files directly and summarize what changed.
- For big files, name the exact section and what changed rather than pasting the whole file.
- End each task with a numbered test checklist for me, and the git commit command or commit.
- Minimize token use: don't re-read files you don't need, and don't dump large outputs.

## Safety
- Never read, print or ask for `.env` files or any keys or secrets.
- Never run commands against production: no `prisma migrate deploy`, no prod database URLs. I run production migrations by hand.
- Dev database only. Prod host contains `aged-hat`; dev contains `morning-band`. If a URL looks like prod, stop and ask.
- Never push to `main` directly. Work on a feature branch and ask me before merging.
- Ask before anything hard to undo: deleting files, resetting git, schema changes, dependency upgrades.

## Before every commit
Run: `npx tsc --noEmit && npm run lint && npm run build`
Fix errors before committing. Do not add Co-Authored-By or other attribution lines to commit messages.

## Code patterns (details in PROJECT_NOTES.md)
- Server Actions: `auth()` -> zod validation -> ownership check inside the Prisma query -> write -> `revalidatePath`.
- `getPublishedProfile()` is the only place that decides what is public.
- Uploaded file URLs must pass `isUploadedFileUrl`; use `deleteUploadedFile` for cleanup.
- Use the existing design tokens (`--pf-*`) and shared classes (`.btn .card .panel .chip .input .badge`). Don't add new colors or one-off styles.
- Schema changes: create a migration with `prisma migrate dev` on dev only, and tell me so I can run it on production myself.

## Environment
- Mac, zsh. Quote paths that contain brackets, e.g. `"app/[username]/page.tsx"`.
- Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Prisma 7 with Neon, Clerk, UploadThing.
- ngrok is needed only to create or delete dev users locally, because the dev Clerk webhook must point at it.