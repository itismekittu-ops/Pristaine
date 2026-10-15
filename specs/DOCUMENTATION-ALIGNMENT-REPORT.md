# Pristaine Documentation Alignment Report

**Prepared:** 2026-10-15

## Scope

Nine supplied Markdown documents were reviewed together. Changes preserve the existing PRD story IDs and functional/privacy/security requirements while aligning architecture and work instructions to the owner's decisions. Design tokens, visual requirements, AI safety controls, consent behaviors and legal obligations were not removed.

## Files changed

- `00-project-constitution.md` — codifies Next.js on Bolt for the frontend and Supabase PostgreSQL/Edge Functions for custom backend work at the top precedence level; clarifies that the published Bolt URL does not prove production/custom-domain readiness.
- `01-prd.md` — keeps stories atomic but permits related stories to be implemented as cohesive batches; corrects the feature count from eight to nine (F1–F9).
- `02-architecture.md` — removes planned Next.js `/api/*` endpoints from the public route table, defines the Supabase Edge Function inventory, aligns contact/chat/webhook flows, hosting assumptions, security/CSP, environment handling, release workflow and acceptance criteria.
- `03-business-rules.md` — clarifies the provider inventory and the data-transfer review required for Supabase Edge Functions and other actual providers. It does not claim legal compliance or replace counsel review.
- `04-ai-observability-security.md` — names the Supabase chat Edge Function as the place where sensitive data is redacted before tracing; no guardrail requirement was removed.
- `05-aeo-seo.md` — clarifies that the website's `robots.txt` controls the website origin and is not access control for Supabase Edge Function URLs.
- `06-design.md` — clarifies that one-section-per-prompt applies to Magic Patterns design-generation work, not Bolt implementation batching.
- `AGENTS.md` — aligns build batches and precedence wording with the revised higher-level specs; respects the owner's direct-to-`main` workflow.
- `REVIEW-AND-CHANGE-LIST.md` — retains the migration history while correcting future implementation guidance to use Supabase Edge Functions.

## Supplied files retained without substantive changes

No supplied source was discarded. All nine documents are included in the package with standardized repository filenames. The design and AI-security requirements were changed only where necessary for dependency/version or architecture clarity.

## Important limits and unresolved owner decisions

1. This is documentation alignment, not code implementation. No application source, Supabase project, database, Edge Function, secret or deployment was changed.
2. The audit's reported gaps remain gaps until implemented and verified.
3. The published `*.bolt.host` site does not by itself verify production custom-domain behavior, security headers, redirects or rollback support.
4. Supabase region and provider/data locations must be selected and reviewed with counsel.
5. The owner still must provide or approve the OpenAI model/budget, HubSpot permissions, Calendly event URL/signing setup, public contact/privacy details, legal copy, retention decisions, article content/authors and crawler policy. No unknown business/legal facts were invented.
6. In the Architecture CSP example, `YOUR_PROJECT_REF` is an instruction placeholder: replace it with the exact configured Supabase project origin before deployment. Do not use a broad wildcard.
7. Supabase Edge Function secrets and injected key names can vary by current Supabase project/API-key configuration. Implementation must follow current Supabase documentation and must never place server-side keys in browser configuration.

## Recommended next step

Commit these documentation updates on the owner's existing `main` branch, then use the completed read-only audit as the baseline. Start with a focused frontend media batch to wire the existing hero videos and CTA loop. Implement the Supabase backend only in later approved batches; don't use Bolt Database or duplicate Next.js API routes.
