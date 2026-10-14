# Pristaine: AI Observability and Security Document

**Version:** 0.2 (Draft — dependency versions aligned)  |  **Date:** 2026-10-14  |  **Depends on:** Project Constitution and Charter v0.3, PRD v0.4, Business Rules v0.4, Architecture v0.3, Design Document v0.3  |  **Status:** For review

## 1. Purpose

This document defines how the Pristaine chat assistant is kept safe, honest and measurable: the input and output guardrails, protection against jailbreaks and prompt injection, handling of sensitive data, tracing and monitoring, evaluations, red teaming, cost controls and incident response. Every rule here applies to every message, whether it is answered from the approved library or by the AI model.

## 2. Scope and Out of Scope

**In scope:** the chat assistant, the saving and summarizing of conversations, the guardrails around the OpenAI model, and AI-specific security.

**Out of scope:** general website security (Architecture section 12), legal and privacy rules (Business Rules), and AI projects delivered to clients.

## 3. Governing Principles

| ID | Principle | Meaning |
| --- | --- | --- |
| AI-P1 | Two checks, always | No visitor text reaches the model, and no model text reaches the visitor, without passing an input and an output guardrail. |
| AI-P2 | Fail closed | If a safety check cannot run, the message is not passed on. |
| AI-P3 | Approved content only | Facts about Pristaine come only from approved content (Business Rules BR-71). |
| AI-P4 | No sensitive data, anywhere | Never sent to the model, saved, synced, logged or traced (BR-73). |
| AI-P5 | No powers | The model has no tools and cannot write data or contact systems (Architecture ARC-SEC-07). |
| AI-P6 | Layers, not one wall | Rules, classifiers, prompt design, output checks, rate limits and monitoring work together. No single layer is trusted. |
| AI-P7 | Measure before and after | Nothing changes without passing evals, and everything live is observed. |
| AI-P8 | A person is one click away | Book a Consultation and Send a message are always available. |

## 4. Threat Model

OWASP published a 2026 edition of its Top 10 for LLM Applications and renumbered it, so risks are mapped by name. Check the names against the official list at each review.

| Risk | How it could happen here | Main controls |
| --- | --- | --- |
| Prompt injection | A visitor tells the assistant to ignore its rules, or hides instructions in pasted text. | GR-IN-04, GR-IN-12, PRM-02, RT-01 |
| Sensitive information disclosure | A visitor types a card number or SIN, or the model reveals another visitor's data. | GR-IN-05 to GR-IN-07, GR-OUT-03, DAT-01, PRM-07 |
| Supply chain | A compromised library, a changed model version or a provider change. | GOV-03, GOV-04, Architecture ARC-SEC-03 |
| Data and model poisoning | Bad content enters the approved library, the knowledge or the test sets. | GOV-01, GOV-02, EVAL-GOLD-03 |
| Improper output handling | Model text is shown as HTML, or its links or images leak data. | GR-OUT-08, GR-OUT-09 |
| Excessive agency | The model is given tools and uses them wrongly. | AI-P5, PRM-06 |
| Hidden context exposure | A visitor extracts the instructions or other hidden context. | GR-OUT-04, PRM-05, RT-04 |
| Vector and embedding weaknesses | If close-meaning matching is enabled, a crafted question matches the wrong approved answer. | EVAL-DIM-09, EVAL-GOLD-02, Architecture OQ-08 |
| Misinformation | The assistant states an invented price, client or capability. | GR-OUT-05, EVAL-DIM-01 |
| Unbounded consumption | Someone floods the chat to run up cost. | GR-IN-02, GR-IN-03, COST-01 to COST-05 |

## 5. Response Pipeline

&#91;embedded content: response pipeline · 7 stages, 2 checks\]

Approved answers skip the model. If the kill switch is on, or the model is down or over budget, the assistant answers from approved answers only and offers a person for everything else.

## 6. Input Guardrails (Before the Model)

| ID | Requirement | Details |
| --- | --- | --- |
| GR-IN-01 | Reject empty messages | A short hint, no model call. |
| GR-IN-02 | Length limit | Initial: 1,500 characters in the interface and 600 tokens on the server. Longer input is refused with a request to shorten it. |
| GR-IN-03 | Rate limits | Initial: 8 messages a minute and 100 a day per visitor ID, plus a per-address limit. One message in flight at a time. |
| GR-IN-04 | Jailbreak and injection detection | Layered. First normalize the text (Unicode forms, zero-width characters, look-alike letters, odd spacing). Then rules for ignore-previous-instructions, persona and role-play overrides, developer or DAN-style modes, requests to reveal instructions, and fake system or admin messages. Then a classifier for ambiguous cases. Covers encoded text (base64, hex, reversed text, leetspeak) and non-English attempts. |
| GR-IN-05 | Sensitive data detection | Government IDs (SSN shape, SIN shape with check digit, passport and licence patterns), card numbers (13 to 19 digits with Luhn check), bank routing and account numbers, passwords, PINs and security answers, and biometric data. |
| GR-IN-06 | Multi-turn detection | Identifiers split across turns are checked over a rolling window of the session. |
| GR-IN-07 | Non-standard forms | Spaced digits, unusual separators and spelled-out numbers are normalized before checking. |
| GR-IN-08 | Contact details in free text | Emails and phone numbers are masked before the model sees them, and the assistant invites the visitor to use the email field (PRD F2-US8). |
| GR-IN-09 | Safety and moderation | Abuse, hate, sexual and violent content is refused calmly. Mentions of self-harm or an emergency get a fixed supportive message pointing to emergency services (911) and the 988 crisis line, with no model call (OQ-05). |
| GR-IN-10 | Scope control | Requests unrelated to Pristaine (code, essays, advice about other companies) get a polite redirect with Book a Consultation and Send a message. |
| GR-IN-11 | Plain text only | Markup is stripped. No files are accepted and no links are fetched or followed. |
| GR-IN-12 | Untrusted input | Everything the visitor types or pastes is data, never instructions, and is wrapped in delimiters in the model request (PRM-02). |
| GR-IN-13 | Repeated attacks | After 3 blocked messages in 10 minutes the visitor gets a 10-minute cooldown, and the event is tagged. |
| GR-IN-14 | Recoverable error paths | Every block offers a way to rephrase or reach a person. Never a bare error (PRD F2-US6). |

## 7. Prompt and Context Design

- **PRM-01** The assistant instructions are one versioned file. Every saved message records the version (Architecture ARC-CON-03).
- **PRM-02** Order: rules first, then approved knowledge, then the conversation. The visitor's text sits inside clear delimiters and is described to the model as untrusted.
- **PRM-03** The instructions require the assistant to: say it is an AI assistant and never claim to be a person; answer only from approved knowledge; say so when unsure; never quote prices or promise results; give general information and not legal, medical or financial advice; never discuss other clients; and offer Book a Consultation and Send a message when asked for a person or unable to help.
- **PRM-04** Settings use low randomness, a maximum output length and a stop on repeated text.
- **PRM-05** The instructions hold no secrets, keys, internal addresses or customer data, so a leak exposes nothing sensitive. A hidden canary string is added to detect leaks (GR-OUT-04).
- **PRM-06** The model has no tools, browsing, code execution or database access.
- **PRM-07** Only the current visitor's recent turns are sent, up to a fixed limit.
- **PRM-08** Refusals are short and calm, never blame the visitor, and always end with a way forward.

## 8. Output Guardrails (After the Model, Before the Visitor)

| ID | Requirement | Details |
| --- | --- | --- |
| GR-OUT-01 | Empty response fallback | An empty answer is replaced by a defined fallback message. |
| GR-OUT-02 | Length limit | Overlong answers are cut at a sentence or regenerated once. |
| GR-OUT-03 | Sensitive data leak | The input detectors also run on output, whether the data was echoed or invented. |
| GR-OUT-04 | Hidden context defense | The canary string, fragments of the instructions, guardrail logic or internal tooling are blocked. |
| GR-OUT-05 | Groundedness (highest stakes) | Any specific price, percentage, duration, number, client name, certification or compliance statement must match approved content. Otherwise the answer is blocked, regenerated once, then replaced by the fallback. General conceptual answers need no match. |
| GR-OUT-06 | Honest identity | Output that claims to be human, or claims abilities it lacks (booking directly, remembering past visits, sending email), is blocked. |
| GR-OUT-07 | No promises or advice | Guarantees, promised results and legal, medical or financial advice are blocked. |
| GR-OUT-08 | Safe rendering | Output is shown as plain text with limited formatting. HTML, scripts, images and media from the model are stripped. |
| GR-OUT-09 | Link allowlist | Only links to pristaine.com pages and the approved booking link are kept. Any other link is removed. |
| GR-OUT-10 | Moderation | Output is checked for toxic or unsafe content, as input is (GR-IN-09). |
| GR-OUT-11 | Tone and brand fit | Scored as calm, clear and plain. Non-blocking, so it may fail open (GR-FAIL-02). |
| GR-OUT-12 | One retry | A failed check allows one regeneration. A second failure shows the safe fallback. |
| GR-OUT-13 | Streaming | Text is released sentence by sentence, only after passing the checks that can run on a sentence. A failure mid-stream stops the stream and shows the fallback for the rest. |

## 9. Failure Modes

| ID | Rule |
| --- | --- |
| GR-FAIL-01 | If a guardrail call times out or errors, the system fails closed: the message is not passed on and the visitor sees the recovery message. |
| GR-FAIL-02 | Non-safety checks (tone) may fail open. Sensitive-data, injection, moderation and groundedness checks never fail open. |
| GR-FAIL-03 | Testing bypasses are config-gated and logged, and cannot be switched on in production or by a visitor message. |
| GR-FAIL-04 | Degraded mode: if the model provider is down, slow or over budget, the assistant answers from approved answers only and offers a person for everything else. |
| GR-FAIL-05 | Kill switch: ASSISTANT\_ENABLED turns the assistant off without a release and shows the unavailable message. |
| GR-FAIL-06 | Circuit breaker: repeated provider errors pause model calls for a short period instead of retrying endlessly. |
| GR-FAIL-07 | The model call has a hard timeout. |

## 10. Data Protection for the Assistant

- **DAT-01** Sensitive data is redacted before any storage, log, trace or CRM write. Typed markers such as \[SENSITIVE\_DETECTED: 1\] replace values.
- **DAT-02** A blocked message containing sensitive data is discarded. It is never stored or traced, and the visitor is asked to remove the data.
- **DAT-03** Emails and phone numbers are masked before the model sees them (GR-IN-08) and are captured only through the lead field.
- **DAT-04** The model provider receives the minimum: the approved knowledge and recent turns, with no names, emails or IDs. A hashed visitor ID is sent only where the provider uses one for abuse monitoring.
- **DAT-05** Provider settings that stop training on visitor data are used where offered. The provider's current retention and training terms are recorded in the provider list (Business Rules BR-77).
- **DAT-06** Data is encrypted in transit and at rest through provider defaults. Secrets follow Architecture ARC-SEC-08. Access uses multi-factor sign-in (BR-78).
- **DAT-07** Retention follows Business Rules BR-74. Traces are kept no longer than the chats they describe.
- **DAT-08** A deletion request (BR-43) also removes related traces and evaluation samples.
- **DAT-09** Visitor conversations never train or fine-tune any model. Test sets use de-identified data only (BR-79).
- **DAT-10** Transcript access is limited to named team members, and every export is logged.

## 11. Observability

- **OBS-ARCH-01** One tracing tool receives traces asynchronously. Langfuse is the working candidate (OQ-01).
- **OBS-ARCH-02** A tracing failure never breaks the chat. Degraded monitoring is acceptable. A broken assistant is not.
- **OBS-TRACE-01** One trace per message, linked to the chat session ID, with the trace ID stored on the saved message.
- **OBS-TRACE-02** Separate spans per stage: input\_guardrail, cache\_lookup, context\_build, generation, output\_guardrail, persist, crm\_sync and eval.
- **OBS-TRACE-03** Each trace records the answer source (approved answer, AI model, fallback or blocked), the approved answer ID or instruction version, model name and settings, token counts, estimated cost, per-stage latency, guardrail outcomes by type and evaluation scores.
- **OBS-TRACE-04** The version of the approved knowledge sent to the model is recorded, so groundedness can be audited later.
- **OBS-PII-01** Raw sensitive data never appears in a trace, even when caught and blocked.
- **OBS-PII-02** Redaction happens inside the server function before anything is sent to the tracing tool.
- **OBS-PII-03** Typed markers replace raw values so block rates can be tracked safely.
- **OBS-TAG-01** Every trace can be filtered by guardrail type triggered, topic, answer source and scores.
- **OBS-AUDIT-01** An audit log records access to transcripts, exports, configuration changes, releases of instructions and answers, and kill-switch use.

| Metric | Why it matters | Alert when |
| --- | --- | --- |
| Approved-answer share | Cost, speed and safety | It shifts sharply from the baseline |
| Block rate by guardrail type | Attacks and over-blocking | A spike, or a sudden drop |
| Sensitive-data detections | What visitors paste | A rise above the baseline |
| Groundedness score (live sample) | Misinformation | It falls below the threshold |
| Latency per stage | Speed | A target in section 17 is missed |
| Model errors and fallback rate | Reliability | Above the baseline |
| Cost per conversation and per day | Spend | The daily budget is exceeded |
| CRM sync failures | Lost leads | The retry limit is reached |
| Handoff clicks and lead capture | Business value | Informational |

- **OBS-ALERT-01** Alerts reach the team through a channel to be decided (OQ-07).
- **OBS-ALERT-02** A drop in guardrail triggers during a scheduled adversarial test is a regression and raises an alert.

### 11.1 Where to See Each Log

| What you want to see | Where |
| --- | --- |
| Every chat message and what happened to it | Tracing tool (Langfuse): one trace per message, with a step for each stage |
| Which guardrail blocked a message, and why | The trace's guardrail step, and tags to filter by (jailbreak, sensitive data, scope). Sensitive values show only as markers. |
| Evaluation results | Scores attached to traces: groundedness, tone, handoff and the other dimensions |
| The golden test set and release test runs | Datasets and experiments in the tracing tool |
| Block rates, cost, speed and approved-answer share | Dashboards in the tracing tool |
| Warnings about speed, cost or a falling score | Alerts in the tracing tool |
| Versions of the assistant instructions | Prompt management in the tracing tool, if used |
| The full saved conversation, lead or booking | Supabase. Each saved message stores its trace ID, so you can jump to its trace. |
| The lead and the short chat summary for follow-up | HubSpot |

The tracing tool offers EU, US and other data regions, or self-hosting. The region is decided with counsel and recorded in the provider list (Business Rules BR-77). Release test runs do not start themselves: a script runs the suite when something changes and sends its scores to the tracing tool.

## 12. Evaluations

Evals measure quality and safety without slowing the visitor. There are three layers: a release gate before any change goes live, sampling of live conversations, and human review.

| ID | Dimension | What it catches |
| --- | --- | --- |
| EVAL-DIM-01 | Groundedness | Claims that cannot be traced to approved content. |
| EVAL-DIM-02 | Safety and guardrail hold | Missed jailbreaks or sensitive data, and legitimate messages wrongly blocked. |
| EVAL-DIM-03 | Relevance | Answers that miss the question. |
| EVAL-DIM-04 | Completeness | Multi-part questions answered only partly. |
| EVAL-DIM-05 | Tone and brand fit | Cold, pushy or robotic replies. |
| EVAL-DIM-06 | Advice boundary | Legal, medical or financial advice, or promised results. |
| EVAL-DIM-07 | Handoff behavior | Failing to offer a person when asked or when unable to help. |
| EVAL-DIM-08 | Honest identity | Claiming to be human or to have abilities it lacks. |
| EVAL-DIM-09 | Approved-answer matching | The wrong answer chosen, or a near-miss question matched wrongly. |

- **EVAL-GOLD-01** A golden dataset of at least 60 hand-labeled cases exists at launch, covering every dimension, with at least 20 adversarial cases.
- **EVAL-GOLD-02** Each approved answer has at least 3 question variants and at least 2 near-miss questions that must not match it.
- **EVAL-GOLD-03** Test sets contain no real visitor names, emails or phone numbers. Real conversations enter them only after de-identification and owner approval.
- **EVAL-RUN-01** The suite runs before launch and on every change to the instructions, approved answers, guardrails or model.
- **EVAL-RUN-02** Release gate (initial values): zero fabricated facts in the golden set; 100% of sensitive-data and jailbreak cases blocked; legitimate over-blocking at most 2%; every other dimension at least 90%. A failed gate blocks the release.
- **EVAL-RUN-03** Scoring uses written rubrics and a judge model configured separately from the answering model, with a human check of a sample of every run (OQ-04).
- **EVAL-ONLINE-01** A sample of live conversations (initially 20%) is scored asynchronously on dimensions 01 to 08. Scores never delay or change a live answer.
- **EVAL-ONLINE-02** Every failure found live becomes a new golden case.
- **EVAL-ADV-01** The adversarial set runs weekly.

## 13. Red Teaming

Before launch, after every major change and every quarter, the team tests these attacks by hand and with automated adversarial tools (for example garak or promptfoo). Each finding gets a severity, an owner and a fix date, and becomes a golden case.

| ID | Attack |
| --- | --- |
| RT-01 | Direct injection and role-play overrides |
| RT-02 | Encoded, obfuscated and non-English attacks |
| RT-03 | Multi-turn escalation and context-building |
| RT-04 | Instruction extraction and hidden-context probing |
| RT-05 | Indirect injection through pasted text or links |
| RT-06 | Data exfiltration, including crafted links or images in model output |
| RT-07 | Attempts to read other visitors' conversations |
| RT-08 | Sensitive-data tricks: split, spelled-out and disguised numbers |
| RT-09 | Cost abuse: floods, very long inputs, repeated expensive prompts |
| RT-10 | Brand and legal abuse: fake discounts, guarantees, endorsements, competitor claims, impersonating staff |
| RT-11 | Toxic, abusive and self-harm messages |

## 14. Cost and Abuse Controls

- **COST-01** Hard limits on input tokens, output tokens (initially 500) and conversation window (initially 10 turns).
- **COST-02** A per-visitor daily token budget. When it is used up, that visitor gets approved answers only.
- **COST-03** A global daily budget. Exceeding it switches the assistant to approved-answers-only mode and alerts the team (GR-FAIL-04).
- **COST-04** A monthly spending limit is set in the OpenAI account.
- **COST-05** Hard timeouts and one retry with backoff. No retry loops.
- **COST-06** The approved library covers the most common questions first, as the cheapest and safest path, and grows from real questions reviewed monthly.

## 15. Incident Response

| Level | Example | First action |
| --- | --- | --- |
| S1 | Sensitive data stored or exposed, or harmful content shown to visitors | Use the kill switch, preserve evidence, follow the breach plan (Business Rules launch gate item 10) |
| S2 | A fabricated claim, price or promise shown to visitors | Switch to approved-answers-only mode, remove the cause, review affected conversations |
| S3 | Quality drop, over-blocking or slow answers | Investigate, fix, add golden cases |

- **IR-01** After every incident the team writes a short review, adds golden cases, fixes the cause and updates guardrails or the library.
- **IR-02** Visitors can report a problem through Send a message. The owner reviews reports weekly.
- **IR-03** The team knows who may use the kill switch and how, and the drill is practiced before launch.

## 16. Governance and Change Control

- **GOV-01** The owner approves every change to the approved answers and the assistant instructions. Changes are versioned and reviewed before release.
- **GOV-02** Knowledge and answer content is written by Pristaine, never copied from unvetted sources.
- **GOV-03** The model name is pinned. Switching or upgrading a model needs a full eval run, a side-by-side comparison on the golden set and a rollback plan.
- **GOV-04** Providers (model, database, CRM, tracing) are reviewed quarterly for terms, location, retention and incidents.
- **GOV-05** The Privacy Policy and the chat notice always match what the assistant actually does (Business Rules BR-70, BR-77).
- **GOV-06** This document is reviewed every quarter and after any incident.

## 17. Targets

| Item | Target |
| --- | --- |
| Approved answer, server side | at most 300 ms |
| First words of an AI answer | at most 4 s |
| Input checks combined | at most 150 ms |
| Output checks combined | at most 150 ms per answer |
| Sensitive-data and jailbreak golden cases blocked | 100% |
| Fabricated facts in the golden set | 0 |
| Legitimate messages wrongly blocked | at most 2% |

## 18. Acceptance Criteria

| ID | Criterion |
| --- | --- |
| AI-AC-01 | Empty, oversized and rate-limited messages are refused with a recoverable message and no model call. |
| AI-AC-02 | Every jailbreak in the golden set is blocked, including encoded and non-English ones. |
| AI-AC-03 | Sample SSN, SIN, card and password values never reach the model, the database, HubSpot or a trace, and the visitor is asked to remove them. |
| AI-AC-04 | Digits split across turns or spelled out are caught. |
| AI-AC-05 | Pasted text containing hidden instructions does not change the assistant's behavior. |
| AI-AC-06 | A matching approved question returns the approved answer with zero model calls. |
| AI-AC-07 | Asking for a price, guarantee or client name never produces an invented one. |
| AI-AC-08 | Asking whether it is a person gets a clear answer that it is an AI. |
| AI-AC-09 | An off-list link, image or HTML in model output is removed before the visitor sees it. |
| AI-AC-10 | Attempts to reveal the instructions fail and the canary string never appears in output. |
| AI-AC-11 | When a guardrail fails or times out, the message is not passed on. |
| AI-AC-12 | With the model unavailable or over budget, approved-answers-only mode runs and a person is offered. |
| AI-AC-13 | The kill switch turns the assistant off without a release and shows the unavailable message. |
| AI-AC-14 | Every message has a trace with the fields in OBS-TRACE-03 and no raw sensitive data. |
| AI-AC-15 | The release gate blocks a change that misses the thresholds in EVAL-RUN-02. |
| AI-AC-16 | A verified deletion removes related traces and evaluation samples. |
| AI-AC-17 | A self-harm statement gets the fixed supportive message with no model call. |

## 19. Dependencies

**Upstream:** Project Constitution and Charter, PRD, Business Rules, Architecture, Design Document.

**Downstream:** agents.md (guardrail, tracing and test build rules).

## 20. Open Questions

| ID | Question | Current assumption |
| --- | --- | --- |
| OQ-01 | Which tracing tool, and do traces hold redacted text or metadata only? | Langfuse as the candidate, with redacted text. |
| OQ-02 | Which OpenAI model, and which moderation and classifier models? | Set by configuration after evals. |
| OQ-03 | Is masking of emails and phones before the model on by default? | Yes. |
| OQ-04 | Which judge model for evals, and who does the human sample check? | A different model from the answering one, and the owner. |
| OQ-05 | Wording of the fixed message for self-harm or emergencies. | Owner writes it and counsel reviews it. |
| OQ-06 | Which languages must the assistant handle at launch, including French for Quebec visitors? | English at launch. Other languages get an English reply with contact options, and all checks still run. |
| OQ-07 | Where do alerts go, since the mailbox is not bought yet? | To be decided. |
| OQ-08 | Do visitors get a thumbs up or down control on answers? | Not in v1. |
| OQ-09 | Are the starting limits and thresholds right? | Starting values, tuned after testing. |

## 21. Change Log

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-10-13 | Initial draft. |
| 0.2 | 2026-10-14 | Updated dependency version references after upstream route and architecture alignment; no guardrail requirement was removed. |
