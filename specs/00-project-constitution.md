# Pristaine: Project Constitution and Charter

**Version:** 0.3 (Draft — route and migration alignment)  |  **Date:** 2026-10-14  |  **Domain:** pristaine.com  |  **Status:** For review

## 1. Purpose

This document is both the Project Constitution and the Project Charter. It states why Pristaine's website exists, and it sets the principles, rules and quality gates that every other spec, design and line of code must follow. If another document conflicts with this one, this one wins.

## 2. Scope and Out of Scope

**In scope:** the pristaine.com marketing website: Home, About, Services overview, four dedicated service pages, Privacy Policy with an embedded Cookies section, the cookie consent banner, the consent-aware `/book` page, the contact form, the hero chat assistant, the database, and the CRM sync.

**Out of scope:** delivery of client AI products, internal tools, and any service beyond the four listed below until they are added by a spec change.

## 3. Charter: Problem, Vision and Mission

### Problem Statement

Small and mid-sized businesses in the US and Canada receive more customer calls, chats and inquiries than their teams can answer quickly. AI can help, but the market is crowded with vendors who promise a lot and show little about how their AI is tested, secured or measured.

**Pain points**

- Slow or missed replies after hours and at busy times.
- No clear starting point: owners do not know where AI will pay off first.
- Distrust of AI that gives wrong answers, mishandles customer data or cannot be switched off.

**Market gap.** Most AI agencies sell capability. Few make reliability, testing and privacy visible to the buyer before they commit.

### Vision

A business in the US or Canada adopts AI for customer conversations with confidence, because the AI is clean, tested and honest about what it is.

### Mission and Product Statement

Pristaine builds clean, reliable AI for customer conversations and operations, with guardrails, testing and measurable results built in.

**Value proposition.** By the end of a visit, a prospect understands what Pristaine builds, why its AI can be trusted, and how to start with a short consultation. Clients gain AI that answers customers reliably, with guardrails, testing and measurable results they can see.

**Audience:** small and mid-sized businesses (roughly 10 to 500 employees) in the United States and Canada.

**Services, in display order:**

1. Conversational AI and Chatbots
2. Voice AI
3. AI Solutions
4. AI Consultation

## 4. Principles

| ID | Principle | Meaning in practice |
| --- | --- | --- |
| P1 | Clarity first | A visitor always knows where they are, what the page offers and what to do next. |
| P2 | Less content, more signal | Show only essential content. Extra detail goes behind an info (i) icon, tooltip or expandable panel. |
| P3 | Trust is the product | Reliability, testing, privacy and honesty are visible in the site itself. |
| P4 | Performance and accessibility are features | They are requirements, never polish tasks for later. |
| P5 | Specs are the source of truth | Code follows specs. If the code needs to differ, the spec changes first. |
| P6 | Privacy by default | No non-essential tracking before consent. Collect only what is needed. |
| P7 | Motion serves understanding | Animation explains or guides. It never decorates at the cost of clarity or speed. |

### Non-Negotiables (Immutable)

These principles define Pristaine and do not change. Altering one requires a new major version of this document and the owner's explicit approval.

- **Customer trust first:** every feature, flow and word is judged by whether it earns or protects trust.
- **Zero fabrication:** never invent clients, testimonials, statistics, results, certifications or compliance claims.
- **Honest AI:** AI is always labeled as AI, never presented as a human, and never claims abilities it does not have.
- **Strict consent:** no tracking, data sharing or third-party scripts without the visitor's consent.
- **Human in the loop:** every path ends with an invitation to talk to a person.

## 5. Requirements

Keywords MUST, MUST NOT, SHOULD and MAY follow RFC 2119.

### 5.1 Spec Precedence

- **CON-01** When documents conflict, the higher one in this order wins: Project Constitution, Business Rules, AI Observability and Security, PRD, Architecture, Design Document, AEO/SEO Document, agents.md.
- **CON-02** agents.md MUST implement the other specs and MUST NOT introduce new requirements.
- **CON-03** Every requirement in any spec MUST have a unique ID and a testable acceptance criterion.
- **CON-04** Any spec change MUST update that document's version and change log.

### 5.2 Single Source of Truth

- **SSOT-01** Each fact lives in exactly one place. Everything else references it.
- **SSOT-02** Service definitions (name, slug, short description, icon, order) MUST live in one data file. The navbar dropdown, Services section cards, Services overview page, footer, sitemap and structured data MUST all read from it.
- **SSOT-03** Design tokens (color, type, spacing, radius, motion timing) MUST live in one tokens file. Components MUST NOT hard-code these values.
- **SSOT-04** Page copy MUST live in a content layer separate from components.
- **SSOT-05** Routes MUST be defined in one route map.
- **SSOT-06** Business facts (company name, contact email, Calendly URL, legal text version) MUST live in configuration or content, never repeated inline.

### 5.3 Twelve-Factor Application

| Factor | Rule for this project |
| --- | --- |
| I. Codebase | One Git repository. Every deploy comes from it. |
| II. Dependencies | All dependencies declared in the package manifest with a lockfile. |
| III. Config | Environment-specific values (Calendly URL, analytics IDs, API endpoints, form endpoint) are environment variables. No secrets or per-environment values in code. |
| IV. Backing services | Calendly, form handler, analytics and the future chat backend are attached resources, swappable by changing configuration. |
| V. Build, release, run | Build, release and run are separate stages. Every release is versioned and reproducible. |
| VI. Processes | The site is stateless. No user state is kept in server memory. |
| VII. Port binding | The app is self-contained and served through the host's runtime. |
| VIII. Concurrency | Scale by adding instances or CDN capacity. No single-instance assumptions. |
| IX. Disposability | Fast start, graceful shutdown, and instant rollback to the previous release. |
| X. Dev/prod parity | Preview and production use the same stack and the same variable names. |
| XI. Logs | Logs go to the output stream. The app does not manage log files. |
| XII. Admin processes | One-off tasks (sitemap generation, content validation) are scripts in the same codebase. |

### 5.4 Quality Gates

- **QG-01** All pages MUST meet WCAG 2.2 Level AA. Level AAA criteria SHOULD be adopted where the cost is low (for example, enhanced contrast for body text).
- **QG-02** Core Web Vitals at the 75th percentile MUST meet Google's good thresholds: LCP at or under 2.5 s, INP at or under 200 ms, CLS at or under 0.1.
- **QG-03** Every animation MUST respect `prefers-reduced-motion` and provide a static equivalent.
- **QG-04** Video MUST NOT autoplay when reduced motion or data-saver is on. A poster image MUST be shown instead.
- **QG-05** The site MUST be fully usable by keyboard and screen reader, and responsive from 320 px wide to large desktop.
- **QG-06** Detailed performance budgets (media sizes, script weight) are defined in the Architecture document.
- **QG-07** Approved exception (owner decision, 2026-10-13): the hero video and brand strip have no visible Pause control. This is a known gap against WCAG 2.2 criterion 2.2.2 (Level A), and QG-01 applies to everything else. Safeguards: reduced motion and data-saver stop both (QG-03, QG-04), the brand strip pauses on hover and focus, hero clips are slow, muted and free of flashing, and the exception is reviewed again before launch.

### 5.5 Content and UX

- **UX-01** Each section has one primary message and at most one primary call to action.
- **UX-02** Copy uses plain language. Jargon is explained or avoided.
- **UX-03** Secondary detail MUST be placed behind an info (i) icon, tooltip or expandable panel, not on the main surface.
- **UX-04** The navbar contains only the logo, About, Services and the Book a Consultation button.
- **UX-05** Every interactive element has a visible hover, focus and active state and a clear label.
- **UX-06** The design applies the 10 usability heuristics, Gestalt grouping, a clear visual hierarchy and a consistent grid. Details are in the Design Document.

### 5.6 Motion and Media

- **MM-01** Heavy media (looping video, 3D or WebGL) is allowed only in the Hero, How We Work and CTA sections.
- **MM-02** All other sections use subtle motion only: hover, scroll reveal, stacked-card transitions, accordion transitions.
- **MM-03** Media MUST be generated or licensed by Pristaine. Assets, logos, footage or text from reference websites MUST NOT be reused.
- **MM-04** Below-the-fold media MUST load lazily.

### 5.7 Privacy and Security Baseline

- **SEC-01** Non-essential scripts and cookies (analytics, marketing, and third-party embeds that set cookies) MUST NOT load before the visitor consents.
- **SEC-02** Secrets MUST NOT appear in client code or in the repository.
- **SEC-03** The site MUST be served over HTTPS only, with security headers defined in the Architecture document.
- **SEC-04** The chat bar MUST be labeled as an AI assistant and MUST follow the AI Observability and Security document.
- **SEC-05** Compliance obligations (PIPEDA, Quebec Law 25, CCPA/CPRA, CASL) are defined in Business Rules.

### 5.8 Definition of Done

A page or feature is done only when all of these are true:

1. It meets its spec requirements and acceptance criteria.
2. It passes the accessibility check at Level AA.
3. It meets the Core Web Vitals thresholds on a mobile profile.
4. It works with reduced motion on and with keyboard only.
5. It reads its content, services and tokens from the single sources.
6. No console errors, and no non-essential requests before consent.

## 6. Acceptance Criteria

| ID | Criterion | How to verify |
| --- | --- | --- |
| AC-01 | Changing a service name in the services data file updates the navbar, cards, overview page, footer and sitemap with no other edits. | Edit once, check all five places. |
| AC-02 | Changing a color token updates every component that uses it. | Edit once, visual check. |
| AC-03 | No hard-coded URLs, IDs or keys are found in source. | Code search and secret scan. |
| AC-04 | Automated and manual checks find no WCAG 2.2 AA failures on any page. | Accessibility audit. |
| AC-05 | Mobile Core Web Vitals meet the thresholds in QG-02. | Lighthouse and field data. |
| AC-06 | With reduced motion on, no video autoplays and no scroll-driven animation runs. | Manual check with OS setting on. |
| AC-07 | On first load, before consent, the network log shows no analytics or marketing requests. | Network panel inspection. |
| AC-08 | Heavy media exists only in Hero, How We Work and CTA. | Section review. |

## 7. Dependencies

**Upstream:** none. This is the root document.

**Downstream:** PRD, Business Rules, Architecture, AI Observability and Security, Design Document, AEO/SEO Document, agents.md.

## 8. Open Questions

| ID | Question | Current assumption |
| --- | --- | --- |
| OQ-01 | Confirm that heavy 3D and video is limited to Hero, How We Work and CTA (MM-01). | Limited to those three. |
| OQ-02 | Where will the site be hosted? | To be decided in Architecture. |
| OQ-03 | Has the Pristaine name cleared a USPTO and CIPO trademark search? | Not yet checked. |
| OQ-04 | Calendly event name and duration. | Free AI Readiness Call, 30 minutes (placeholder). |

## 9. Change Log

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-10-13 | Initial draft. |
| 0.2 | 2026-10-13 | Merged the Project Charter into this document: added Problem, Vision, Mission, Value Proposition and Non-Negotiables. |
| 0.2 (update) | 2026-10-13 | Added QG-07, an approved accessibility exception: no Pause control on hero video and brand strip. |
| 0.2 (update 2) | 2026-10-13 | Owner decision: the chat assistant is live at launch, with a database and HubSpot. Moved the assistant, database and CRM sync into scope. |
| 0.3 | 2026-10-14 | Aligned the v1 legal route and dedicated booking page with the current UI direction. |
