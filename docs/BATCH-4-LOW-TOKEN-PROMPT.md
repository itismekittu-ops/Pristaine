# Batch 4 — Low-token Bolt implementation prompt

Implement only Pristaine's hybrid chat response pipeline and approved-answer source synchronization. Read `AGENTS.md`, then only the relevant sections of `specs/00-project-constitution.md`, `specs/01-prd.md`, `specs/02-architecture.md`, `specs/03-business-rules.md`, and `specs/04-ai-observability-security.md`. Do not re-audit unrelated pages or restyle the site.

## Existing state (do not recreate)
- Next.js on Bolt is the frontend. Supabase PostgreSQL and Supabase Edge Functions are the custom backend; do not create duplicate Next.js `/api/*` backends.
- Supabase `public.approved_answers` already exists with `id uuid` PK, `topic text`, `question_variants text[]`, `answer text`, `version text`, `status text`, `created_at timestamptz`, `updated_at timestamptz`. The status check accepts only `active`, `draft`, `retired`.
- RLS is enabled and currently has no policies. Browser-role grants were not shown in the inspection; private records must remain server-only and be accessed through the appropriately secured Edge Function.
- Existing `contact-submit` and `calendly-sync` functions are outside this task. Preserve them. No new database table, column, index, RLS policy, grant, external cache, vector database, Redis or admin interface is approved.
- `content/approved-answers/*.json` is the human-edited source of truth. Current 28 records are deliberately `draft` and must remain inactive until reviewed.
- `scripts/build-approved-answers-sql.mjs` generates reviewed, idempotent SQL and does not connect to or change Supabase. Preserve its safety checks. Do not implement automatic runtime synchronization, automatically delete rows omitted from content, or run its SQL for the owner.

## Required work
1. Inspect whether a Supabase `chat-assistant` Edge Function already exists. Reuse and extend it if present; create it only if absent. Do not modify the marketing UI except for wiring the existing chat UI to the approved endpoint.
2. Enforce existing input guardrails before any approved-answer lookup or model call. Fail closed if a required safety check fails. Sensitive content must not reach OpenAI, database storage, logs, traces or HubSpot.
3. Normalize input and `question_variants` consistently (Unicode normalization, case folding, punctuation removal and whitespace collapsing). Match exact normalized variants only at launch. Multiple matches must fail safely and be logged without visitor text; do not arbitrarily choose.
4. Query only `status = 'active'` rows. A matching active entry returns its approved `answer` without calling OpenAI. Draft and retired entries must never be returned as answer hits.
5. For a miss, call the configured OpenAI API server-side using `OPENAI_API_KEY` and `OPENAI_MODEL` (configured value is `gpt-6-luna`). If either is unavailable or the model is down/over budget, use the approved safe fallback. Never expose secrets to the browser. Do not silently hardcode a second model.
6. For model responses, use approved knowledge only for Pristaine-specific facts (services, pricing, project commitments, clients, credentials, policies and capabilities). General conceptual answers about AI and business technology may use general model knowledge within scope. No browsing, tools, database access or code execution.
7. Apply output safety checks to both approved and model responses. Ground claims about Pristaine; prohibit invented prices, guarantees, clients, statistics, certifications and compliance claims. Safe-render plain text, filter links to approved Pristaine routes and booking URL, allow at most one regeneration when required, then use fallback.
8. Preserve existing redacted chat persistence, per-session isolation, rate/cost limits, kill switch, recovery and observability if implemented. Do not duplicate those components. Do not log raw visitor text or sensitive content. Record answer source (`approved_answer`, model or fallback), answer ID/version where applicable, model/version and safe metrics.
9. Add focused tests for exact cache hit with zero model calls, cache miss uses model, inactive rows never match, case/punctuation normalization, duplicate normalized matches fail safely, sensitive input blocked before lookup/model/storage, prompt injection, unsafe model output fallback, model outage, kill switch and session isolation. Update/add tests without breaking existing contact/Calendly tests.
10. Validate generated SQL tooling with at least a dry test: it parses all content JSON, rejects invalid statuses/IDs/duplicate normalized variants, upserts by stable UUID, creates no DDL, and refuses deletion unless explicit UUIDs plus `--confirm-delete` are supplied. Do not run generated SQL against production.

## Scope limits and report
- Do not populate `approved_answers` automatically or mark any draft active.
- Do not invent provider-based guardrails if the specification does not identify the classifier/service. If a required security layer is missing and cannot be implemented from the approved stack, stop and report the blocker instead of claiming it is implemented.
- Do not edit specifications unless required and explicitly approved. Do not touch Calendly/contact workflows, page layout, styling, or unrelated files.
- Before modifying code, give a concise plan. At completion, report changed files, tests actually run and results, missing prerequisites/secrets, any controls still unimplemented, and the exact manual SQL-sync step. Do not say production-ready unless end-to-end security and response tests actually pass.
