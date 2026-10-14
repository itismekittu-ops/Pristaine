# Pristaine: Business Rules

**Version:** 0.4 (Draft — route, booking and legal alignment)  |  **Date:** 2026-10-14  |  **Depends on:** Project Constitution and Charter v0.3, PRD v0.4  |  **Status:** For review

> **Legal review required.** This document turns business and compliance intent into build rules. It is not legal advice. Pristaine must have a qualified lawyer review the privacy, cookie and email rules before launch.

## 1. Purpose

This document defines the rules the website must follow for consultation booking, form handling, consent and cookies, personal data, claims and legal pages, for visitors in the United States and Canada.

## 2. Scope and Out of Scope

**In scope:** the Calendly booking flow, the contact form, the chat assistant and its saved conversations, the CRM sync, the cookie consent banner and policy, personal data handling on the website, website claims, legal pages, and launch gating.

**Out of scope:** data handling inside client AI projects, and newsletters or marketing email (not part of v1).

## 3. Regulatory Basis

The rules below are designed to meet the stricter of these frameworks, so one experience works for all visitors. Counsel confirms applicability.

| Framework | Region | Relevance to the website |
| --- | --- | --- |
| PIPEDA | Canada | Meaningful consent, purpose limitation, access and correction rights. |
| Quebec Law 25 | Quebec | Tracking technologies off by default with opt-in, plain-language privacy policy, a named person responsible for personal information. |
| CASL | Canada | Rules for commercial electronic messages: consent, sender identification, unsubscribe. |
| CCPA / CPRA and other US state privacy laws | United States | Notice at collection, rights to know, delete and opt out, honoring opt-out preference signals. |

**BR-01** The cookie banner and consent rules MUST apply to all visitors. The site MUST NOT rely on location detection to relax them.

## 4. Consultation Booking Rules

- **BR-10** Booking happens through Calendly on the dedicated `/book` page defined in PRD feature F4. Every Book a Consultation button navigates to `/book`.
- **BR-11** The event is a short, free consultation. Placeholder: Free AI Readiness Call, 30 minutes. The website MUST NOT describe it as anything other than a consultation call.
- **BR-12** The Calendly script and its cookies are third-party. On `/book`, if the visitor has accepted the Third-party services category, the scheduler may load. Otherwise, before first load, the visitor sees a short notice: booking is provided by Calendly, it may set cookies, a link to Calendly's privacy policy, a Continue button and an Open in new tab link. Continue loads the scheduler for that session.
- **BR-13** Details the visitor gives Calendly (name, email, time) are handled by Calendly. The Privacy Policy MUST disclose this.
- **BR-14** If the scheduler cannot load, the direct Calendly link opens in a new tab.
- **BR-15** Confirmation and reminder emails come from Calendly. The website sends no marketing email in v1.

## 5. Contact Form Rules

- **BR-20** Required fields: name, email, message. Optional: company, phone. No other fields in v1.
- **BR-21** The form MUST show a consent line before the Submit button, in plain language, linking to the Privacy Policy. Example: We use your details only to reply to your message. See our Privacy Policy.
- **BR-22** The form MUST NOT include a pre-ticked box and MUST NOT sign visitors up for marketing. v1 has no newsletter.
- **BR-23** A reply to a visitor's own inquiry is a response to that inquiry. Any promotional message requires a separate, unticked, express opt-in and an unsubscribe method. This rule applies if marketing is added later.
- **BR-24** Submissions are validated on the server. Spam protection MUST NOT rely on a puzzle that blocks keyboard or screen-reader users. Technical controls are defined in Architecture.
- **BR-25** The form states clearly when it is sending, succeeded or failed, and never loses what the visitor typed after an error.
- **BR-26** Inquiries are saved in the database and synced to HubSpot, where the team sees them. A monitored company mailbox is added once it exists. The target reply time is stated on the page only if the owner can meet it (see OQ-03).
- **BR-27** Inquiry data is kept only as long as needed to respond and manage the relationship. The retention period is set by the owner and counsel (see OQ-04) and written in the Privacy Policy.

## 6. Cookie and Consent Rules

### 6.1 Categories

| Category | Examples | Consent | Default |
| --- | --- | --- | --- |
| Necessary | Storing the consent choice, security, form anti-spam, the chat session ID once a chat starts | Not required | On |
| Analytics | Privacy-respecting usage analytics | Required | Off |
| Third-party services | Calendly scheduler on `/book` | Required, or the notice in BR-12 | Off |

There is no Marketing or advertising category in v1. If one is added, this document changes first and the banner gains that category, off by default.

### 6.2 Banner Behavior

- **BR-30** On a first visit, before any non-necessary script runs, a banner offers Accept all, Reject non-essential and Manage choices, with equal visual weight.
- **BR-31** Manage choices lists each category with a plain explanation and a toggle. All non-necessary toggles start off.
- **BR-32** The banner MUST NOT block reading the site, MUST NOT use deceptive wording or styling, and MUST NOT be dismissed by scrolling or by closing as a hidden acceptance.
- **BR-33** The choice is stored with a timestamp and the policy version. The banner does not reappear until the choice reaches 12 months old or the Privacy Policy/Cookies section version changes.
- **BR-34** A Cookie settings control in the footer reopens the choices at any time. Withdrawing consent MUST be as easy as giving it, and MUST stop the related scripts for the rest of the visit.
- **BR-35** If the browser sends a Global Privacy Control signal, non-essential categories start off and are treated as rejected until the visitor chooses otherwise.
- **BR-36** No analytics, third-party scripts or non-essential storage run before consent. This includes third-party fonts, which MUST be self-hosted or otherwise load with no third-party request before consent.
- **BR-37** The banner is accessible: keyboard operable, focus managed, readable on mobile, and compliant with the Constitution's accessibility gate.

### 6.3 Cookies Section Content

- **BR-38** The Cookies section at `/privacy#cookies` lists every cookie or similar storage item: name, provider, purpose, category and duration. It is updated whenever a script is added or removed.

## 7. Personal Data Rules

- **BR-40** The site collects only what the contact form, the chat assistant, Calendly and consented analytics need. Nothing else.
- **BR-41** The site is for businesses and is not directed at children.
- **BR-42** A named person is responsible for personal information. Their title and a privacy contact address are published in the Privacy Policy (see OQ-05).
- **BR-43** Requests to access, correct or delete personal data are accepted at the privacy contact address and answered within 30 days, covering the database and HubSpot.
- **BR-44** Every provider that receives personal data (hosting, database, AI model, CRM, analytics, Calendly, email) is recorded in a provider list with its purpose and location. Counsel decides whether any transfer needs an assessment before launch (see OQ-06).
- **BR-45** The hero chat bar saves conversations and sends them to an AI model provider, under the rules in section 7.1. The AI Observability and Security document governs how the assistant behaves.

### 7.1 Chat, Database and CRM Rules

- **BR-70** Before a visitor's first message, a notice beside the chat bar MUST say that this is an AI assistant, that the conversation is saved, that an AI provider processes it, and that sensitive details should not be entered, with a link to the Privacy Policy. Nothing from a chat is saved until the first message is sent.
- **BR-71** Answers come first from the library of approved answers. The AI model is used only when no approved answer fits. Facts about Pristaine's services, process and company MUST come from approved content only. The assistant MUST NOT quote prices, promise results, or invent clients, statistics or credentials (BR-50, BR-55).
- **BR-72** The assistant MUST NOT claim to be a person, and it offers Book a Consultation and Send a message at any point.
- **BR-73** Sensitive data MUST NOT be sent to the AI model, saved in the database or sent to HubSpot. This covers government-issued IDs (SSN, SIN, driver's licence, passport), payment and account data, authentication data (PINs, passwords, security answers) and biometric data. The assistant MUST NOT ask for these or for health details, and tells the visitor not to share them if offered.
- **BR-74** Anonymous conversations are stored under a random visitor ID and are linked to a person only when the visitor shares an email beside a consent line. Anonymous conversations are deleted automatically after 90 days unless counsel sets a different period (see OQ-04). Retention for leads follows BR-27.
- **BR-75** IP addresses are stored only in shortened or hashed form, and only for abuse protection.
- **BR-76** HubSpot receives form leads and, for conversations with a known email, a short summary. It does not receive raw transcripts or anonymous chats. Every contact created from the site is a non-marketing contact.
- **BR-77** The AI model provider, the database provider and the CRM are each recorded in the provider list (BR-44) with their purpose, data location, and current retention and training terms. Settings that stop a provider from training on visitor data MUST be used where offered. The Privacy Policy names each provider's role.
- **BR-78** Access to the database and HubSpot is limited to named team members using multi-factor sign-in, and every export is logged.
- **BR-79** Conversations used to test or improve the assistant are de-identified first, and test sets contain no real names, emails or phone numbers.

## 8. Claims and Content Rules

- **BR-50** The site MUST NOT show invented clients, testimonials, statistics, awards or certifications.
- **BR-51** A compliance claim (for example, PIPEDA compliant) MUST NOT be made unless it is true, and the owner has approved the wording.
- **BR-52** A client logo, quote or case study MUST NOT appear without that client's written permission.
- **BR-53** Technology logos in a Works with strip MUST follow each owner's brand guidelines.
- **BR-54** AI-generated images and video MUST NOT show real, identifiable people, and MUST NOT imply real clients or testimonials.
- **BR-55** Statements about AI performance (accuracy, time saved, cost saved) need a documented basis before they are published.
- **BR-56** Content limits are those in PRD section 8. Extra detail goes behind an info (i) icon, tooltip or expandable panel.

## 9. Legal Pages

- **BR-60** The Privacy Policy, including its Cookies section, is drafted with legal review, in clear and simple language, and shows a version and last-updated date.
- **BR-61** The Privacy Policy covers: what is collected; why; who receives it; how long it is kept; visitor rights and how to use them; the responsible person and contact; how consent is given and withdrawn.
- **BR-62** The Privacy Policy is linked from the footer and contact form consent line. The footer includes a Cookie settings control that reopens consent choices.
- **BR-63** Changing the Privacy Policy or its Cookies section updates the policy version. A version change triggers the banner again (BR-33).

## 10. Launch Gate

The site MUST NOT launch until all of these are true:

1. The Privacy Policy, including its Cookies section, is reviewed and published.
2. The consent banner is tested: no non-essential request before consent, and rejection and withdrawal work.
3. The Calendly event is live and tested, including the fallback link.
4. The contact form delivers to a monitored mailbox, and the privacy contact mailbox works.
5. No placeholder copy, logos or contact details remain.
6. The Pristaine trademark search (USPTO and CIPO) has been done.
7. The provider list and cookie list match what the site actually loads.
8. The chat notice, sensitive-data blocking, deletion across the database and HubSpot, and the non-marketing setting in HubSpot are tested.
9. The Privacy Policy names the AI model provider, the database provider and the CRM, and counsel has approved the data locations and retention periods.
10. A written incident plan exists for a data breach, covering who is told and when, as counsel advises.

## 11. Acceptance Criteria

| ID | Criterion |
| --- | --- |
| AC-01 | On first load, the banner shows three equal-weight options and the network log shows no analytics, Calendly or other third-party requests. |
| AC-02 | After Reject non-essential, reloading the page shows no banner and no non-essential requests. |
| AC-03 | After Accept all, the banner stays away on later visits until 12 months pass or the policy version changes. |
| AC-04 | Cookie settings in the footer reopens choices, and turning a category off stops its scripts. |
| AC-05 | With a Global Privacy Control signal on, non-essential categories start off. |
| AC-06 | Clicking Book a Consultation opens `/book`. Without prior consent, the page shows the Calendly notice; Continue loads the scheduler, and Open in new tab opens Calendly separately. |
| AC-07 | The contact form cannot be submitted without name, email and message, and shows the consent line and Privacy Policy link. |
| AC-08 | Every cookie or storage item observed in the browser appears in the Cookies section at `/privacy#cookies`. |
| AC-09 | A search of the site finds no unverified client names, testimonials or statistics. |
| AC-10 | All ten launch gate items are checked off before release. |
| AC-11 | The chat notice shows beside the input before the first message, and nothing is saved until a message is sent. |
| AC-12 | A message containing a card number, SIN, SSN or password never reaches the AI model, the database or HubSpot. |
| AC-13 | A verified deletion request removes the person from the database and HubSpot within 30 days. |
| AC-14 | Contacts created by the site are non-marketing in HubSpot, and anonymous chats never reach HubSpot. |

## 12. Dependencies

**Upstream:** Project Constitution, PRD. **Downstream:** Architecture, AI Observability and Security, Design Document (banner and form states), AEO/SEO Document (legal pages), agents.md.

## 13. Open Questions

| ID | Question | Current assumption |
| --- | --- | --- |
| OQ-01 | Which analytics tool will be used, if any? | One privacy-respecting tool, gated by consent. |
| OQ-02 | Calendly event name and duration. | Free AI Readiness Call, 30 minutes. |
| OQ-03 | What reply time can the owner promise on the contact form? | State none until confirmed. |
| OQ-04 | How long are inquiries kept? | To be set by the owner and counsel. |
| OQ-05 | Who is the named person responsible for personal information, and what is the privacy contact address? | To be provided by the owner. |
| OQ-06 | Do hosting, form handling or Calendly involve transfers that need an assessment, including for Quebec visitors? | Counsel to confirm before launch. |
| OQ-07 | Is Pristaine registered as a business in Canada, the US, or both? This affects the legal entity named in the policies. | To be provided by the owner. |
| OQ-08 | Which region will hold the database, and does counsel approve the data locations of the database, AI model and CRM providers, including for Quebec visitors? | Counsel to confirm before launch. |
| OQ-09 | Is the chat session ID classed as Necessary storage, and does saving conversations need an explicit consent step beyond the notice in BR-70? | Notice only. Counsel to confirm. |

## 14. Change Log

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-10-13 | Initial draft. |
| 0.2 | 2026-10-13 | Updated references to match PRD v0.2 story IDs and section numbers. No rule changed. |
| 0.2 (update 2) | 2026-10-13 | Owner decision: live assistant with database and HubSpot. Added section 7.1 (BR-70 to BR-79), launch gate items 8 to 10, AC-11 to AC-14, OQ-08 and OQ-09; updated BR-26, BR-40, BR-43, BR-44, BR-45 and the scope. |
| 0.4 | 2026-10-14 | Aligned booking to `/book` and cookie details to the Cookies section in `/privacy#cookies`. |
