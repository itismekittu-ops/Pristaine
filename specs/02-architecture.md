# Pristaine: Architecture Document

**Version:** 0.3 (Draft — route inventory and migration baseline)  |  **Date:** 2026-10-14  |  **Depends on:** Project Constitution and Charter v0.3, PRD v0.4, Business Rules v0.4, Design Document v0.3  |  **Status:** For review

## 1. Purpose

This document defines how pristaine.com is built: the stack, how pages are produced, where content lives, how outside services connect, and the limits on speed and security. It exists so that Bolt builds a static-first marketing site that search engines can read, that stays fast, and that runs a working chat assistant, saves leads and conversations in a database, and syncs them to HubSpot.

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
| ARC-P5 | The browser never talks to the database. Every read and write goes through a server function. | Constitution P6 |
| ARC-P6 | Secrets live only on the server side, never in the repository or the browser. | Constitution SEC-02 |
| ARC-P7 | Guardrails first for anything AI: no user text reaches a model without an input check. | AI Observability and Security document |
| ARC-P8 | Approved answers first, the AI model second, and the model sees only approved content. | Business Rules BR-71 |

## 4. System Overview

&#91;embedded content: system overview · one site, five outside services\]

Static pages come from the host. Calendly and analytics load only after the consent module allows them, and server functions are the only code that reaches the database, the AI model and HubSpot.

## 5. Technology Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js (App Router) with TypeScript | Keeps the React components from Magic Patterns, builds every page as static HTML, and offers serverless endpoints for the contact form and the future assistant. Bolt supports it. |
| Styling | Tailwind CSS driven by the tokens file | One place for colors, type and spacing (Design Document section 4). |
| Motion | Framer Motion, plus CSS for simple transitions | Scroll scenes and stacking cards. The How It Works orb is CSS or canvas, so no 3D library ships in v1. |
| Content | Typed data files and Markdown or MDX files in the repository | Services, FAQ, copy, legal text and Insights articles with no CMS to run. |
| Booking | Calendly scheduler on the dedicated `/book` page | PRD F4. Loaded only on first click. |
| Contact endpoint | Server functions that save the lead and sync it to HubSpot | An email notification is added once the mailbox exists (see OQ-02). |
| Analytics | To be decided, consent-gated | Business Rules OQ-01. |
| Hosting and CDN | Netlify as the working assumption, to be confirmed | Bolt deploys to it directly. Any host must give HTTPS, custom headers, serverless functions, preview deploys and one-step rollback. |
| Source control | Git repository on GitHub | Single codebase, protected main branch. |
| Automated checks | TypeScript and lint, axe-core, Lighthouse with budgets, Playwright for key flows | Quality gates in section 14. |
| Database | Supabase (managed Postgres) with row-level security | Holds leads, conversations, bookings and sync status. Only server functions can reach it (DR-6). |
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
| DR-6 | Server functions are the only way to the database | Letting the browser read and write tables directly: one mistake in a rule would expose visitor data. |

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
| /api/contact | Planned serverless function | Section 9; not implemented in this UI migration |
| /api/chat | Planned serverless function, streaming | Section 13; not implemented in this UI migration |
| /api/webhooks/calendly | Planned serverless function | Section 9.3; not implemented in this UI migration |
| /og?title=…&description=… | Dynamic 1200×630 Open Graph card image | Generated from route metadata; not included in sitemap |

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
| Supabase | Stores leads, conversations, bookings and sync status | From server functions only | Necessary (server side) | Form and chat show their recovery messages and nothing is half-saved |
| OpenAI | Answers questions the approved library cannot | From the chat function only, after input checks | Necessary (server side) | The chat shows the unavailable message with booking and contact options |
| HubSpot | CRM for the team | From the server, after data is saved | Necessary (server side) | The lead stays saved and the sync is retried automatically |

- **ARC-SVC-01** Every outside service is reached through one wrapper module and one environment variable, so it can be swapped (Twelve-Factor IV).
- **ARC-SVC-02** The Calendly script and stylesheet come from assets.calendly.com and the booking frame from calendly.com. These hosts are allowed in the security policy only for those purposes.
- **ARC-SVC-03** Each provider that receives personal data is recorded in the provider list required by Business Rules BR-44.
- **ARC-SVC-04** Server-side services receive visitor data only after the Business Rules checks have passed: the chat notice or form consent line, and sensitive-data blocking (BR-70, BR-73).

## 9. Data, Contact Form and CRM Sync

### 9.1 Data Model (Supabase)

Every table has row-level security on and no access for the browser. Only server functions, using a server-side key, read or write them (DR-6).

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
- **ARC-DB-03** Scheduled jobs inside the database delete anonymous conversations after CHAT\_RETENTION\_DAYS (BR-74) and retry failed syncs (section 9.3).
- **ARC-DB-04** Schema changes are migration files in the repository, applied the same way in every environment (Twelve-Factor X).
- **ARC-DB-05** Deleting a person removes every row that references them in one operation, and the deletion is recorded without personal details (PRD F9-US6).

### 9.2 Contact Form Pipeline

1. The browser checks required fields for user convenience only.
2. The form sends a POST request to /api/contact.
3. The function validates every field again on the server against a schema (name up to 100 characters, a valid email up to 254, message up to 2000, optional company and phone with length limits).
4. The function rejects the request if the hidden honeypot field is filled or the form was submitted faster than a human could fill it.
5. The platform's rate limit rejects repeated requests from one address.
6. The function saves the lead and message in the database, then replies with success. A sync job sends the lead to HubSpot (section 9.3).
7. The function replies with success or a generic error, with no internal detail.

- **ARC-FRM-01** The database holds the full record, HubSpot holds the contact and a note, and retention follows Business Rules BR-27 and BR-74.
- **ARC-FRM-02** Logs record only status and error codes, never names, emails or message text.
- **ARC-FRM-03** Spam control MUST NOT use a puzzle that blocks keyboard or screen-reader users (Business Rules BR-24).
- **ARC-FRM-04** The optional email notification reads CONTACT\_TO\_ADDRESS, EMAIL\_FROM\_ADDRESS and the email service key from environment variables. The form works without it, because the lead is saved and synced to HubSpot. The notification is added when the mailbox exists.
- **ARC-FRM-05** Once the domain mailbox exists, SPF, DKIM and DMARC records MUST be set for pristaine.com so nobody can spoof the company's email.

### 9.3 CRM Sync (HubSpot)

- **ARC-CRM-01** A lead or chat summary is saved first and synced second, so a visitor never waits for HubSpot.
- **ARC-CRM-02** Contacts are matched by email and updated, never duplicated. The HubSpot contact ID is stored on the lead.
- **ARC-CRM-03** HubSpot receives contact fields, source fields, the consent date, the form message as a note, a chat summary with topics of interest when an email is known, and bookings as meetings. Contacts are created as non-marketing (Business Rules BR-76).
- **ARC-CRM-04** A conversation is summarized by the AI model after it has been quiet for a set time (30 minutes by default). The summary passes the same sensitive-data check as any other text.
- **ARC-CRM-05** Failed syncs are logged and retried by a scheduled job with growing waits. When the retry limit is reached the team is notified (PRD OQ-10).
- **ARC-CRM-06** Bookings arrive at the Calendly webhook endpoint, which confirms that each request really came from Calendly before saving it.
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

Headers are defined in host configuration committed to the repository. The policy runs in report-only mode first and is enforced after testing.

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' https://assets.calendly.com; style-src 'self' https://assets.calendly.com; img-src 'self' data:; media-src 'self'; font-src 'self'; frame-src https://calendly.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
```

- **ARC-SEC-01** The Calendly hosts appear in the policy only in the directives above. The analytics host is added only when a tool is chosen.
- **ARC-SEC-02** Secrets exist only as host environment variables, are never committed, and a secret scan runs on every change.
- **ARC-SEC-03** Dependencies are pinned by a lockfile, and a vulnerability check runs weekly and on every change.
- **ARC-SEC-04** Scripts and fonts are self-hosted. No third-party script is loaded from a public CDN.
- **ARC-SEC-05** Every server input is validated on the server. Browser-side checks are never trusted.
- **ARC-SEC-06** Production serves HTTPS only and redirects all other requests.
- **ARC-SEC-07** Visitor text is treated as data, never as instructions. The AI model has no tools: it cannot write data, call other systems or read other visitors' conversations.
- **ARC-SEC-08** The database key, OpenAI key, HubSpot token and Calendly signing key are separate secrets, each with the narrowest permissions its job needs, and each can be rotated without a code change.

## 13. Chat Assistant (Hybrid Pipeline)

The assistant answers from approved answers first and from the AI model only when none fits. One endpoint, /api/chat, runs both paths, so the same checks, saving and logging apply to every answer.

1. The visitor's message reaches /api/chat.
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
| SUPABASE\_URL | No | Database address |
| SUPABASE\_SERVICE\_KEY | Yes | Server-side database access |
| OPENAI\_API\_KEY | Yes | AI model access |
| OPENAI\_MODEL | No | Which model answers |
| HUBSPOT\_ACCESS\_TOKEN | Yes | CRM sync |
| CALENDLY\_WEBHOOK\_SIGNING\_KEY | Yes | Confirms booking messages come from Calendly |
| CHAT\_RETENTION\_DAYS | No | Days before anonymous chats are deleted, 90 by default |

**Release flow:** change on a branch, automatic preview deploy, automated checks, owner review of the preview, merge to main, production deploy, and one-step rollback to the previous deploy.

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
| ARC-AC-06 | The contact endpoint rejects an invalid, oversized, honeypot or too-fast submission, and a valid one is saved and synced to HubSpot. | Automated test |
| ARC-AC-07 | Logs contain no names, emails or message text. | Log review |
| ARC-AC-08 | All security headers in section 12 are present on every response, and the policy blocks an unlisted script. | Header scan |
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
| OQ-01 | Which host will be used? | Netlify, through Bolt's deploy. Confirm that it runs the contact function and sets custom headers on your plan. |
| OQ-02 | Which email service and mailbox? Not bought yet. | Optional. The form works without it, because leads are saved and synced to HubSpot. |
| OQ-03 | Which analytics tool, if any? | None until chosen. |
| OQ-04 | Are Insights articles written as files in the repository, or in a content tool? | Files in the repository. |
| OQ-05 | Will the budgets in section 11 hold with the real hero video? | Proposed values, tuned after measurement. |
| OQ-06 | Do you want an invisible bot check in addition to the honeypot, and is it classed as Necessary by counsel? | No, honeypot, timing and rate limit only. |
| OQ-07 | Can Bolt, on your plan, build, preview and deploy this Next.js setup with several serverless functions and a Supabase connection? | Yes. Test with a small first build before the full one. |
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
