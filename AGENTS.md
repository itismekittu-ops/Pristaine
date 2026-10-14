# AGENTS.md: Pristaine (pristaine.com)

Instructions for the AI coding agent building this site. Read this file at the start of every session. It implements the specs and never overrides them.

## 1. Project in brief

**Migration baseline status (2026-10-14):** the supplied Magic Pattern UI has been moved to Next.js App Router. This archive is not production-ready. Preserve the existing design; do not regenerate sections or treat the framework migration as approval to implement every future feature. Read `/specs/REVIEW-AND-CHANGE-LIST.md` before feature work. Validate the production build before deployment.

Pristaine is an AI agency (chat AI, voice AI, AI solutions, AI consultation) serving businesses in the US and Canada. The uploaded Magic Pattern code provides the current marketing UI. The chat backend, Supabase persistence, HubSpot sync and consent-aware Calendly booking flow remain planned work and must not be described as live until implemented and tested. The owner is not a developer: explain choices in plain words and ask before guessing.

## 2. Specs are the source of truth

The specs are in `/specs`. Treat them as read-only unless the owner explicitly requests a specification edit. Read the ones a task touches before writing code. Resolve all items in `/specs/REVIEW-AND-CHANGE-LIST.md` before implementing full Insights articles or service-detail pages.

| File | Holds |
|---|---|
| `00-project-constitution.md` | Charter, principles, quality gates, Definition of Done |
| `01-prd.md` | Features F1 to F9 as user stories with acceptance criteria |
| `02-architecture.md` | Stack, routes, data model, chat pipeline, security headers, env variables |
| `03-business-rules.md` | Consent, cookies, forms, chat data, claims, launch gate |
| `04-ai-observability-security.md` | Guardrails, prompts, evals, tracing, incidents |
| `05-aeo-seo.md` | Metadata, structured data, crawl files, content standards |
| `06-design.md` | Tokens, components, motion, accessibility, content audit |

**If two specs conflict, the higher one wins:** Constitution, Business Rules, AI Observability and Security, PRD, Architecture, Design, AEO/SEO, then this file.

**If a spec is silent, unclear or seems wrong: stop and ask the owner.** Do not invent requirements, copy, numbers, clients, testimonials, prices or logos.

## 3. Stack and commands

Next.js (App Router) with TypeScript in strict mode, Tailwind CSS, Framer Motion, Supabase (Postgres), OpenAI API, HubSpot API, and a consent-aware Calendly flow on `/book`. Existing public pages are prerendered to HTML. Server endpoints are planned and must be implemented and tested separately before launch.

The current migration baseline provides `dev`, `build`, `start`, `lint` and `typecheck`. Add `test`, `test:e2e`, `check:content`, `check:a11y`, `check:perf` and `check:secrets` as their test suites and gates are implemented; do not use no-op scripts to make a command appear complete.

Keep `.env.example` current with variable names only, never values.

## 4. Repository layout

**Routing rule:** reusable components carried over from Magic Pattern live in `/src/ui-pages`, not `/src/pages`. Next.js treats files under `/src/pages` as Pages Router routes and expects each route module to have a default export. Public route modules belong in `/src/app`.


```text
/specs                  the spec documents (read-only)
/src/app                routes, including /api/chat, /api/contact, /api/webhooks/calendly
/src/components         UI built only from tokens
/src/content            typed content: services, faq, copy, insights, legal, approved answers, assistant instructions
/src/config             site config, route map, design tokens
/src/lib                consent, booking, chat, guardrails, crm, db, tracing
/src/server             server-only code
/supabase/migrations    schema migrations
/tests                  unit, e2e, evals
/public                 self-hosted fonts, video, images
```

## 5. Build order

One story per prompt. Finish its acceptance criteria and tests before starting the next. Within a phase, go in the order shown.

| Phase | Work |
|---|---|
| 0 | Tokens file, site config, route map, content schemas, placeholder guard, self-hosted fonts, layout shell, security headers config, scripts, `.env.example` |
| 1 | F6-US1, F6-US2, then F1-US1, F1-US2, F1-US3, F1-US4 (footer with a stub Cookie settings control), then F6-US3 (wires the control), F6-US4 (the Privacy Policy page, including its Cookies section) |
| 2 | F4-US2, F4-US1, F4-US3, then F2-US1, F2-US4, F3-US2, F3-US3, F3-US5, service page shells, F3-US1, then chat interface only: F2-US2, F2-US5 |
| 3 | F7-US3, F7-US2, F7-US1, F7-US4, F3-US4 |
| 4 | Supabase schema and row-level security, then F5-US1, F5-US2, F9-US1 |
| 5 | Guardrails, approved answers, OpenAI path: F2-US3 (answers only), then F9-US2 (saving), F2-US6, F2-US7, tracing, eval suite |
| 6 | F9-US3, F9-US5, F9-US4, F2-US8, F9-US6 |
| 7 | F8-US1 to F8-US4, accessibility, performance, red team, launch gate |

Some stories are finished by a later one: criterion 3 of F1-US4 is completed by F6-US3, and F2-US3 gains saving through F9-US2. Build in the order above and do not skip ahead.

## 6. Always

- Take every color, size, radius and motion value from the tokens file, created from `06-design.md` section 4.
- Read services, FAQ, copy, legal text, approved answers and routes from the content layer and route map. Never repeat a fact in two places.
- Build every public page as complete static HTML.
- Validate all input on the server. Browser checks are only for convenience.
- Put every secret and per-environment value in environment variables.
- Honor `prefers-reduced-motion` and data-saver with the static versions in `06-design.md` section 4.6.
- Keep touch targets at 44 by 44 px, show hover, focus and active states, and keep the page usable by keyboard.
- Keep content short and within the PRD limits. Put extra detail behind the (i) popover.
- Mark any value the owner has not supplied as `[[PLACEHOLDER: what is needed]]` so the placeholder guard can find it.

## 7. Never

- Hard-code secrets, keys, URLs or IDs.
- Load any third-party script, cookie or font before consent. Do not load scripts or fonts from a public CDN.
- Let the browser read or write the database, or put a server key in browser code.
- Send sensitive data (government IDs, card and bank numbers, passwords, biometric data) to the AI model, the database, HubSpot, logs or traces.
- Save chat text before it has been redacted.
- Give the AI model tools, browsing, code execution or database access.
- Invent clients, testimonials, statistics, prices, awards or certifications.
- Reuse assets, logos, footage or text from any reference website.
- Ship placeholder content to production.
- Put analytics, marketing or cloned-site content in the build without the owner's approval.
- Edit `/specs`.

## 8. Fixed owner decisions

- The navbar has only the logo, About, Services and Book a Consultation.
- No Pause button on the hero video or brand strip (Constitution QG-07). Do not add one.
- llms.txt is required for launch.
- The planned launch chat assistant answers from approved answers first and calls the configured OpenAI model only when no approved answer fits. The assistant is not implemented by the framework migration alone.
- Booking uses a dedicated `/book` page; Calendly must not load until the visitor continues or has already granted the relevant consent. Supabase is the planned database and HubSpot the planned CRM; those integrations are not implemented in this migration baseline.
- No pricing anywhere on the site in v1.
- No separate Cookie Policy page. The current canonical route is `/privacy`, with cookie details at `/privacy#cookies`. `/privacy-policy` and `/cookie-policy` are redirect aliases. The cookie banner and Manage choices panel link to the Cookies section, and the footer has only the Privacy Policy link.
- Email is not purchased yet. The current contact form is a UI only; do not represent it as storing or syncing leads until the API/database/CRM stories are implemented and verified.

## 9. Chat assistant rules (summary of spec 04)

Every message follows this order: input guardrails, approved-answer lookup, AI model (only if no match), output guardrails, redacted save, trace.

- No visitor text reaches the model, and no model text reaches the visitor, without passing a guardrail. If a safety check cannot run, the message is not passed on.
- Facts about Pristaine come only from approved content. The assistant never quotes prices, promises results, claims to be human, or gives legal, medical or financial advice.
- Mask emails and phone numbers before the model sees them. Redact sensitive data before any save, log or trace.
- Show the saved-chat notice beside the chat bar (Business Rules BR-70).
- Keep the kill switch `ASSISTANT_ENABLED` and the approved-answers-only fallback working.
- Treat model output as untrusted: show it as plain text, strip HTML and images, and keep only allowed links.
- Record the instruction version, approved answer ID, model name and timings on every saved message.

## 10. Data and privacy rules

Details are in `02-architecture.md` sections 9 and 12 and `03-business-rules.md` sections 6 and 7.1. Key points: row-level security with no browser access; save first, sync to HubSpot second; HubSpot contacts are non-marketing; anonymous chats are deleted after `CHAT_RETENTION_DAYS`; both banner choices have equal weight and the Global Privacy Control signal is honored.

## 11. SEO rules

Details are in `05-aeo-seo.md`. Key points: unique metadata and a canonical tag per page; sitemap.xml, robots.txt and llms.txt generated at build time; JSON-LD built from the same data as the page; FAQPage markup identical to the visible FAQ; one H1 per page.

## 12. Environment variables (names only)

`SITE_URL`, `CALENDLY_EVENT_URL`, `CALENDLY_WEBHOOK_SIGNING_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `HUBSPOT_ACCESS_TOKEN`, `CHAT_RETENTION_DAYS`, `ASSISTANT_ENABLED`, `CONTACT_TO_ADDRESS`, `EMAIL_FROM_ADDRESS`, `EMAIL_PROVIDER_API_KEY`, `ANALYTICS_ID`.

## 13. Open items: never guess these

Hosting provider, email service and mailbox, analytics tool, OpenAI model, tracing tool region, final logo and brand approval, hero headline, How It Works steps, FAQ copy, About content, the approved answers library, public email, social profile links. If you need one, use a marked placeholder and tell the owner.

## 14. Definition of done for a story

1. Every acceptance criterion in the PRD story passes.
2. `typecheck`, `lint`, `test` and `check:content` pass.
3. For UI, `check:a11y` finds no WCAG 2.2 AA failures, and keyboard and reduced-motion behavior are verified.
4. Performance stays within the budgets in `02-architecture.md` section 11.
5. No console errors, no hard-coded values, and no non-essential network request before consent.
6. Relevant Playwright flow passes (booking, contact form, consent, chat).

## 15. Token and loop safety

- Work on one story per prompt. Read only the spec sections the story references, not whole files. This file plus those sections is enough, so do not re-read every spec at the start.
- Change only the files the story needs. Never rewrite or regenerate a whole file to make a small change, and never touch unrelated files.
- If the same error or failing test is still there after 2 fix attempts, stop. Report the error, what you tried and your best guess. Do not keep trying.
- Never run build, lint or test commands again without changing something first.
- Do not install a new dependency without asking the owner.
- Do not add pages, features or extras that are not in a story.
- If a story needs changes to more than about 10 files, stop and propose splitting it.

## 16. How to work

- Read the story and every spec it references before writing code.
- Make the smallest change that satisfies the story. Do not refactor unrelated code.
- Add or update tests with the code.
- When finished, report which acceptance criteria pass, what you assumed, and anything you could not verify.
- Record notable decisions in `DECISIONS.md` with the date and the spec section that justified them.

### Prompt template for each story

```text
Implement story F#-US# from specs/01-prd.md.
First read the story, its dependencies and every spec it references.
Follow AGENTS.md. Use tokens, content files and the route map only.
Do not start other stories. Mark unknown values as placeholders.
When done, report each acceptance criterion as pass or fail, and list assumptions.
```
