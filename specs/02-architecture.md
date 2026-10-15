# Pristaine: Architecture Document

**Version:** 0.4 (Draft — Supabase Edge Functions backend alignment)  |  **Date:** 2026-10-15  |  **Depends on:** Project Constitution and Charter v0.4, PRD v0.5, Business Rules v0.5, Design Document v0.4  |  **Status:** For review

## 1. Purpose

This document defines how pristaine.com is built: the stack, page rendering, content locations, external services, performance limits and security controls. The existing Next.js App Router application on Bolt serves the frontend and public pages. Supabase PostgreSQL stores application data, and Supabase Edge Functions implement custom backend workflows. This separation supports a static-first marketing site with working contact, chat, booking, privacy and CRM flows without duplicating backend logic in Next.js API routes.

## 2. Scope and Out of Scope

**In scope:** the website, its build and release process, the contact endpoint, the database, the hybrid chat assistant, the HubSpot sync, and the consent and script-loading layer.

**Out of scope for v1:** user accounts, payments, a content management interface, and an admin dashboard. The team works in Supabase and HubSpot.

## 3. Architecture Principles

| ID | Principle | Source |
| --- | --- | --- |
| ARC-P1 | Static first: every public page is produced as complete HTML at build time. | Constitution QG-02, PRD F8-US1 |
| ARC-P2 | Single Source of Truth: services, tokens, copy, FAQ and routes each live in one place. | Constitution SSOT-01 to SSOT-06 |
| ARC-P3 | Twelve-Factor: config in environment variables, services as swappable attachments, stateless runtime. | Constitution section 5.3 |
| ARC-P4 | Nothing third-party runs before consent. | Business Rules BR-36 |
| ARC-P5 | The browser never reads or writes private database tables. Browser requests go to approved Supabase Edge Functions; trusted server-side functions and scheduled database jobs perform protected data operations. | Constitution P6, CON-05 |
| ARC-P6 | Secrets live only on the server side, never in the repository or the browser. | Constitution SEC-02 |
| ARC-P7 | Guardrails first for anything AI: no user text reaches a model without an input check. | AI Observability and Security document |
| ARC-P8 | Approved answers first, the AI model second, and the model sees only approved content. | Business Rules BR-71 |

## 4. System Overview

&#91;embedded content: system overview · one site, five outside services\]

Public pages are rendered by Next.js and hosted through Bolt for the current working deployment. Calendly and analytics load only after the consent module allows them. The browser may invoke approved Supabase Edge Functions; private database access, OpenAI calls, HubSpot synchronization and webhook processing stay server-side in Supabase. Supabase Edge Functions are deployed separately from the Bolt-hosted frontend.

## 5. Technology Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend framework | Existing Next.js App Router with TypeScript | Preserves the migrated Magic Pattern components and renders public pages. Next.js is not the custom backend for this project. Verify static HTML and production build behavior before launch. |
| Styling | Tailwind CSS driven by the tokens file | One place for colors, type and spacing (Design Document section 4). |
| Motion | Framer Motion, plus CSS for simple transitions | Scroll scenes and stacking cards. The How It Works orb is CSS or canvas, so no 3D library ships in v1. |
| Content | Typed data files and Markdown or MDX files in the repository | Services, FAQ, copy, legal text and Insights articles with no CMS to run. |
| Booking | Calendly scheduler on the dedicated `/book` page | PRD F4. Loaded only on first click. |
| Custom backend endpoints | Supabase Edge Functions | `contact-submit`, `chat-assistant`, `calendly-webhook`, `hubspot-sync` and `privacy-request` implement the approved flows. A scheduled worker handles retries/retention where required. |
| Analytics | To be decided, consent-gated | Business Rules OQ-01. |
| Frontend hosting | Bolt project hosting (`*.bolt.host`) for the current working deployment | Confirm the final custom-domain/production configuration and verify HTTPS, security headers, redirects, page rendering and rollback support on the current plan. The custom backend runs separately on Supabase. |
| Source control | GitHub repository | The owner currently works directly on `main`. Save a restore-point commit before substantial batches; review diffs and verification results after each batch. Do not create or switch branches unless the owner asks. |
| Automated checks | TypeScript and lint, axe-core, Lighthouse with budgets, Playwright for key flows | Quality gates in section 14. |
| Database and custom backend | Supabase PostgreSQL with RLS and Supabase Edge Functions | Stores leads, conversations, bookings and sync status. Private data access is server-side; the browser invokes only approved functions using public configuration. |
| AI model | OpenAI API, model set by configuration | Answers what the approved library cannot. The key stays on the server (OQ-09). |
| CRM | HubSpot, through a private app token | Gives the team leads, chat summaries and bookings (section 9.3). |

### Decision Records

| ID | Decision | Alternatives rejected |
| --- | --- | --- |
| DR-1 | Statically generated Next.js | A Vite single-page app without a proven prerendering pipeline: initial HTML would not satisfy ARC-RT-01. A Vite SSG alternative was considered but not selected for this implementation. |
| DR-2 | Supabase as the database | No database: the owner needs saved leads and conversations and a CRM view of them. The cost is privacy and security duties, covered by the Business Rules. |
| DR-3 | A small in-house consent layer | A third-party consent platform: it adds scripts and cookies of its own. Revisit if counsel requires one. |
| DR-4 | Next.js over Astro | Astro ships less JavaScript, but Next.js reuses the Magic Patterns React output with fewer moving parts. Revisit if budgets in section 11 cannot be met. |
| DR-5 | Approved answers first, then the AI model | The AI model for every question: slower, costlier and more likely to say something wrong about Pristaine. |
| DR-6 | Supabase Edge Functions and trusted database-side jobs perform protected application data operations | Direct browser access to private tables is rejected. RLS remains defense-in-depth. |

## 6. Rendering and Routing

- **ARC-RT-01** All public routes are generated at build time. A plain request without JavaScript MUST return the page's full content.
- **ARC-RT-02** Routes are defined in one route map file (Constitution SSOT-05). The sitemap, navbar and footer read from it.
- **ARC-RT-03** Service pages and Insights articles use dynamic routes generated from their data files, so adding one never collides with another.
- **ARC-RT-04** One trailing-slash convention site-wide: no trailing slash. Redirects live in one file.
- **ARC-RT-05** The site has a custom 404 page that offers Home and Book a Consultation.

| Route | Produced as | Source / status |
| --- | --- | --- |
| / | Prerendered HTML | Existing Home UI |
| /about | Prerendered HTML | Existing shell; full copy pending approval |
| /services | Prerendered HTML | Existing Services UI |
| /book | Prerendered HTML shell | Existing route; Calendly flow pending implementation |
| /privacy | Prerendered HTML shell | Existing route; legal copy pending owner and legal review |
| /services/\[slug\] | Planned prerendered HTML, four pages | Implement only after page UI and content are approved |
| /insights, /insights/\[slug\] | Planned prerendered HTML | UI/article content pending; do not include in sitemap until published |
| /privacy-policy | 308 redirect to /privacy | Legacy compatibility alias |
| /cookie-policy | 308 redirect to /privacy#cookies | Legacy compatibility alias; no separate Cookie Policy page |
| /og?title=…&description=… | Dynamic 1200×630 Open Graph card image | Generated from route metadata; not included in sitemap |

### Supabase Edge Function endpoints (not website routes)

These endpoints are hosted by the configured Supabase project and are not part of the Next.js route map, sitemap or `llms.txt`. Use the actual project URL and deployed function names; do not hard-code a project-specific URL into shared code.

| Function | Purpose | Access rule |
|---|---|---|
| `contact-submit` | Validate and save contact submissions | Publicly invocable with strict server-side validation and abuse controls; never trusts browser validation |
| `chat-assistant` | Guardrails, approved-answer lookup, optional OpenAI fallback, redacted persistence and response | Publicly invocable with strict limits and all required guardrails |
| `calendly-webhook` | Receive booking events | Verify Calendly signature, allowed event types and idempotency before writes |
| `hubspot-sync` | Process eligible CRM outbox items | Server/worker-only authorization; never an unrestricted public sync endpoint |
| `privacy-request` | Receive privacy requests and manage their verified workflow | Public intake may be allowed; identity verification is required before disclosure/deletion |
| Scheduled retention/retry worker | Delete expired anonymous data and retry queued CRM work | Invoked only by trusted Supabase Cron/pg\_cron or another explicitly authorized scheduler |

## 7. Content Architecture (Single Source of Truth)

| Data | Lives in | Read by |
| --- | --- | --- |
| Services (name, slug, description, icon, order) | One services data file | Navbar dropdown, Services cards, Services page, footer, sitemap, Service structured data |
| Design tokens | One tokens file | Tailwind configuration and CSS variables |
| Page copy | Content files, one per page | Page components |
| FAQ | One FAQ file | FAQ section and FAQPage structured data (same text, word for word) |
| Insights articles | One Markdown or MDX file each | Insights section, index page, article pages, sitemap |
| Legal text | Legal files with version and last-updated date | Legal pages, consent re-prompt on version change |
| Site facts (company name, public email, social links) | One site config file | Footer, Contact, Organization structured data |
| Secrets and per-environment values | Environment variables only | Server code |
| Approved answers (question variants, answer, topic, status) and the assistant instructions | One versioned content file per topic, and one for the instructions | Chat answer lookup and the AI model request |

- **ARC-CON-01** Every content file is checked against a typed schema at build time. An invalid file fails the build.
- **ARC-CON-02** A placeholder guard fails the production build if any content value is marked as a placeholder (Business Rules launch gate).
- **ARC-CON-03** The approved answers and the assistant instructions are versioned. Every saved assistant message records the library entry or instruction version that produced it.

## 8. Outside Services and Failure Behavior

| Service | Purpose | Loaded when | Consent category | If it fails |
| --- | --- | --- | --- | --- |
| Calendly | Scheduler embedded on `/book` | The page loads it only after consent or an explicit Continue action | Third-party services | Direct Calendly link opens in a new tab |
| Email service | Optional notification of new leads | On form submit, from the server | Necessary (server side) | The lead is still saved and synced. Only the notification is skipped |
| Analytics | Usage statistics | After consent only | Analytics | Site is unaffected |
| Fonts | Sora and Inter | With the page, from the same domain | Necessary | System fonts take over |
| Video and images | Hero, CTA, Insights | From the same domain, lazily below the fold | Necessary | Poster or still image |
| Supabase | Stores leads, conversations, bookings and sync status | Browser may invoke approved Edge Functions; private database access is server-side only | Necessary (server side) | Form and chat show their recovery messages and nothing is half-saved |
| OpenAI | Answers questions the approved library cannot | From the chat function only, after input checks | Necessary (server side) | The chat shows the unavailable message with booking and contact options |
| HubSpot | CRM for the team | From the server, after data is saved | Necessary (server side) | The lead stays saved and the sync is retried automatically |

- **ARC-SVC-01** Every external provider is called through a narrow wrapper in the relevant Supabase Edge Function and configured through environment/secrets appropriate to that provider, so it can be swapped without duplicating integration logic (Twelve-Factor IV).
- **ARC-SVC-02** The Calendly script and stylesheet come from assets.calendly.com and the booking frame from calendly.com. These hosts are allowed in the security policy only for those purposes.
- **ARC-SVC-03** Each provider that receives personal data is recorded in the provider list required by Business Rules BR-44.
- **ARC-SVC-04** Server-side services receive visitor data only after the Business Rules checks have passed: the chat notice or form consent line, and sensitive-data blocking (BR-70, BR-73).

## 9. Data, Contact Form and CRM Sync

### 9.1 Data Model (Supabase)

Every private table has row-level security enabled and denies direct visitor access. Authorized Supabase Edge Functions and approved trusted database-side jobs perform protected reads and writes. Use the currently supported Supabase server-side credential interface; never expose secret/service-role credentials to the browser (DR-6).

| Table | Holds | Notes |
| --- | --- | --- |
| leads | Name, email, phone, company, source and campaign fields, HubSpot contact ID | One row per email, updated and never duplicated |
| form\_submissions | Lead, message, consent line version, page, time | Append-only |
| chat\_sessions | Random visitor ID, lead if an email is known, page, source fields, start and last activity, summary, topic tags | Anonymous until an email is shared |
| chat\_messages | Session, role, redacted text, answer source (approved answer, AI model, fallback or blocked), library entry or instruction version, model name, response time, safety flags, time | Text is redacted before saving |
| bookings | Lead, Calendly event ID, start time, status | Filled by the Calendly webhook |
| crm\_sync\_log | Record type and ID, action, status, attempts, next retry time, HubSpot ID, error code | No personal text |
| privacy\_requests | Request type, status, received and due dates, outcome | No personal details once completed |
| approved\_answers | Question variants, answer, topic, version, status | Built from the content files, never edited by hand |

- **ARC-DB-01** The browser holds no database key, and no table allows browser access.
- **ARC-DB-02** Text is redacted for sensitive data before any write (Business Rules BR-73), and IP addresses are stored only in hashed form (BR-75).
- **ARC-DB-03** Supabase Cron/pg\_cron MUST run the documented retention and CRM-retry work, either through trusted database functions or by securely invoking the authorized Edge Function worker. Scheduled work is not considered active until it is configured and verified.
- **ARC-DB-04** Schema changes are migration files in the repository, applied the same way in every environment (Twelve-Factor X).
- **ARC-DB-05** Deleting a person removes every row that references them in one operation, and the deletion is recorded without personal details (PRD F9-US6).

### 9.2 Contact Form Pipeline

1. The browser checks required fields for user convenience only.
2. The form invokes the `contact-submit` Supabase Edge Function.
3. The function validates every field again on the server against a schema (name up to 100 characters, a valid email up to 254, message up to 2000, optional company and phone with length limits).
4. The function rejects the request if the hidden honeypot field is filled or the form was submitted faster than a human could fill it.
5. A server-enforced rate limiter rejects repeated submissions using a trusted shared store or an explicitly configured platform capability; do not rely on per-instance memory alone.
6. The function saves the lead and message in Supabase, queues HubSpot synchronization, and replies with success only after persistence succeeds (section 9.3).
7. The function replies with success or a generic error, with no internal detail.

- **ARC-FRM-01** The database holds the full record, HubSpot holds the contact and a note, and retention follows Business Rules BR-27 and BR-74.
- **ARC-FRM-02** Logs record only status and error codes, never names, emails or message text.
- **ARC-FRM-03** Spam control MUST NOT use a puzzle that blocks keyboard or screen-reader users (Business Rules BR-24).
- **ARC-FRM-04** The optional email notification reads CONTACT\_TO\_ADDRESS, EMAIL\_FROM\_ADDRESS and the email-service credential from server-side Supabase Edge Function configuration/secrets. The form works without it because the lead is saved and queued for HubSpot sync. The notification is added when the mailbox and provider exist.
- **ARC-FRM-05** Once the domain mailbox exists, SPF, DKIM and DMARC records MUST be set for pristaine.com so nobody can spoof the company's email.

### 9.3 CRM Sync (HubSpot)

- **ARC-CRM-01** A lead or chat summary is saved first and synced second, so a visitor never waits for HubSpot.
- **ARC-CRM-02** Contacts are matched by email and updated, never duplicated. The HubSpot contact ID is stored on the lead.
- **ARC-CRM-03** HubSpot receives contact fields, source fields, the consent date, the form message as a note, a chat summary with topics of interest when an email is known, and bookings as meetings. Contacts are created as non-marketing (Business Rules BR-76).
- **ARC-CRM-04** A conversation is summarized by the AI model after it has been quiet for a set time (30 minutes by default). The summary passes the same sensitive-data check as any other text.
- **ARC-CRM-05** Failed syncs are logged and retried by a scheduled job with growing waits. When the retry limit is reached the team is notified (PRD OQ-10).
- **ARC-CRM-06** Bookings arrive at the `calendly-webhook` Supabase Edge Function, which verifies the signed request and idempotency before saving it.
- **ARC-CRM-07** The HubSpot token is a private app token with only the permissions the sync needs.
- **ARC-CRM-08** Deleting a person removes them from the database and from HubSpot together (Business Rules BR-43).

## 10. Consent and Script Loading

- **ARC-CNS-01** One consent module stores the choice in a first-party cookie (Secure, SameSite=Lax, 12 months) holding the categories, a timestamp and the policy version.
- **ARC-CNS-02** A single script gate function is the only way to load a non-necessary script: it checks the category and refuses if consent is missing.
- **ARC-CNS-03** The module reads the Global Privacy Control signal and starts non-essential categories off when it is present (Business Rules BR-35).
- **ARC-CNS-04** A changed policy version or an expired choice shows the banner again.
- **ARC-CNS-05** When a visitor withdraws a category, the page reloads without that category's scripts, because a loaded script cannot be reliably unloaded.
- **ARC-CNS-06** The booking flow on `/book` decides whether to show the consent notice, load the scheduler, or open the fallback link (PRD F4-US1 to F4-US3).
- **ARC-CNS-07** The chat session ID is created only when the first chat message is sent, and the chat notice (Business Rules BR-70) sits beside the input before that.

## 11. Performance Budgets

These are proposed starting limits, to be tuned after the first prototype is measured (see OQ-05).

| Item | Budget |
| --- | --- |
| Largest Contentful Paint, 75th percentile mobile | at most 2.5 s |
| Interaction to Next Paint | at most 200 ms |
| Cumulative Layout Shift | at most 0.1 |
| JavaScript on first load of Home | at most 200 KB compressed |
| Fonts | Two families, WOFF2, subset, at most 100 KB total, font-display swap |
| Hero poster image | at most 150 KB, modern format, this is the LCP element |
| Hero clips | Four clips, each at most 1.5 MB, muted, playsinline, MP4 and WebM |
| CTA loop | at most 1.5 MB |
| Calendly and analytics | Zero bytes until consent and a click or load trigger |
| Approved chat answer, server side | at most 300 ms |
| First words of an AI model answer | at most 4 s |

- **ARC-PRF-01** The first hero clip starts only after the poster has painted. The other three load lazily.
- **ARC-PRF-02** No video is requested at all under reduced motion or data-saver (Constitution QG-04).
- **ARC-PRF-03** Every image and video has fixed dimensions so nothing shifts as it loads.
- **ARC-PRF-04** Below-the-fold media loads lazily (Constitution MM-04). Performance is measured on production builds, not on the development server.

## 12. Security

Security headers must be configured at the layer supported by the current Bolt deployment (for example the supported hosting configuration or Next.js response configuration). Verify the actual deployed responses; do not assume the preview host supports every required header. Supabase Edge Function responses need their own CORS/authentication configuration and do not inherit the website host headers. The website CSP `connect-src` must allow only the exact configured Supabase project origin needed for function calls; do not use a wildcard. Run the policy in report-only mode first when supported, then enforce it after testing.

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' https://assets.calendly.com; style-src 'self' https://assets.calendly.com; img-src 'self' data:; media-src 'self'; font-src 'self'; frame-src https://calendly.com; connect-src 'self' https://YOUR_PROJECT_REF.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
```

- **ARC-SEC-01** The Calendly hosts appear in the policy only in the directives above. The analytics host is added only when a tool is chosen.
- **ARC-SEC-02** The Bolt frontend receives public configuration only. Private provider credentials are stored in Supabase Edge Function secrets or the provider's appropriate secret store, are never committed, and a secret scan runs on every change.
- **ARC-SEC-03** Dependencies are pinned by a lockfile, and a vulnerability check runs weekly and on every change.
- **ARC-SEC-04** Scripts and fonts are self-hosted. No third-party script is loaded from a public CDN.
- **ARC-SEC-05** Every server input is validated on the server. Browser-side checks are never trusted.
- **ARC-SEC-06** Production serves HTTPS only and redirects all other requests.
- **ARC-SEC-07** Visitor text is treated as data, never as instructions. The AI model has no tools: it cannot write data, call other systems or read other visitors' conversations.
- **ARC-SEC-08** OpenAI, HubSpot, Calendly webhook and optional email credentials are stored as Supabase Edge Function secrets with the narrowest permissions practical. Supabase-managed server-side keys are read from the supported Supabase runtime/SDK interface; no private key is committed or exposed to the browser.

## 13. Chat Assistant (Hybrid Pipeline)

The assistant answers from approved answers first and calls the configured AI model only when no approved answer fits. The `chat-assistant` Supabase Edge Function runs both paths so the same checks, saving and logging apply to every answer.

1. The visitor's message is sent to the `chat-assistant` Supabase Edge Function.
2. Input checks run: empty message, length in tokens, rate limit, prompt-injection patterns and sensitive-data detection. A failed check returns a recoverable message. If a check cannot run, the message is not passed on.
3. The approved-answer lookup runs: a normalized text match first, and a close-meaning match only if enabled (OQ-08). A hit returns the approved answer at once with no model call.
4. With no hit, the request is built from the versioned assistant instructions, the approved knowledge and the current conversation, sent to the OpenAI model, and the answer streams back.
5. Output checks run: no sensitive data, no prices, guarantees or claims that are not in approved content, and no disclosure of the instructions. A failed check swaps in a safe fallback message.
6. The exchange is saved after redaction, the session is updated, and the summary and HubSpot sync are triggered when due.
7. A trace is logged without personal data (AI Observability and Security document).

- **ARC-AST-01** One endpoint serves both paths, so every answer passes the same input checks, output checks, saving and logging.
- **ARC-AST-02** An approved answer returns within 300 ms of the request reaching the server. An AI model answer begins streaming within 4 seconds.
- **ARC-AST-03** The model name and key are configuration (OPENAI\_MODEL, OPENAI\_API\_KEY). The key never leaves the server.
- **ARC-AST-04** The model sees only the approved knowledge and the current visitor's conversation, never other visitors' data.
- **ARC-AST-05** Rate limits per visitor ID and per address protect cost and prevent abuse. A monthly spending limit is set in the OpenAI account, outside the code.
- **ARC-AST-06** Every saved message records its answer source, library or instruction version, model name and response time, so quality can be measured.
- **ARC-AST-07** If the model or the database is unavailable, the chat shows the recovery message from PRD F2-US6 and the rest of the site keeps working. ASSISTANT\_ENABLED switches the assistant off without a release.
- **ARC-AST-08** The owner reviews the approved answers and the assistant instructions before every release.

## 14. Environments and Release

Local, preview and production run the same code and differ only in environment variable values (Twelve-Factor X). Variable names, never values, are listed here.

| Variable | Secret | Purpose |
| --- | --- | --- |
| SITE\_URL | No | Canonical URLs, sitemap, structured data |
| CALENDLY\_EVENT\_URL | No | Booking scheduler URL and fallback link |
| CONTACT\_TO\_ADDRESS | No | Where form messages are delivered |
| EMAIL\_FROM\_ADDRESS | No | Sender of form messages |
| EMAIL\_PROVIDER\_API\_KEY | Yes | Email service access |
| ANALYTICS\_ID | No | Set only when a tool is chosen |
| ASSISTANT\_ENABLED | No | Kill switch for the assistant: when false, the chat shows the unavailable message |
| NEXT\_PUBLIC\_SUPABASE\_URL | No | Public Supabase project URL used by the frontend to invoke Edge Functions |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (choose one naming convention for the project) | No | Public key for invoking approved functions; private tables remain protected by RLS |
| SUPABASE\_URL | Platform-provided in Edge Function runtime | Supabase project URL available to Edge Functions |
| SUPABASE\_SECRET\_KEYS / legacy SUPABASE\_SERVICE\_ROLE\_KEY | Platform-managed server-side key interface | Use the currently supported Supabase runtime/SDK interface; do not expose it to the browser or commit it |
| OPENAI\_API\_KEY | Yes | AI model access |
| OPENAI\_MODEL | No | Which model answers |
| HUBSPOT\_ACCESS\_TOKEN | Yes | CRM sync |
| CALENDLY\_WEBHOOK\_SIGNING\_KEY | Yes | Confirms booking messages come from Calendly |
| CHAT\_RETENTION\_DAYS | No | Days before anonymous chats are deleted, 90 by default |

**Owner workflow:** work directly on `main` as requested by the owner. Save a restore-point commit before each substantial batch, implement one reviewed batch at a time, inspect the diff, run relevant checks and verify the preview before continuing. Confirm production/custom-domain behavior and a tested rollback path before launch. Preview and production use the same variable names with environment-specific values.

**Automated checks on every change:** type check and lint, axe-core accessibility scan, Lighthouse budgets from section 11, broken-link check, sitemap, robots and llms.txt validation, placeholder guard, secret scan, and Playwright runs of the booking, form and consent flows.

## 15. Forbidden

- Hard-coded secrets, keys, URLs or IDs anywhere in the code.
- Trusting validation that runs only in the browser.
- Any third-party script, cookie or font request before consent.
- Scripts or fonts pulled from a public CDN at runtime.
- Assets, logos, footage or text from the reference websites.
- Placeholder content in a production build.
- The same business fact written in two places.
- Environment-specific code paths that skip consent, validation or security headers.
- Saving form text in browser storage, or logging personal data.
- Autoplaying media that ignores reduced motion or data-saver.
- Browser access to database tables, or any server key in browser code.
- Sending sensitive data to the AI model, the database or HubSpot.
- Giving the AI model tools that write data or contact other systems.
- Saving chat text before it has been redacted.

## 16. Acceptance Criteria

| ID | Criterion | How to verify |
| --- | --- | --- |
| ARC-AC-01 | A plain request to every public route returns full content with no JavaScript. | curl or view source |
| ARC-AC-02 | Adding a service to the services data file adds it everywhere with no other edit, including its page and sitemap entry. | Edit once, rebuild |
| ARC-AC-03 | The production build fails on a placeholder value or an invalid content file. | Inject one, build |
| ARC-AC-04 | Before consent, the network log shows no request to Calendly, analytics or any third-party host. | Network panel |
| ARC-AC-05 | Calendly loads only after the first booking click, and the fallback link works when the script is blocked. | Network panel, blocker test |
| ARC-AC-06 | The `contact-submit` Edge Function rejects invalid, oversized, honeypot or too-fast submissions. A valid submission is saved in Supabase and queued for HubSpot sync; the integration test verifies eventual sync. | Automated test |
| ARC-AC-07 | Logs contain no names, emails or message text. | Log review |
| ARC-AC-08 | Required website security headers from section 12 are present on every website response and the website CSP blocks unlisted scripts. Supabase Edge Functions separately enforce their documented CORS and authorization rules. | Website header scan plus function access tests |
| ARC-AC-09 | No secret appears in the repository or in browser-delivered files. | Secret scan, bundle search |
| ARC-AC-10 | Home meets every budget in section 11 on a production build and a mobile profile. | Lighthouse |
| ARC-AC-11 | With ASSISTANT\_ENABLED false, the chat shows the unavailable message and no text reaches the AI model. | Network panel |
| ARC-AC-12 | A bad deploy is rolled back to the previous release in one step. | Rollback drill |
| ARC-AC-13 | A question matching an approved answer returns it within 300 ms with no call to the AI model. | Automated test, model call count |
| ARC-AC-14 | A message containing a card number, SIN, SSN or password never reaches the model, the database or HubSpot. | Automated test with sample values |
| ARC-AC-15 | The browser cannot read or write any table with any key it holds. | Direct request test |
| ARC-AC-16 | With HubSpot unavailable, the lead stays saved and reaches HubSpot after it returns. | Outage drill |
| ARC-AC-17 | A verified deletion removes the person from the database and from HubSpot. | Deletion drill |
| ARC-AC-18 | Anonymous conversations older than the retention period are deleted by the scheduled job. | Backdated test data |

## 17. Dependencies

**Upstream:** Project Constitution and Charter, PRD, Business Rules, Design Document.

**Downstream:** AI Observability and Security (assistant endpoint and guardrails), AEO/SEO Document (rendering, sitemap, structured data), agents.md.

## 18. Open Questions

| ID | Question | Current assumption |
| --- | --- | --- |
| OQ-01 | What is the final production hosting/custom-domain configuration? | The current working URL is hosted by Bolt. Verify the chosen Bolt plan supports the required Next.js page output, custom domain, HTTPS, redirects, security headers and rollback before production launch. Backend functions and the database are hosted separately by Supabase. |
| OQ-02 | Which email service and mailbox? Not bought yet. | Optional. The form works without it, because leads are saved and synced to HubSpot. |
| OQ-03 | Which analytics tool, if any? | None until chosen. |
| OQ-04 | Are Insights articles written as files in the repository, or in a content tool? | Files in the repository. |
| OQ-05 | Will the budgets in section 11 hold with the real hero video? | Proposed values, tuned after measurement. |
| OQ-06 | Do you want an invisible bot check in addition to the honeypot, and is it classed as Necessary by counsel? | No, honeypot, timing and rate limit only. |
| OQ-07 | Have the required Bolt response headers and routing behavior been verified on the actual deployment? | Not yet. Check the published preview and final custom-domain deployment; Supabase Edge Functions use their own origin and security configuration. |
| OQ-08 | Should the approved-answer lookup also match close meanings, or only normalized text at launch? | Normalized text at launch, close-meaning matching added after testing. |
| OQ-09 | Which OpenAI model, and what monthly spending limit? | Model set by configuration after testing. Limit set in the OpenAI account. |
| OQ-10 | Where does the team read and manage conversations, since v1 has no admin dashboard? | Supabase's own interface, and HubSpot. |
| OQ-11 | Does the Calendly plan support webhooks? | Yes. If not, bookings reach HubSpot another way. |
| OQ-12 | Which Supabase region will be used? | Decided with counsel (Business Rules OQ-08). |

## 19. Change Log

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-10-13 | Initial draft. |
| 0.1 (update) | 2026-10-13 | Owner decision: database, live hybrid assistant and HubSpot. Replaced DR-2, added DR-5 and DR-6, rewrote sections 9 and 13, redrew the diagram. |
| 0.3 | 2026-10-14 | Recorded current UI route status, redirects, server-endpoint implementation status and migration baseline. |
| 0.4 | 2026-10-15 | Made Supabase Edge Functions the specified custom backend; removed planned Next.js API endpoints from the site route inventory; aligned hosting, security, environment and direct-main workflow language. |
