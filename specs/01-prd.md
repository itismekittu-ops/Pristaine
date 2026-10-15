# Pristaine: Product Requirements Document (PRD)

**Version:** 0.5 (Draft — implementation batching alignment)  |  **Date:** 2026-10-15  |  **Depends on:** Project Constitution and Charter v0.4  |  **Status:** For review

## 1. Purpose

This document defines what the pristaine.com website must do: its goals, audience, pages, and the features and user stories that Bolt will build. It does not define legal rules (see Business Rules), technology (see Architecture) or visual styling (see Design Document).

## 2. Scope and Out of Scope

**In scope:** all pages in the sitemap (section 5) and the features and user stories in section 7.

**Out of scope for v1:** user accounts, e-commerce, client portals, multilingual versions, and a dark/light theme toggle.

## 3. Goals and Success Measures

| ID | Goal | Measure |
| --- | --- | --- |
| G1 | Get qualified visitors to book a consultation | Consultations booked through Calendly per 100 visits |
| G2 | Give visitors a second, low-commitment way to reach Pristaine | Contact form submissions per 100 visits |
| G3 | Communicate trust and clarity within the first screen | Hero-to-next-section scroll rate; user test comprehension |
| G4 | Be fast and accessible | Constitution gates QG-01 and QG-02 met |

Targets for G1 to G3 are set after 30 days of real traffic. Until then they are tracked as baselines.

## 4. Audience and Positioning

**Audience:** small and mid-sized businesses (roughly 10 to 500 employees) in the US and Canada that handle many customer calls, chats and inquiries. Example verticals: clinics, home services, real estate, legal, financial services, e-commerce.

**Positioning:** Pristaine builds clean, reliable AI for customer conversations and operations, with guardrails, testing and measurable results built in.

**Proof points** (one short line each, no paragraphs): tested before launch; privacy-first for the US and Canada; built around your existing tools.

**Services, in order:**

| Order | Service | Slug | Role |
| --- | --- | --- | --- |
| 1 | Conversational AI and Chatbots | conversational-ai | Answer customers instantly on your site and messaging channels |
| 2 | Voice AI | voice-ai | AI phone agents that answer, qualify and book calls |
| 3 | AI Solutions | ai-solutions | Custom automations and integrations built around your workflow |
| 4 | AI Consultation | ai-consultation | Find where AI pays off first, with a clear roadmap |

These definitions live in the services data file (Constitution SSOT-02). Names and slugs are provisional until the owner confirms them.

## 5. Sitemap

The framework migration exposes the routes that have an existing UI shell. Routes marked Planned are not added to the production sitemap until their approved page UI and copy are implemented.

| Route | Page | UI status |
| --- | --- | --- |
| / | Home | Existing Magic Pattern UI |
| /about | About | Existing shell; full About copy still requires owner approval |
| /services | Services overview | Existing Magic Pattern UI |
| /book | Booking information | Existing shell; consent-aware Calendly flow pending |
| /privacy | Privacy Policy and Cookies section | Existing shell; complete legal copy pending owner and legal review |
| /services/conversational-ai | Conversational AI service page | Planned; UI and page copy pending |
| /services/voice-ai | Voice AI service page | Planned; UI and page copy pending |
| /services/ai-solutions | AI Solutions service page | Planned; UI and page copy pending |
| /services/ai-consultation | AI Consultation service page | Planned; UI and page copy pending |
| /insights | Insights index | Planned; UI pending |
| /insights/[slug] | Insight article | Planned; article body, author and dates pending |

There is no separate Cookie Policy route in v1. Cookie information lives at `/privacy#cookies`. The former `/privacy-policy` and `/cookie-policy` paths redirect to the current route for compatibility. The sitemap lists only implemented public routes.

## 6. Story Format and Rules

Every feature in section 7 is defined by user stories with independent, testable acceptance criteria. A story describes one behavior; implementation prompts MAY group multiple closely related stories into one feature batch when they share a subsystem or workflow and their dependencies are satisfied. Follow the batching and verification rules in `AGENTS.md`. Batching MUST NOT change story IDs, acceptance criteria, priorities or dependencies.

```markdown
#### (F1-US1) Story title

**Priority:** Must or Should  |  **Release:** v1 or Later

**As a** visitor type, **I want** one behavior, **so that** outcome.

**Acceptance criteria**

1. **Given** a starting state, **when** an action, **then** an observable result.

**Dependencies:** story IDs  |  **Refs:** rule IDs in other specs
```

**Rules**

- One story describes one behavior. If it needs more than six acceptance criteria, split it.
- A story says what the visitor gets. Technology, table names and class names belong in Architecture and Design.
- Behavior with no human actor (logging, rate limits) is a numbered requirement in the spec that owns it, not a story.
- Every acceptance criterion is testable. Words like fast, nice or easy are replaced with a measurable result.
- A story is done when every criterion passes and the Constitution's Definition of Done (section 5.8) is met.
- Build in dependency order, Must before Should.
- Story IDs are permanent. A retired story is marked Removed and its ID is never reused.

## 7. Features and User Stories

The site has nine features, F1 to F9, and each feature lists its stories in build order.

### F1: Global Navigation

The navbar and footer appear on every page. The objective is to let a visitor reach any service, About or booking in one or two actions, with nothing else competing for attention.

#### (F1-US1) Use a clean navbar

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** a navbar with only the logo, About, Services and Book a Consultation, **so that** I always know where to go next.

**Acceptance criteria**

1. **Given** any page, **when** it loads, **then** the navbar shows only the logo, About, Services and a Book a Consultation button.
2. **Given** the navbar, **when** I click the logo, **then** Home opens.
3. **Given** the navbar, **when** I click About, **then** /about opens.
4. **Given** the navbar, **when** I click the Services text, **then** /services opens.
5. **Given** I scroll, **when** the page moves, **then** the navbar stays visible and the current page is indicated.
6. **Given** I click Book a Consultation, **when** the click registers, **then** the booking flow in F4-US1 starts.

**Dependencies:** none  |  **Refs:** Constitution UX-04

#### (F1-US2) Open the Services dropdown

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** a dropdown under Services that lists each service, **so that** I can jump straight to the one I need.

**Acceptance criteria**

1. **Given** a desktop pointer, **when** I hover or focus Services, **then** a dropdown opens with the four services, each showing its name and one-line description, plus a View all services link.
2. **Given** the dropdown is open, **when** I click a service, **then** that service's page opens.
3. **Given** I use a keyboard or touch, **when** I activate the chevron button beside Services, **then** the dropdown opens or closes, and the Services text stays a plain link to /services.
4. **Given** the dropdown is open, **when** I press Escape or click outside it, **then** it closes and focus returns to the chevron button.
5. **Given** a service name changes in the services data file, **when** the site rebuilds, **then** the dropdown shows the change with no other edit.

**Dependencies:** F1-US1  |  **Refs:** Constitution SSOT-02, QG-01

#### (F1-US3) Use the menu on a small screen

**Priority:** Must  |  **Release:** v1

**As a** mobile visitor, **I want** a simple menu, **so that** I can reach every page with one hand.

**Acceptance criteria**

1. **Given** a screen below the mobile breakpoint set in the Design Document, **when** the page loads, **then** the navbar shows the logo and a menu button.
2. **Given** I open the menu, **when** it appears, **then** it lists About, a Services accordion (text link plus chevron button) and Book a Consultation.
3. **Given** the menu is open, **when** I choose an item or press Escape, **then** the menu closes.
4. **Given** the menu is open, **when** I tab through it, **then** focus stays inside the menu and the page behind does not scroll.
5. **Given** a screen 360 px wide or more, **when** the page loads, **then** a compact Book a Consultation button stays visible beside the menu button. Below 360 px it is the first menu item.

**Dependencies:** F1-US1, F1-US2  |  **Refs:** PRD sitemap

#### (F1-US4) Find essentials in a minimal footer

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** a short footer with the links I might need, **so that** I can find legal pages, contact details and cookie settings.

**Acceptance criteria**

1. **Given** any page, **when** I scroll to the bottom, **then** the footer shows the logo and a one-line tagline, a Services group (the four services), a Company group (About, Insights), a Legal group (Privacy Policy), a contact email, a Cookie settings control and the copyright.
2. **Given** the footer, **when** I count its links, **then** there are 12 or fewer.
3. **Given** I click Cookie settings, **when** the click registers, **then** my cookie choices reopen (F6-US3).
4. **Given** the services data file changes, **when** the site rebuilds, **then** the footer Services links change with it.

**Dependencies:** F6-US3  |  **Refs:** Business Rules BR-62, OQ-01

### F2: Hero and Chat Bar

The hero is the first screen of Home. The objective is to say what Pristaine does in one glance and give the visitor a familiar place to start, a large chat bar backed by a working assistant.

#### (F2-US1) See the hero message

**Priority:** Must  |  **Release:** v1

**As a** first-time visitor, **I want** to understand what Pristaine does within one screen, **so that** I know whether to keep reading.

**Acceptance criteria**

1. **Given** I land on Home, **when** the first screen loads, **then** it shows the headline (10 words or fewer, owner-provided; placeholder: Reliable AI for every customer conversation), the chat bar and the brand strip.
2. **Given** the hero loads, **when** motion is allowed, **then** a background video or 3D visual loops through four clips, one per service, with a short caption naming the current service.
3. **Given** any frame of the background, **when** I read the headline and chat bar, **then** their text meets WCAG 2.2 AA contrast.
4. **Given** reduced motion or data-saver is on, **when** the hero loads, **then** a poster image shows and no video plays.
5. **Given** the video is slow or fails to load, **when** the hero renders, **then** the poster image shows and the page stays usable.

**Dependencies:** none  |  **Refs:** Constitution QG-02, QG-03, QG-04, MM-01, MM-03

#### (F2-US2) Type a question in the chat bar

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** a large, familiar chat bar, **so that** I can type a question the way I would in a search engine.

**Acceptance criteria**

1. **Given** the hero, **when** it renders, **then** a large, centered input shows, labeled as an AI assistant, with a placeholder prompt and a submit button.
2. **Given** I focus the input, **when** it receives focus, **then** a visible focus state shows.
3. **Given** I type, **when** I reach the maximum length defined in the AI Observability and Security document, **then** I can type no more and a short message tells me why.
4. **Given** the input is empty, **when** I press Enter or the submit button, **then** nothing is sent and a short hint asks me to type a question.
5. **Given** a screen reader, **when** it reaches the input, **then** it announces an accessible label that includes that this is an AI assistant.

**Dependencies:** F2-US1  |  **Refs:** Constitution SEC-04

#### (F2-US3) Ask the assistant and get an answer

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** a quick, accurate answer to my question, **so that** I learn what Pristaine can do for me without waiting for a person.

**Acceptance criteria**

1. **Given** I submit a question that matches an approved answer, **when** the assistant replies, **then** the approved answer appears at once and no AI model is called.
2. **Given** I submit any other question, **when** the assistant replies, **then** the answer begins to appear within 4 seconds and uses only Pristaine's approved content for facts about its services, process and company.
3. **Given** the assistant does not know an answer, or I ask for a price or a guarantee, **when** it replies, **then** it says so plainly and offers Book a Consultation and Send a message.
4. **Given** any answer, **when** I read it, **then** it is labeled as coming from the AI assistant and never claims to be a person.
5. **Given** I send several messages, **when** I scroll the conversation, **then** earlier messages and answers stay visible in order, and a screen reader announces each new answer.
6. **Given** my message contains sensitive data such as a card number, SIN, SSN or password, **when** I send it, **then** it is not sent to the AI model and not saved, and the assistant asks me to remove it.

**Dependencies:** F2-US2, F2-US5, F4-US1, F9-US2  |  **Refs:** Constitution SEC-04 and Honest AI, Business Rules BR-45, AI Observability and Security document

#### (F2-US4) See the brand strip

**Priority:** Should  |  **Release:** v1

**As a** visitor, **I want** to see the technologies or partners Pristaine works with, **so that** I can judge its credibility.

**Acceptance criteria**

1. **Given** the hero, **when** motion is allowed, **then** a slow strip of logos moves along the bottom in a seamless loop.
2. **Given** the strip is moving, **when** I hover over or focus it, **then** it pauses.
3. **Given** reduced motion is on, **when** the hero loads, **then** the logos show as a static row.
4. **Given** any logo, **when** I check the site, **then** it appears only with permission or under its brand guidelines. If none are approved, the strip is hidden.
5. **Given** a screen reader, **when** it reaches the strip, **then** each logo has alt text with the company name and the strip is not a keyboard trap.

**Dependencies:** F2-US1  |  **Refs:** Business Rules BR-50, BR-52, BR-53, OQ-03

#### (F2-US5) Know the chat is saved

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** to know before I type that the chat is saved and processed by an AI provider, **so that** I can decide what to share.

**Acceptance criteria**

1. **Given** the chat bar, **when** it renders, **then** a short notice beside it says this is an AI assistant, the conversation is saved, and sensitive details should not be entered, with a link to the Privacy Policy.
2. **Given** the notice, **when** I use the chat, **then** it stays visible and is not hidden by a dismiss button.
3. **Given** a screen reader, **when** it reaches the input, **then** it reads the notice together with the input label.
4. **Given** I have not sent a message, **when** I browse the page, **then** nothing from the chat has been saved.

**Dependencies:** F2-US2  |  **Refs:** Business Rules chat data rules, BR-45

#### (F2-US6) Recover when something goes wrong

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** a clear message and a way forward when the assistant cannot answer, **so that** I am never left at a dead end.

**Acceptance criteria**

1. **Given** the AI service is slow, down or over its limit, **when** I ask a question, **then** a message says the assistant is unavailable and offers Book a Consultation and Send a message.
2. **Given** I send messages too quickly, **when** the limit is reached, **then** I am asked to wait a moment and my typed text is kept.
3. **Given** a safety check blocks my message, **when** the reply appears, **then** it gives a plain-language reason and a way to rephrase or reach a person, never a bare error.
4. **Given** any failure, **when** it happens, **then** my earlier messages stay visible.

**Dependencies:** F2-US3  |  **Refs:** AI Observability and Security document

#### (F2-US7) Reach a person at any point

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** Book a Consultation and Send a message always available in the chat, **so that** I can talk to a person whenever I prefer.

**Acceptance criteria**

1. **Given** the chat is open, **when** I look at it, **then** both actions are visible without scrolling.
2. **Given** I ask for a person, **when** the assistant replies, **then** it offers both actions and does not try to talk me out of it.
3. **Given** I choose Send a message, **when** the click registers, **then** the page scrolls to the Contact form and focus moves to its first field.

**Dependencies:** F2-US3, F4-US1, F5-US1  |  **Refs:** Constitution Human in the loop

#### (F2-US8) Leave my details in the chat

**Priority:** Should  |  **Release:** v1

**As a** visitor, **I want** to share my email in the chat if I want a follow-up, **so that** the team can contact me.

**Acceptance criteria**

1. **Given** I ask for a follow-up or show interest in a consultation, **when** the assistant replies, **then** it may offer once to take my email, and I can decline without penalty.
2. **Given** I choose to share my email, **when** the field appears, **then** a consent line sits beside it and I can still leave without entering anything.
3. **Given** I decline, **when** the chat continues, **then** the offer is not repeated in that session.
4. **Given** I share my email, **when** it is sent, **then** it becomes a lead linked to this conversation and appears in HubSpot (F9-US3).

**Dependencies:** F9-US1, F9-US3  |  **Refs:** Business Rules BR-21, BR-22

### F3: Home Sections

The Home page continues below the hero in this order: What We Build, How It Works, CTA, Insights, FAQ, then Contact (F5). What We Build, How It Works and CTA are dark. Insights and FAQ are light, for readability and rhythm. The objective is for the visitor to understand the offer, see the process, and be asked once, clearly, to act.

#### (F3-US1) Choose a service from cards

**Priority:** Must  |  **Release:** v1

**As a** prospect, **I want** one card per service, **so that** I can pick what fits and go straight to its page.

**Acceptance criteria**

1. **Given** the What We Build section, **when** it renders, **then** one full-width card per service appears in service order, each with the service name, a description of 15 words or fewer, and an arrow.
2. **Given** a card, **when** I click anywhere on it, **then** that service's page opens.
3. **Given** a desktop screen and motion allowed, **when** I scroll, **then** the cards stack and overlap in sequence.
4. **Given** a small screen or reduced motion, **when** the section renders, **then** the cards show as a simple vertical list with no overlap.
5. **Given** keyboard focus on a card, **when** it is focused, **then** a visible focus state shows and the link name is the service name.
6. **Given** a service changes in the services data file, **when** the site rebuilds, **then** the cards change with it.

**Dependencies:** F7-US3 (link targets)  |  **Refs:** Constitution SSOT-02, QG-03

#### (F3-US2) Understand how Pristaine works

**Priority:** Must  |  **Release:** v1

**As a** prospect, **I want** three short steps with timing, **so that** I know what happens after I get in touch.

**Acceptance criteria**

1. **Given** the section, **when** it renders, **then** three steps appear, each with a number, a short title, a description of 30 words or fewer, and a timeline label.
2. **Given** a desktop screen and motion allowed, **when** I scroll, **then** the active step changes and a visual (animated orb or diagram) shows the active step and overall progress.
3. **Given** a small screen or reduced motion, **when** the section renders, **then** the steps stack vertically with a static visual.
4. **Given** the owner has not confirmed the steps, **when** the section is built, **then** it uses the placeholders Discover (week 1), Build (weeks 2 to 6) and Measure and improve (ongoing).
5. **Given** a screen reader, **when** it reads the section, **then** the steps are read in order and the progress visual is hidden from it or described in text.

**Dependencies:** none  |  **Refs:** Constitution MM-01, QG-03, OQ-04

#### (F3-US3) Book from a closing call to action

**Priority:** Must  |  **Release:** v1

**As a** prospect who has read the page, **I want** one clear action, **so that** I can book without searching for it.

**Acceptance criteria**

1. **Given** the CTA section, **when** it renders, **then** it shows a headline of 10 words or fewer and one Book a Consultation button over an animated or video background.
2. **Given** any frame of the background, **when** I read the headline and button, **then** their text meets WCAG 2.2 AA contrast.
3. **Given** I click the button, **when** the click registers, **then** the booking flow in F4-US1 starts.
4. **Given** reduced motion or data-saver is on, **when** the section renders, **then** a still image replaces the moving background.

**Dependencies:** F4-US1  |  **Refs:** Constitution MM-01, UX-01

#### (F3-US4) Browse insights

**Priority:** Should  |  **Release:** v1

**As a** prospect, **I want** to skim recent articles, **so that** I can judge Pristaine's expertise.

**Acceptance criteria**

1. **Given** published articles exist, **when** the section renders, **then** a horizontal carousel shows up to six cards, newest first, each with an image, up to two tag pills, a title, a one-line summary and the read time.
2. **Given** a desktop pointer, **when** I hover a card, **then** a cursor labeled Read follows the mouse. On touch and keyboard, each card shows a visible Read link instead.
3. **Given** the carousel, **when** I use it, **then** it has previous and next buttons, supports swipe on touch, and is fully operable by keyboard.
4. **Given** I click a card, **when** the click registers, **then** /insights/\[slug\] opens. **Given** I click View all insights, **then** /insights opens.
5. **Given** no articles are published, **when** the page renders, **then** the whole section is hidden rather than shown empty.

**Dependencies:** F7-US4  |  **Refs:** Constitution UX-03, OQ-01

#### (F3-US5) Get quick answers in the FAQ

**Priority:** Must  |  **Release:** v1

**As a** prospect, **I want** short answers to common questions, **so that** I do not have to ask.

**Acceptance criteria**

1. **Given** the FAQ section, **when** it renders, **then** an accordion shows 6 to 8 questions covering what each service does, project length, data and privacy, how the AI is tested, which tools it connects to, and what is needed to start.
2. **Given** a question, **when** I activate it by click, Enter or Space, **then** its answer expands and the control reports its expanded state to assistive technology.
3. **Given** any answer, **when** I read it, **then** it is 60 words or fewer, and longer detail sits behind an info (i) icon.
4. **Given** reduced motion is on, **when** an answer opens, **then** it appears with no animation.
5. **Given** the FAQ copy, **when** it is compared with the FAQPage structured data, **then** the two match word for word (F8-US3).

**Dependencies:** none  |  **Refs:** Constitution UX-03, QG-03, OQ-04

### F4: Consultation Booking

Every Book a Consultation button navigates to the dedicated `/book` page. The objective is a clear, consent-aware booking path that does not load Calendly before the visitor chooses to continue. The event is a short free call; the event name and duration remain owner decisions (OQ-02).

#### (F4-US1) Book a consultation on the booking page

**Priority:** Must  |  **Release:** v1

**As a** prospect, **I want** a dedicated place to review the booking notice and choose a time, **so that** I understand when Calendly will load.

**Acceptance criteria**

1. **Given** any Book a Consultation button (navbar, hero, CTA, service pages or Contact), **when** I activate it, **then** I navigate to `/book`.
2. **Given** I have not chosen to book, **when** I browse the site, **then** the Calendly script has not loaded.
3. **Given** I open `/book` without prior Third-party services consent, **when** the page is ready, **then** I see the Calendly notice and can choose Continue or Open in new tab before Calendly loads.
4. **Given** I finish booking, **when** Calendly shows its confirmation, **then** the confirmation is visible and I can return to the site.
5. **Given** the event is changed in configuration, **when** the site is redeployed, **then** `/book` uses the new configured event without changing every button.

**Dependencies:** F4-US2  |  **Refs:** Business Rules BR-10, BR-11, Constitution SSOT-06

#### (F4-US2) Understand third-party loading before booking

**Priority:** Must  |  **Release:** v1

**As a** prospect who has not accepted third-party services, **I want** to know that Calendly will load, **so that** I can decide.

**Acceptance criteria**

1. **Given** I accepted the Third-party services category, **when** I open `/book`, **then** the scheduler loads without showing the consent notice again.
2. **Given** I have not accepted it, **when** I open `/book`, **then** a short notice says booking is provided by Calendly and may set cookies, with a link to Calendly's privacy policy, a Continue button and an Open in new tab link.
3. **Given** the notice, **when** I choose Continue, **then** the scheduler loads on `/book` for this session.
4. **Given** the notice, **when** I choose Open in new tab, **then** Calendly's page opens in a new tab and nothing from Calendly loads on this page.
5. **Given** the notice, **when** I use only a keyboard, **then** I can operate every control and focus stays inside the notice until it closes.

**Dependencies:** F6-US2  |  **Refs:** Business Rules BR-12

#### (F4-US3) Still book if the scheduler fails

**Priority:** Must  |  **Release:** v1

**As a** prospect whose browser blocks the embedded scheduler, **I want** a working fallback, **so that** I can still book.

**Acceptance criteria**

1. **Given** the Calendly scheduler fails or is blocked on `/book`, **when** I activate the fallback, **then** the direct Calendly link opens in a new tab.
2. **Given** the fallback is used, **when** the page responds, **then** I never see an error message without a way forward.

**Dependencies:** F4-US1  |  **Refs:** Business Rules BR-14

### F5: Contact Form

The Contact section is the second, lower-commitment way to reach Pristaine. It is dark and has two columns: a short intro and contact details on the left, the form on the right. The objective is a form short enough that nobody abandons it.

#### (F5-US1) Send a message

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** a short form, **so that** I can contact Pristaine without booking a call.

**Acceptance criteria**

1. **Given** the Contact section, **when** it renders, **then** the left column shows a heading, one short line, the contact email and a Book a Consultation link, and the right column shows the form.
2. **Given** the form, **when** I view it, **then** name, email and message are required, company and phone are optional, and there are no other fields.
3. **Given** I fill in valid details, **when** I submit, **then** the message is saved and sent to the team's CRM, and a success message replaces the form.
4. **Given** the form, **when** I read above the Submit button, **then** a plain-language consent line links to the Privacy Policy, with no pre-ticked box and no marketing sign-up.
5. **Given** I submit, **when** the request is sending, **then** the button shows a loading state and cannot be pressed twice.
6. **Given** the section, **when** I read it, **then** it shows no statistics or claims that cannot be verified.

**Dependencies:** none  |  **Refs:** Business Rules BR-20, BR-21, BR-22, BR-26, BR-50

#### (F5-US2) Fix mistakes easily

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** clear error help, **so that** I can fix a problem without retyping.

**Acceptance criteria**

1. **Given** a required field is empty or the email is invalid, **when** I submit, **then** the field is marked, a plain-language error sits beside it, and focus moves to the first error.
2. **Given** an error, **when** I look at the field, **then** the error is not shown by color alone.
3. **Given** a server error, **when** I submit, **then** a message says my message was not sent, offers a retry and the contact email, and keeps everything I typed.
4. **Given** spam protection, **when** it runs, **then** it does not rely on a puzzle that blocks keyboard or screen-reader users.

**Dependencies:** F5-US1  |  **Refs:** Business Rules BR-24, BR-25, Constitution QG-05

### F6: Consent and Legal

The cookie banner and the legal pages give visitors in the US and Canada control over their data. The objective is a consent flow that is honest, equal in weight between yes and no, and as easy to undo as to give. The rules behind it are in the Business Rules document.

#### (F6-US1) Choose cookie settings on first visit

**Priority:** Must  |  **Release:** v1

**As a** first-time visitor, **I want** a clear banner, **so that** I decide what is stored on my device.

**Acceptance criteria**

1. **Given** my first visit, **when** the page loads, **then** a banner offers Accept all, Reject non-essential and Manage choices with equal visual weight, before any non-essential script runs.
2. **Given** the banner, **when** I choose Accept all or Reject non-essential, **then** it closes, my choice is stored with a timestamp and the policy version, and it does not return until 12 months pass or the Privacy Policy/Cookies section version changes.
3. **Given** the banner is showing, **when** I scroll or try to read the page, **then** I can still do so, and scrolling or closing the banner does not count as consent.
4. **Given** my browser sends a Global Privacy Control signal, **when** the banner loads, **then** non-essential categories start off and count as rejected until I choose otherwise.
5. **Given** any visitor in any location, **when** the page loads, **then** the same banner appears.
6. **Given** the banner, **when** I use a keyboard or a phone, **then** every control is operable and readable.

**Dependencies:** none  |  **Refs:** Business Rules BR-01, BR-30, BR-32, BR-33, BR-35, BR-36, BR-37, Constitution SEC-01

#### (F6-US2) Manage choices by category

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** to choose by category, **so that** I allow only what I want.

**Acceptance criteria**

1. **Given** I choose Manage choices, **when** the panel opens, **then** it lists Necessary (always on), Analytics and Third-party services, each with a plain explanation and a toggle, and the two optional categories start off.
2. **Given** I save my choices, **when** I confirm, **then** they are stored as in F6-US1.
3. **Given** Analytics is off, **when** I browse, **then** no analytics request is made.
4. **Given** Third-party services is off, **when** I open `/book`, **then** the notice in F4-US2 appears before the scheduler loads.

**Dependencies:** F6-US1  |  **Refs:** Business Rules BR-31, Section 6.1

#### (F6-US3) Change my mind later

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** to reopen my choices at any time, **so that** I can withdraw consent as easily as I gave it.

**Acceptance criteria**

1. **Given** any page, **when** I click Cookie settings in the footer, **then** the choices reopen with my current settings shown.
2. **Given** I turn a category off and save, **when** the change applies, **then** the scripts for that category stop for the rest of my visit.

**Dependencies:** F6-US1, F1-US4  |  **Refs:** Business Rules BR-34

#### (F6-US4) Read the legal pages

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** to read in plain language how my data is handled, **so that** I can trust Pristaine.

**Acceptance criteria**

1. **Given** the footer, **when** I click Privacy Policy, **then** /privacy (the Cookies section is at /privacy#cookies) opens.
2. **Given** the contact form consent line, **when** I click its link, **then** the Privacy Policy opens.
3. **Given** the Privacy Policy, **when** I read it, **then** it shows its version and last-updated date.
4. **Given** the Privacy Policy, **when** I read it, **then** it covers what is collected, why, who receives it, how long it is kept, my rights and how to use them, the responsible person and contact, and how consent is given and withdrawn.
5. **Given** the Cookies section at `/privacy#cookies`, **when** I read it, **then** it lists every cookie or storage item with its name, provider, purpose, category and duration.

**Dependencies:** none  |  **Refs:** Business Rules BR-38, BR-60, BR-61, BR-62, BR-63, Launch Gate

### F7: Content Pages (UI pending)

These pages have content and behavior defined now, and layout criteria are added to each story once the owner supplies the designs. All pages use the navbar, footer and consent behavior from F1 and F6.

#### (F7-US1) Learn who Pristaine is

**Priority:** Must  |  **Release:** v1

**As a** prospect, **I want** an About page, **so that** I can judge whether Pristaine is a team I can trust.

**Acceptance criteria**

1. **Given** I open /about, **when** the page loads, **then** it shows who Pristaine is, its approach (tested, private, built around your tools) and a Book a Consultation call to action.
2. **Given** the page, **when** I look for people, **then** team details appear only if the owner has supplied them.
3. **Given** the page, **when** a crawler reads it, **then** it has one H1 and a unique title and description (F8-US1).
4. **Given** the page content, **when** it is reviewed, **then** it contains no invented clients, statistics or credentials.

**Dependencies:** F1-US1, F4-US1  |  **Refs:** Business Rules BR-50, BR-51

#### (F7-US2) See all services in one place

**Priority:** Must  |  **Release:** v1

**As a** prospect, **I want** a page that lists every service, **so that** I can compare them and choose one.

**Acceptance criteria**

1. **Given** I open /services, **when** the page loads, **then** it shows a one-line intro and one card per service, each with its name and description, linking to its service page.
2. **Given** I click the Services text in the navbar, **when** the click registers, **then** this page opens.
3. **Given** a service changes in the services data file, **when** the site rebuilds, **then** this page changes with it.

**Dependencies:** F1-US1, F7-US3  |  **Refs:** Constitution SSOT-02

#### (F7-US3) Understand one service

**Priority:** Must  |  **Release:** v1

**As a** prospect, **I want** a dedicated page for each service, **so that** I can see exactly what it is and whether it fits me.

**Acceptance criteria**

1. **Given** I open any of the four service pages (/services/conversational-ai, /services/voice-ai, /services/ai-solutions, /services/ai-consultation), **when** the page loads, **then** it shows what the service is, who it is for, how it works in three points, industry examples, two or three FAQs and a Book a Consultation call to action.
2. **Given** I arrive from the navbar dropdown, a Services card or the footer, **when** the page opens, **then** all three routes lead to the same URL.
3. **Given** any performance or time-saving statement, **when** it is reviewed, **then** it has a documented basis.
4. **Given** the page, **when** a crawler reads it, **then** it carries the Service structured data in F8-US3.

**Dependencies:** F1-US2, F4-US1  |  **Refs:** Business Rules BR-55, Constitution SSOT-02

#### (F7-US4) Read insights

**Priority:** Should  |  **Release:** v1

**As a** prospect, **I want** to read helpful articles, **so that** I learn something useful before I contact Pristaine.

**Acceptance criteria**

1. **Given** I open /insights, **when** the page loads, **then** it lists published articles, newest first, with tags.
2. **Given** I open /insights/\[slug\], **when** the page loads, **then** it shows the article body, its publish date, related links and a Book a Consultation call to action.
3. **Given** articles are added, **when** the site rebuilds, **then** they come from the content layer, not from component code.
4. **Given** no articles are published, **when** I open /insights, **then** a short message says articles are coming and offers Book a Consultation.

**Dependencies:** F1-US4, F4-US1  |  **Refs:** OQ-01

### F8: AEO/SEO

Search engines and AI answer engines must be able to find, read and accurately cite every public page. The objective is that prospects who search on Google or ask an AI assistant get correct information about Pristaine. Detailed standards are in the AEO/SEO document.

#### (F8-US1) Find Pristaine's pages in search and AI answers

**Priority:** Must  |  **Release:** v1

**As a** prospect searching on Google or asking an AI assistant, **I want** accurate, complete pages to exist, **so that** I find and understand Pristaine.

**Acceptance criteria**

1. **Given** a plain HTTP request without JavaScript to any public page, **when** the response arrives, **then** it contains the page's real, complete content.
2. **Given** any public page, **when** its headings are read, **then** there is one H1 and a logical heading order.
3. **Given** any public page, **when** its head is read, **then** it has a unique title and a unique meta description.
4. **Given** any page, **when** it ships, **then** it contains no placeholder text.

**Dependencies:** none  |  **Refs:** Constitution QG-02, AEO/SEO document

#### (F8-US2) See a good preview when a link is shared

**Priority:** Should  |  **Release:** v1

**As a** visitor who shares a Pristaine link, **I want** it to preview well, **so that** recipients know what they are clicking.

**Acceptance criteria**

1. **Given** any public page, **when** its link is pasted into a preview tool, **then** Open Graph and Twitter Card tags give a correct title, description and a 1200 by 630 image specific to that page.
2. **Given** any public page, **when** its head is read, **then** a canonical tag points to that page's exact URL.

**Dependencies:** F8-US1  |  **Refs:** AEO/SEO document

#### (F8-US3) Give machines accurate facts

**Priority:** Must  |  **Release:** v1

**As an** AI answer engine, **I want** structured facts about Pristaine, **so that** I describe it correctly.

**Acceptance criteria**

1. **Given** any public page, **when** its structured data is read, **then** it includes Organization data.
2. **Given** a service page, **when** its structured data is read, **then** it includes Service data for that service.
3. **Given** FAQ content is visible on a page, **when** its structured data is read, **then** a FAQPage block exists and matches the visible text word for word. Where no FAQ is visible, no FAQPage block exists.
4. **Given** a nested page, **when** its structured data is read, **then** it includes a BreadcrumbList.
5. **Given** any structured data value, **when** it is traced, **then** it comes from the same source as the visible page.

**Dependencies:** F3-US5, F7-US3  |  **Refs:** Constitution SSOT-01, AEO/SEO document

#### (F8-US4) Let crawlers discover everything

**Priority:** Must  |  **Release:** v1

**As a** search crawler or AI agent, **I want** reliable discovery files, **so that** I can find every public page.

**Acceptance criteria**

1. **Given** the site is built, **when** sitemap.xml is read, **then** it lists exactly the real public routes and was generated at build time, not edited by hand.
2. **Given** robots.txt, **when** it is read, **then** it allows crawling of public routes and lists the sitemap.
3. **Given** llms.txt, **when** it is read, **then** it is factual and every page it names exists.
4. **Given** any of these files, **when** they ship, **then** none contains a placeholder value.

**Dependencies:** F8-US1  |  **Refs:** Constitution SSOT-05, AEO/SEO document

### F9: Lead Capture and CRM Sync

Every form message, chat conversation and booking is saved in the database, and the team sees leads and chat summaries in HubSpot. The objective is that no lead is lost, the team knows who asked what, and consent and privacy rules are respected.

#### (F9-US1) Save every contact form message

**Priority:** Must  |  **Release:** v1

**As a** Pristaine team member, **I want** every form message saved with its consent proof and source, **so that** I never lose a lead.

**Acceptance criteria**

1. **Given** a visitor submits a valid form, **when** it is processed, **then** the lead and message are saved with the time, the version of the consent line shown and the page they came from.
2. **Given** the visitor arrived from a campaign link, **when** the lead is saved, **then** the source and campaign details are saved with it.
3. **Given** the same email submits again, **when** it is processed, **then** it updates the same lead and does not create a duplicate.
4. **Given** saving fails, **when** the visitor submits, **then** they see the error message from F5-US2 and nothing is half-saved.

**Dependencies:** F5-US1  |  **Refs:** Business Rules chat and form data rules, Architecture data model

#### (F9-US2) Save every chat conversation

**Priority:** Must  |  **Release:** v1

**As a** Pristaine team member, **I want** every conversation saved in order, **so that** I can learn what visitors ask and follow up with context.

**Acceptance criteria**

1. **Given** a visitor sends a message, **when** the assistant answers, **then** both are saved in order with the time, the page, and whether the answer came from an approved answer or the AI model.
2. **Given** a message contains sensitive data (government IDs, card or bank numbers, passwords, biometric data), **when** it is processed, **then** it is replaced by a marker, never sent to the model and never saved.
3. **Given** an anonymous visitor, **when** the conversation is saved, **then** it is stored under a random visitor ID and is not linked to a person until they share an email.
4. **Given** the retention period for anonymous conversations has passed, **when** the daily cleanup runs, **then** those conversations are deleted.
5. **Given** saving the chat fails, **when** the visitor asks a question, **then** they still receive their answer.

**Dependencies:** F2-US3  |  **Refs:** Business Rules BR-40, BR-45, AI Observability and Security document

#### (F9-US3) See leads and chat summaries in HubSpot

**Priority:** Must  |  **Release:** v1

**As a** Pristaine team member, **I want** new leads and chat summaries to appear in HubSpot, **so that** I can follow up from my CRM.

**Acceptance criteria**

1. **Given** a form lead is saved, **when** the sync runs, **then** a HubSpot contact is created or updated with name, email, phone, company, source and consent date, and the message is added as a note.
2. **Given** a conversation belongs to a known email, **when** it ends or goes quiet, **then** a short summary, the topics of interest and the conversation ID appear on that contact.
3. **Given** a contact created by the site, **when** it exists in HubSpot, **then** it is marked non-marketing, so no marketing email goes to it without a separate opt-in.
4. **Given** the email already exists in HubSpot, **when** the sync runs, **then** the existing contact is updated, not duplicated.
5. **Given** an anonymous conversation, **when** no email is known, **then** nothing is sent to HubSpot.

**Dependencies:** F9-US1, F9-US2  |  **Refs:** Business Rules BR-22, BR-23

#### (F9-US4) See consultation bookings in HubSpot

**Priority:** Should  |  **Release:** v1

**As a** Pristaine team member, **I want** each booked consultation to appear on the right contact, **so that** I know who is coming and when.

**Acceptance criteria**

1. **Given** a visitor books a consultation, **when** Calendly confirms it, **then** the booking is saved with its time and status.
2. **Given** the booker's email matches a lead, **when** the booking is saved, **then** it links to that lead. Otherwise a new lead is created with the source Calendly booking.
3. **Given** a booking is cancelled or rescheduled, **when** Calendly reports it, **then** the saved status and time update.
4. **Given** a booking is saved, **when** the sync runs, **then** a meeting appears on the HubSpot contact.

**Dependencies:** F4-US1, F9-US3  |  **Refs:** Architecture outside services, OQ-08

#### (F9-US5) Never lose a lead when HubSpot is down

**Priority:** Must  |  **Release:** v1

**As a** Pristaine team member, **I want** failed syncs retried automatically, **so that** every lead reaches HubSpot in the end.

**Acceptance criteria**

1. **Given** HubSpot is unavailable, **when** a sync fails, **then** the lead stays saved and the failed attempt is recorded.
2. **Given** failed syncs, **when** time passes, **then** they are retried automatically with growing waits until they succeed or reach a set number of tries.
3. **Given** a sync keeps failing, **when** the limit is reached, **then** the team is notified.
4. **Given** any sync record, **when** it is read, **then** it holds only IDs, status and error codes, never message text or personal details.

**Dependencies:** F9-US3  |  **Refs:** Architecture CRM sync, OQ-10

#### (F9-US6) Delete a person's data on request

**Priority:** Must  |  **Release:** v1

**As a** visitor, **I want** to ask for my data to be deleted or shown to me, **so that** I stay in control of my information.

**Acceptance criteria**

1. **Given** a request arrives at the privacy contact, **when** the team has verified the requester, **then** all of that person's records (lead, messages, conversations, bookings) are deleted from the database within 30 days.
2. **Given** the same person exists in HubSpot, **when** the request is completed, **then** the contact is deleted there too.
3. **Given** a request is completed, **when** it is logged, **then** the record holds the date and outcome and no personal details.
4. **Given** an access request, **when** the team has verified the requester, **then** the team can export that person's data.

**Dependencies:** F9-US1, F9-US2, F9-US3, F9-US4  |  **Refs:** Business Rules BR-43

## 8. Content Limits

| Element | Limit |
| --- | --- |
| Headline | 10 words |
| Section intro | 20 words |
| Card description | 15 words |
| Step description | 30 words |
| FAQ answer | 60 words |
| Primary CTA labels | 4 words |

Extra detail goes behind an info (i) icon, tooltip or expandable panel (Constitution UX-03).

## 9. Dependencies

**Upstream:** Project Constitution. **Downstream:** Business Rules, Architecture, Design Document, AEO/SEO Document, AI Observability and Security, agents.md.

## 10. Open Questions

| ID | Question | Current assumption |
| --- | --- | --- |
| OQ-01 | Do Insights cards link to full article pages, and is Insights reachable from the footer? | Yes to both, via /insights routes. |
| OQ-02 | Calendly event name and duration. | Free AI Readiness Call, 30 minutes. |
| OQ-03 | Which logos can the brand strip show at launch? | Technology Works with logos, or hide until real partners exist. |
| OQ-04 | Final hero headline, step names and timing, FAQ copy, contact email. | Placeholders in this document. |
| OQ-05 | Is pricing mentioned anywhere on the site? | No pricing in v1. |
| OQ-06 | How long are chats and form submissions kept before deletion? | Anonymous chats 90 days. Leads while the relationship is active. Counsel decides. |
| OQ-07 | Which OpenAI model will be used, and what are OpenAI's current data retention and training terms for API use? | The model is set by configuration after testing. The terms are recorded in the provider list. |
| OQ-08 | Does the Calendly plan support webhooks for bookings? | Yes. If not, bookings reach HubSpot another way. |
| OQ-09 | Who writes and approves the library of approved answers? | The owner, starting from the FAQ and service content. |
| OQ-10 | How is the team notified when a CRM sync keeps failing? | To be decided. Email once the mailbox exists. |

## 11. Change Log

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-10-13 | Initial draft. |
| 0.2 | 2026-10-13 | Rewritten as features and user stories with Given/When/Then acceptance criteria. Requirement IDs (PRD-xx) replaced by story IDs. |
| 0.2 (update) | 2026-10-13 | Owner decision: the assistant is live at launch with a database and HubSpot. Rewrote F2-US3, added F2-US5 to F2-US8, added feature F9, updated F5-US1. |
| 0.4 | 2026-10-14 | Aligned the existing route names and `/book` flow, consolidated cookie information under `/privacy#cookies`, and separated implemented routes from future pages. |
| 0.5 | 2026-10-15 | Clarified that story IDs and acceptance criteria remain atomic, while implementation prompts may group related stories into owner-approved feature batches. Corrected the feature count to include F9. |
