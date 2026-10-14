# Pristaine — Next.js migration baseline

This archive is a migration of the supplied Magic Pattern UI from Vite + React Router to Next.js App Router. Existing UI components, styling, hooks, data and media have been reused where possible. This is a migration baseline, not a production-ready launch.

## Run locally

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
npm run dev
```

Validate with:

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

## Included public routes

- `/` — home
- `/about` — current About page
- `/services` — current services overview
- `/book` — current consultation information page (the live Calendly flow remains to be implemented)
- `/privacy` — current privacy/cookie page (the final legal copy still requires owner and legal review)

Legacy route redirects are configured from `/privacy-policy` to `/privacy`, and from `/cookie-policy` to `/privacy#cookies`. The `/spec/*` visual review routes were deliberately not exposed as public routes. Unknown paths return a 404 page.

## Important unfinished work

- Review the `specs/REVIEW-AND-CHANGE-LIST.md` and resolve route and booking differences before adding more features.
- Add individual service pages and full Insights article pages only after their content and UI are approved. The current footer references `/insights`, which is not a published route yet.
- The existing UI uses poster/still images; the supplied hero and CTA videos are preserved but have not been wired into playback.
- Finish the Calendly booking experience, secure contact submission endpoint, server-side persistence, HubSpot sync, and the guarded AI assistant in their spec story order. They are not implemented by this framework migration.
- Replace visible launch placeholders, complete legally reviewed privacy copy, route-specific social images, and the crawler/training-bot policy before production launch.

## Image assets

Public `.webp` versions are used for the service cards, Insights cards, hero poster, and CTA still. Original PNG source images are preserved under `assets-source/` and are not served as public assets.

## Framework decision

Uses Next.js 15.5.27 and React 18 to minimize unrelated dependency changes during migration. Public pages use App Router page modules and per-route metadata. Next.js prerenders Client Components to HTML at build time; verify generated HTML and run the production build before deployment. The project is not configured for static export because the architecture anticipates server-side Route Handlers. The migration has not been dependency-installed or production-built in this environment because npm package-registry access timed out; run the validation commands locally before merging.
