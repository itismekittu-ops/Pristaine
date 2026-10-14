# AGENTS.md: Pristaine (pristaine.com)

Instructions for the AI coding agent building this site. Read this file at the start of every session. It guides implementation of the specifications and preserves explicit owner decisions recorded here.

## 1. Project in brief

**Migration baseline status (2026-10-14):** the supplied Magic Pattern UI has been moved to Next.js App Router. The project is not production-ready. Preserve the existing design; do not regenerate sections or treat the framework migration as approval to implement every future feature. Read `/specs/REVIEW-AND-CHANGE-LIST.md` before feature work. Validate the production build before deployment.

Pristaine is an AI agency offering chat AI, voice AI, AI solutions and AI consultation to businesses in the US and Canada. The migrated code provides the current marketing UI. The production chat backend, Supabase persistence, HubSpot sync and consent-aware Calendly flow remain planned work. Do not describe them as live until implemented and tested. The owner is not a developer: explain choices in plain language and ask before guessing.

## 2. Specifications and source of truth

The specs are in `/specs`. Treat them as read-only unless the owner explicitly requests a specification edit. Read only the spec sections relevant to the approved feature batch before changing code. Read `/specs/REVIEW-AND-CHANGE-LIST.md` before completing Insights articles or service-detail pages.

| File | Holds |
|---|---|
| `00-project-constitution.md` | Charter, principles, quality gates, Definition of Done |
| `01-prd.md` | Features F1 to F9 as user stories with acceptance criteria |
| `02-architecture.md` | Stack, routes, data model, chat pipeline, security headers, environment variables |
| `03-business-rules.md` | Consent, cookies, forms, chat data, claims, launch gate |
| `04-ai-observability-security.md` | Guardrails, prompts, evaluations, tracing, incidents |
| `05-aeo-seo.md` | Metadata, structured data, crawl files, content standards |
| `06-design.md` | Tokens, components, motion, accessibility, content audit |

Unless the owner explicitly decides otherwise, resolve conflicts using this order: Project Constitution, Business Rules, AI Observability and Security, PRD, Architecture, Design, AEO/SEO, then this file.

**Owner-approved architecture decision:** Next.js on Bolt is the frontend; Supabase PostgreSQL and Supabase Edge Functions provide the custom backend. This explicit decision takes precedence over any older implementation detail in a spec that calls for a duplicate Next.js `/api/*` backend. Do not silently implement duplicate backend endpoints. Flag outdated spec references in the batch report; do not edit `/specs` unless the owner authorizes it.

If a requirement remains silent, unclear or materially conflicting, stop and ask the owner. Do not invent requirements, copy, statistics, clients, testimonials, prices, logos or legal information.

## 3. Stack and commands

- **Frontend:** existing Next.js App Router, TypeScript in strict mode, Tailwind CSS and Framer Motion, hosted on Bolt.
- **Database:** Supabase PostgreSQL with versioned migrations and row-level security (RLS).
- **Custom backend:** Supabase Edge Functions. Do not create a separate Express server or duplicate custom business logic in Next.js API routes.
- **External services:** OpenAI for model inference, HubSpot for CRM, Calendly for scheduling, and Langfuse for tracing/evaluations if approved and configured.

Use Next.js for page rendering and frontend behavior. Use Supabase Edge Functions for contact submission, chatbot requests, Calendly webhooks, CRM synchronization and privacy workflows. Prefer clear function names such as `contact-submit`, `chat-assistant`, `calendly-webhook`, `hubspot-sync` and `privacy-request`. Reuse shared validation, database and redaction code where suitable; do not duplicate integration logic across functions.

The current migration baseline provides `dev`, `build`, `start`, `lint` and `typecheck`. Add `test`, `test:e2e`, `check:content`, `check:a11y`, `check:perf` and `check:secrets` as their real test suites and gates are implemented. Never use no-op scripts to make a command appear complete.

Keep `.env.example` current with variable names only, never values. Explain which settings belong in Bolt's frontend environment and which belong in Supabase Edge Function secrets. Never place a service-role key or provider secret in a `NEXT_PUBLIC_*` variable.

## 4. Current repository layout and planned additions

**Observed migration-baseline structure:** these folders already exist in the uploaded repository. Reuse them instead of renaming or duplicating them just to match a target diagram.

```text
/assets-source             source/reference assets already in the repository
/public                    existing images, videos and other static assets
/specs                     project specifications (read-only unless authorized)
/src/app                   Next.js App Router routes and layouts
/src/components            shared UI components
/src/config                site configuration and design tokens
/src/contexts              existing React contexts
/src/data                  existing typed/static application data and content
/src/hooks                 existing React hooks
/src/types                 existing TypeScript types
/src/ui-pages              reusable migrated Magic Pattern page components
/src/utils                 existing shared utilities
/src/index.css             existing global styles
```

**Planned folders to add when the relevant implementation batch needs them:**

```text
/supabase/migrations       versioned PostgreSQL schema, constraints, indexes and RLS policies
/supabase/functions        Supabase Edge Functions for contact, chat, Calendly webhook, CRM sync and privacy
/tests                     unit, integration, end-to-end and AI evaluation tests
```

Do not create `/src/content`, `/src/lib` or `/src/server` merely to match a diagram. First check whether the existing `/src/data`, `/src/utils` and App Router structure can support the work cleanly. Add another folder only when there is a concrete need, and explain that need in the batch report.

**Routing rule:** public route modules belong in `/src/app`. Reusable components carried over from Magic Pattern live in `/src/ui-pages` or `/src/components`, not `/src/pages`. Next.js treats files under `/src/pages` as Pages Router routes; do not introduce that router as part of this project.

Do not place provider secrets in the browser. Browser code may use only the public Supabase project URL and public/anonymous key required to invoke approved functions. Public access must still be protected by Edge Function validation, rate limits and database policies. Private tables must not be directly readable or writable by visitors.

## 5. Build order: cohesive feature batches

**Implement one coherent feature batch per prompt, not one user story per prompt.** Each batch may include multiple closely related PRD stories that share a subsystem, data flow or UI feature, provided their dependencies are satisfied. Verify acceptance criteria separately for every included story. The sequence below is the default order; skip criteria already complete and evidenced by the audit.

| Batch | Scope and related PRD stories |
|---|---|
| 0 | Read-only baseline audit using `REVIEW-AND-CHANGE-LIST.md`; inspect existing routes, components, assets, scripts and actual gaps. Do not edit application files during the audit. |
| 1 | Foundation, consent, legal-route behavior and navigation: relevant config/tokens/route-map gaps; F6-US1, F6-US2, F1-US1 to F1-US4, F6-US3, F6-US4. Preserve `/privacy` as canonical. |
| 2 | Public frontend, existing media, home sections and content routes: F2-US1, F2-US4, F3-US1 to F3-US5, F7-US1 to F7-US4, plus booking-page UI. Reuse existing assets; create no backend endpoints in this batch. |
| 3 | Supabase schema, RLS and real contact storage: versioned migrations, then F5-US1, F5-US2 and F9-US1 via a Supabase Edge Function. |
| 4 | Live Calendly booking and verified webhook: F4-US1 to F4-US3 and F9-US4. Use the existing consent behavior and Supabase booking storage. |
| 5 | Production chatbot backend: approved answers, OpenAI fallback, guardrails, persistence, safe handoff, tracing and evaluations; relevant parts of F2-US2, F2-US3, F2-US5 to F2-US8 and F9-US2. The visual chat UI may already be complete. |
| 6 | HubSpot synchronization, scheduled retries and personal-data workflow: F9-US3, F9-US5, F9-US6 and eligible F2-US8 email capture. Keep CRM sync separate from visitor submission success. |
| 7 | AEO/SEO, accessibility, performance, red-team tests, automated checks and release gate: F8-US1 to F8-US4 and the relevant launch requirements. |

Group work to minimize prompts and duplicated inspection, but do not combine unrelated or multiple high-risk integrations just to reduce the prompt count. If a batch would affect more than about 15 files, has unresolved requirements, or crosses unrelated subsystems, propose the smallest practical split before editing. Do not ask to rebuild a batch that already passes its acceptance criteria.

## 6. Always

- Take every color, size, radius and motion value from the approved tokens file, based on `06-design.md` section 4.
- Read service, FAQ, copy, legal text, approved answers and routes from the content layer and route map. Do not repeat the same fact in multiple sources.
- Render public marketing pages as static HTML where appropriate; never statically expose visitor-specific or private data.
- Validate all input on the server/Edge Function. Browser-side validation is for usability only.
- Keep secrets and per-environment values in secure environment configuration. Provider secrets belong in Supabase Edge Function secrets.
- Honor `prefers-reduced-motion` and data-saver behavior using static versions specified in `06-design.md` section 4.6.
- Keep touch targets at least 44 by 44 px; provide hover, focus and active states, and keep the site usable by keyboard.
- Keep content concise and within PRD limits. Put extra detail behind the specified info popover when required.
- Mark values the owner has not supplied as `[[PLACEHOLDER: what is needed]]` so the placeholder guard can find them. Do not ship placeholders to production.
- Reuse existing images and videos in `/public`; do not regenerate or upload duplicate assets.
- For every batch, inspect the current code first and change only what is missing or failing.

## 7. Never

- Hard-code secrets, keys or environment-specific IDs.
- Put a private provider key or Supabase service-role key in browser code, a `NEXT_PUBLIC_*` variable, a committed `.env` file, logs or responses.
- Load third-party scripts, cookies or fonts before the consent behavior required by the specs. Do not load fonts from a public CDN.
- Let the browser directly read or write private database tables.
- Create duplicate custom backend logic in Next.js `/api/*` routes when the approved implementation belongs in Supabase Edge Functions.
- Send sensitive data (government IDs, card/bank numbers, passwords, biometric data or other prohibited sensitive patterns) to the AI model, database, HubSpot, logs or traces before required handling/redaction.
- Save chat text before the required guardrails and redaction.
- Give the AI model tools, browsing, arbitrary code execution or database access.
- Invent clients, testimonials, statistics, prices, awards, certifications, named authors or legal claims.
- Reuse assets, logos, footage or text from reference websites without approval and rights.
- Ship placeholder content, simulated success or fake data as live production functionality.
- Put analytics, marketing scripts or cloned-site content in the build without owner approval.
- Edit `/specs` unless the owner explicitly authorizes specification changes.
- Deploy, connect a production domain or modify production secrets as part of a normal feature batch unless explicitly requested.

## 8. Fixed owner decisions and architecture

- The navbar has only the logo, About, Services and Book a Consultation.
- No Pause button on the hero video or brand strip (Constitution QG-07). Do not add one.
- `llms.txt` is required for launch.
- The target chatbot uses approved answers first and calls the configured OpenAI model only when no approved answer fits. The framework migration alone does not implement the assistant.
- **Backend architecture:** Next.js on Bolt serves the frontend; Supabase PostgreSQL stores data; Supabase Edge Functions own custom backend logic. Do not build a separate Node/Express service or a duplicate Next.js API backend.
- Booking uses the dedicated `/book` page. Calendly must not load until the visitor continues or has already granted the relevant consent.
- Supabase is the planned database/platform; HubSpot is the planned CRM. Neither integration is live until the relevant configuration and end-to-end tests pass.
- No pricing anywhere on the site in v1.
- No separate Cookie Policy page. The canonical route is `/privacy`, with cookie details at `/privacy#cookies`. `/privacy-policy` and `/cookie-policy` are redirect aliases. The cookie banner and Manage choices panel link to the Cookies section, and the footer has only the Privacy Policy link.
- The contact form is not live until the Edge Function, database migration and real persistence path are implemented and verified.
- Hero and CTA video assets already exist in `/public/videos`. Wire the appropriate existing assets into the current UI; do not regenerate them. No Pause button.
- Never say a chat was saved, a lead was submitted, a booking was confirmed or a CRM sync succeeded unless the relevant operation actually succeeded.

## 9. Chat assistant rules (summary of spec 04)

Every message follows this order: input guardrails, approved-answer lookup, AI model only if no approved answer fits, output guardrails, redacted save, trace.

- No visitor text reaches the model, and no model text reaches the visitor, without passing the relevant guardrail. If a required safety check cannot run, fail safely and do not continue that path.
- Facts about Pristaine come only from approved content. The assistant never quotes prices, promises results, claims to be human, or gives legal, medical or financial advice.
- Mask emails and phone numbers before the model sees them; redact other sensitive data before any required save, log, trace or CRM operation.
- Show the saved-chat notice beside the chat bar only when the implemented behavior and specs support it. Do not claim persistence until verified.
- Keep the `ASSISTANT_ENABLED` kill switch and the approved-answers-only fallback working.
- Treat model output as untrusted: show it as plain text, strip HTML and images, and keep only allowed links.
- Record instruction version, approved-answer ID, model name and timings on saved messages where required by the schema/specifications.
- Enforce bounded input, output, history and token use; rate limits, timeout behavior and safe provider-failure handling are release requirements.
- Test prompt injection, sensitive-data blocking, model outages, output-guardrail failures and persistence failures.

## 10. Data and privacy rules

Details are in `02-architecture.md` sections 9 and 12 and `03-business-rules.md` sections 6 and 7.1. Key points: RLS; no visitor access to private tables; server-side validation; save first, sync to HubSpot second; HubSpot contacts are non-marketing; anonymous chats are deleted according to `CHAT_RETENTION_DAYS`; both consent-banner choices have equal weight; and the Global Privacy Control signal is honored.

Use idempotency for webhook and CRM processing. Do not claim scheduled retries or automatic deletion are active until the scheduler, permissions and end-to-end behavior have been configured and verified. Privacy requests require an appropriate identity/authorization check; do not expose a public endpoint that lets an arbitrary visitor delete another person's data.

## 11. SEO/AEO rules

Details are in `05-aeo-seo.md`. Key points: unique metadata and canonical tag per page; `sitemap.xml`, `robots.txt` and `llms.txt` generated at build time; JSON-LD built from the same data as the page; FAQPage markup identical to the visible FAQ; and one H1 per page.

Include only valid, published routes in crawl files. Do not publish missing or placeholder articles. Do not silently choose an unresolved crawler-training policy. All SEO/AEO changes must follow the approved content and claims policy.

## 12. Environment variables and secrets (names only)

Keep `.env.example` aligned with actual code. Use the exact names required by the implemented integration and document where each value belongs. Possible names include:

- Public frontend configuration: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or the project’s approved public/publishable key naming).
- Supabase/Edge Function configuration: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, where required by the deployed Supabase environment.
- AI: `OPENAI_API_KEY`, `OPENAI_MODEL`, `ASSISTANT_ENABLED`.
- Booking: `CALENDLY_EVENT_URL`, `CALENDLY_WEBHOOK_SIGNING_KEY`.
- CRM: `HUBSPOT_ACCESS_TOKEN`.
- Site and retention: `SITE_URL`, `CHAT_RETENTION_DAYS`.
- Email, if approved and actually implemented: `CONTACT_TO_ADDRESS`, `EMAIL_FROM_ADDRESS`, `EMAIL_PROVIDER_API_KEY`.
- Analytics, only after owner approval: `ANALYTICS_ID`.
- Langfuse, if enabled: the specific server-side keys and host required by the selected configuration.

Never print, commit, or put private values into this file or `.env.example`. Supabase Edge Function secrets must be configured in the appropriate Supabase environment. Do not put `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `HUBSPOT_ACCESS_TOKEN` or `CALENDLY_WEBHOOK_SIGNING_KEY` in the frontend environment.

## 13. Open items: never guess these

The owner must provide or approve any missing hosting/deployment details, email service and mailbox, analytics tool, OpenAI model, tracing tool/region, final logo and brand approval, hero headline, How It Works steps, FAQ copy, About content, approved answers library, public email, social profile links, legal entity and privacy contact, data-retention requirements and data-location decision, article author details, and crawler policy. If a decision is needed, use a marked placeholder and report the exact owner input required. Do not block unrelated implementation unnecessarily.

## 14. Definition of done for a feature batch

1. Every included PRD story has a separate acceptance-criteria status: Pass, Fail or Blocked, with brief evidence.
2. Relevant `typecheck`, `lint`, `test` and `check:content` checks pass; report any script that does not yet exist instead of pretending it ran.
3. For UI, `check:a11y` finds no WCAG 2.2 AA failures, and keyboard and reduced-motion behavior are verified where relevant.
4. Performance meets the budgets in `02-architecture.md` section 11 where relevant and measurable.
5. No console errors, hard-coded secrets, placeholder content intended for production, or non-essential network request before required consent.
6. Relevant browser/end-to-end flow passes, such as consent, booking, contact submission or chat.
7. External integrations are called live only if actual credentials, configuration and a real integration test confirm them. Clearly separate code-complete, environment-configured and end-to-end-verified status.
8. Report changed files, commands/tests actually executed, actual outputs/failures, assumptions and remaining owner inputs.

## 15. Token and loop safety

- Work on **one coherent feature batch per prompt**. A batch should usually contain 3–6 related stories only when they share a subsystem or workflow; do not artificially split every story into a separate prompt.
- Before editing, check which included acceptance criteria already pass. Change only missing or failing criteria; do not rebuild completed features.
- Read only the specification sections required for the current batch. Do not re-read every specification at the start of every task or repeat the full-site audit.
- Change only files required by the batch. Never rewrite an entire file to make a small change and never touch unrelated files.
- If a batch would change more than about 15 files, crosses unrelated subsystems, includes multiple high-risk integrations or has unresolved requirements, stop and propose the smallest sensible split before editing.
- If the same error or failing test persists after two relevant fix attempts, stop. Report the exact error, what changed and what was attempted; do not keep trying without new evidence.
- Do not rerun an unchanged failing check without a relevant change. After changing code, run the checks needed to verify that change. Avoid redundant commands.
- Do not install a new dependency without asking the owner and explaining why it is needed.
- Do not add pages, features or extras outside the approved PRD/spec scope.
- Do not claim a command, test, deployment, database migration or external integration succeeded unless it was actually executed and verified.

## 16. How to work

1. Read this file and the relevant sections for the approved feature batch.
2. Inspect existing code and the review/change list before editing.
3. State the included story IDs, failed/missing acceptance criteria, dependencies and likely files in a brief plan.
4. Implement the smallest coherent batch that meets those criteria. Preserve existing UI, design tokens, approved assets and working behavior.
5. Add or update appropriate tests with the implementation.
6. Run only relevant checks; include exact check names and results in the report.
7. If the requirement is unclear, an owner decision is missing, credentials are unavailable or a serious security issue appears, stop at the boundary and explain the blocker in plain language.
8. After the batch, report story-by-story Pass/Fail/Blocked status, changed files, tests/checks actually performed, remaining issues, required configuration and owner decisions. Do not begin the next batch until the owner reviews the result.
9. Record durable architecture decisions in `DECISIONS.md` with the date and spec section that justified them, if that file is used by the project.

### Prompt template for each feature batch

```text
Implement feature batch [number/name] for the existing Pristaine project.

PRD stories: [list related story IDs].
Read AGENTS.md and only the spec sections required for these stories.
Inspect existing files first. Implement only missing or failing acceptance criteria; preserve the current UI, tokens, assets and working behavior.
Use Next.js on Bolt for the frontend and Supabase Edge Functions/PostgreSQL for custom backend/database behavior. Do not create duplicate Next.js API endpoints.
Do not invent requirements, business/legal facts or credentials. Do not add dependencies without approval. If a decision or required credential blocks safe completion, stop and report it.
Before editing, identify the scope, dependencies and likely files. Verify each included story separately after the change.
Report changed files, actual tests/checks and results, remaining defects, required environment/service setup and owner decisions.
Stop after this batch; do not begin the next one.
```
