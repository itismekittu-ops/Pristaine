# Pristaine — UI Migration and Spec Alignment Report

**Prepared:** 2026-10-14  
**Scope:** Uploaded Magic Pattern source ZIP plus the supplied Project Constitution, PRD, Architecture, Business Rules, AI Observability & Security, Design, AEO/SEO and `AGENTS.md` files.

## 1. Decision applied in this migration baseline

The source was migrated from Vite + React Router to **Next.js App Router + TypeScript**, because that is the architecture already selected in `02-architecture.md` and required by `AGENTS.md`. The intent is to reuse existing components, styles, hooks and media—not regenerate the UI.

This decision is not based on React or TypeScript being bad for SEO. Vite can also prerender routes when configured for static generation. Next.js was selected here for consistency with the approved architecture and the planned server-side contact, chat and webhook endpoints.

## 2. Observed state of the supplied UI

- The supplied app uses Vite, React, TypeScript and React Router. Its original `index.html` contains an empty React mount point; rendered copy depends on JavaScript.
- Existing routable UI pages are Home (`/`), About (`/about`), Services (`/services`), Booking information (`/book`) and Privacy (`/privacy`). The old `/spec/*` visual review pages are not exposed as public Next routes.
- The service cards point to anchors on `/services` (`/services#conversational-ai`, etc.). Dedicated service detail pages are not in the supplied implementation.
- The homepage has an Insights carousel with six cards, but full `/insights` index and `/insights/[slug]` article pages are not supplied. The current footer and cards still point to those planned paths; those links remain a launch gap until the pages are built or the links are intentionally changed.
- `/book` is currently a content shell, not a fully implemented consent-aware Calendly scheduler.
- `/privacy` includes placeholder wording, so the legal copy must be replaced and reviewed before launch.
- The images and videos are present. The current page uses still/poster assets; the videos are preserved, but playback is not wired into the Hero or CTA in this migration.

## 3. Code changes made

1. Added Next.js App Router entry points for `/`, `/about`, `/services`, `/book`, `/privacy`, a real 404, `sitemap.xml`, `robots.txt`, `/llms.txt` and a route-specific Open Graph image endpoint.
2. Reused the existing UI components, design tokens, styles, animation hooks and content data where compatible. Changed React Router navigation to Next.js navigation and removed the Vite app entry/config from the migrated project.
3. Added route-specific titles, descriptions, canonicals, generated 1200×630 Open Graph/Twitter cards, Organization/WebSite JSON-LD and homepage FAQPage JSON-LD sourced from the same FAQ data shown to visitors.
4. Moved service-card, Insights, hero-poster and CTA-still references to existing `.webp` versions. The 12 corresponding PNG originals are preserved under root `assets-source/`, outside the deployed `public/` directory. The matching PNG set totals 12,833,995 bytes; its 12 WebP counterparts total 397,278 bytes, a 96.9% reduction. There are 15 WebP files in `public/` overall because three additional hero posters already existed only as WebP.
5. Removed the `/spec/*` visual review routes from the public router, removed visible design-review placeholder captions from the affected live sections, and added a custom 404.
6. Added explicit `use client` boundaries to interactive components that use hooks, browser APIs, motion hooks or client event handlers. Fixed initial-render hazards for prerendering: media queries initialize consistently on the server/client, pinned-step viewport state uses a deterministic initial value, scroll tracking starts with a deterministic viewport size, and cookie choices are read from local storage in an effect rather than during render.
7. Added redirects from `/privacy-policy` to `/privacy` and `/cookie-policy` to `/privacy#cookies`. The current source path `/privacy` and the dedicated `/book` page were retained to minimize unnecessary URL and UI changes.
8. Self-hosted Inter and Sora through package imports instead of Google Fonts requests.
9. Updated the working spec copies and placed them under root `/specs/`; `AGENTS.md` is at repository root.

## 4. Spec changes made

| File | Change |
|---|---|
| `00-project-constitution.md` | Updated the legal/booking scope to a Privacy Policy with a Cookies section and a consent-aware `/book` page; added a change-log entry. |
| `01-prd.md` | Distinguished existing UI routes from planned service and Insights pages; aligned the current service slug; updated booking and cookie/legal acceptance criteria; added a change-log entry. |
| `02-architecture.md` | Recorded the actual route inventory, redirects and planned (not implemented) API endpoints; specified the Next.js migration baseline; aligned the booking mechanism; added a change-log entry. |
| `03-business-rules.md` | Aligned booking with `/book`; consolidated cookie-list obligations into `/privacy#cookies`; clarified the footer/legal link behavior and acceptance criteria; added a change-log entry. Legal review is still required. |
| `04-ai-observability-security.md` | No guardrail or security requirements were removed. Its dependency references and version were aligned to the updated upstream spec versions. |
| `05-aeo-seo.md` | Aligned current-route metadata and the `llms.txt` sample with the implemented routes; notes that planned pages must not enter crawl files until published and approved; added a change-log entry. |
| `06-design.md` | Aligned the footer/legal control wording with the single Privacy Policy route and Cookie settings; added a change-log entry. |
| `AGENTS.md` | Clarified that this archive is a migration baseline; updated the stack, booking, chat and CRM status so planned features are not misrepresented as implemented. |

## 5. Route decisions applied

- **Canonical current routes:** `/`, `/about`, `/services`, `/book`, `/privacy`.
- **Compatibility redirects:** `/privacy-policy` → `/privacy`; `/cookie-policy` → `/privacy#cookies`.
- **Service links:** the current service-card and dropdown links remain anchors on `/services` until dedicated service pages and approved page copy exist.
- **Insights:** the six cards remain part of the homepage UI, but full article pages and an Insights index are not implemented in the supplied UI. They must be implemented before treating these links as launch-ready.
- **Review UI:** visual spec/review routes are not registered as public pages in Next.js.

The `/book` and `/privacy` choices follow the names already used in the code and Claude's proposed URL direction. Please confirm those are the desired canonical URLs before production launch; aliases are included to make the alternative spellings easier to support.

## 6. Verification performed and limits

- Relative-source import check: **0 missing relative imports**.
- Runtime image-reference check: **0 missing media assets**; no PNG paths remain in application source.
- Client-boundary scan: all component files using React hooks, browser globals, motion hooks, navigation hooks or client event handlers have an explicit client boundary where required.
- Metadata length check: the five currently implemented public routes have unique titles under 60 characters and descriptions between 120 and 160 characters.
- Router migration grep: no remaining `react-router-dom`, `BrowserRouter`, `Outlet`, `useNavigate` or `useLocation` usages in `src`.
- JSON syntax check: `package.json` and `tsconfig.json` parse successfully.
- The final ZIP archive was checked with `unzip -t`; its archive integrity check passed.
- **Production build/typecheck is not verified.** `npm install` timed out in this environment, and offline package-lock generation failed because npm's registry metadata is not cached. Running global `tsc` without installed React/Next and type packages produces cascading missing-module/JSX typing errors, so it is not a valid substitute for the project typecheck. Install dependencies in an internet-enabled environment and run `npm run typecheck`, `npm run lint` and `npm run build` before merging.

## 7. Remaining blockers before launch

1. Run a complete dependency install and production build; resolve any surfaced TypeScript, ESLint or Next.js errors; generate and commit the npm lockfile.
2. Replace and legally review the placeholder Privacy Policy/Cookies copy and confirm the responsible privacy contact, provider list, retention periods and data locations.
3. Implement and test the consent-aware Calendly flow on `/book`.
4. Implement the secure contact endpoint, Supabase schema/RLS, HubSpot sync, chatbot API, knowledge lookup, guardrails, redaction, evaluations, tracing, deletion and incident workflow in the order specified by `AGENTS.md`. These are not implemented by framework migration alone.
5. Finish the About content; add approved individual service pages and full Insights index/article pages, or change the existing internal links to a deliberate alternative. Do not publish invented article content.
6. Decide whether the AI training crawlers listed as OQ-02 in the AEO/SEO spec should be allowed or blocked. The current robots configuration uses a conservative disallow default pending that owner decision.
7. Provide real route-specific social/OG artwork if brand image guidelines require art beyond the generated title/description cards.
8. Wire the supplied videos into their intended sections and verify reduced-motion/data-saver behavior before launch.
9. Validate the site on the chosen hosting platform, test raw HTML / JavaScript-disabled content, verify redirects and 404 behavior, run Lighthouse/accessibility checks and register the sitemap with Search Console/Bing Webmaster Tools.

This archive is a **framework-migration baseline**, not a claim that all PRD features are implemented or that production deployment is ready.
