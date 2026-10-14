# Pristaine: Design Document

**Version:** 0.3 (Draft — route and legal footer alignment)  |  **Date:** 2026-10-14  |  **Depends on:** Project Constitution and Charter v0.3, PRD v0.4, Business Rules v0.4  |  **Status:** For review

## 1. Purpose

This document defines how pristaine.com looks, moves and behaves, so that the Magic Patterns prototype, the Bolt build and every later page share one visual system. It holds the design tokens, layout and component rules, the usability and accessibility checks, and the content audit. It does not define features (see PRD) or technology (see Architecture).

## 2. Scope and Out of Scope

**In scope:** tokens, typography, grid, motion, media art direction, components, the Home page rhythm, usability heuristics, cognitive walkthrough, WCAG 2.2 AA checklist, content audit, and the Magic Patterns prototyping guide.

**Out of scope:** the final logo artwork, page layouts for the UI-pending pages (About, Services, service pages, Insights, legal pages) until the owner supplies designs, the generation prompts for images and video (a separate deliverable), and a dark/light toggle.

## 3. Design Principles

| ID | Principle | Constitution link |
| --- | --- | --- |
| DES-P1 | One message and one primary action per section. | UX-01 |
| DES-P2 | Less on the surface, more behind the (i) icon. | P2, UX-03 |
| DES-P3 | Dark where the mood and media live, light where people read. | PRD section 7 |
| DES-P4 | Motion explains. If it does not, remove it. | P7, MM-01, MM-02 |
| DES-P5 | Every state is designed: default, hover, focus, active, disabled, loading, error. | UX-05 |
| DES-P6 | Contrast and focus are never sacrificed for atmosphere. | QG-01 |

## 4. Foundations

All values below live in one tokens file (Constitution SSOT-03). Components never hard-code them. The palette is a working proposal until the owner approves a final brand (see OQ-01).

### 4.1 Color

**Dark theme tokens**

| Token | Hex | Role | Contrast |
| --- | --- | --- | --- |
| ink-950 | #0B1020 | Dark page background | base |
| ink-900 | #151C33 | Raised dark surfaces: cards, dropdown, banner | base |
| text-on-dark | #F6F8FB | Primary text | 17.80 on ink-950 |
| text-muted-on-dark | #A9B2C6 | Secondary text | 8.90 on ink-950, 7.92 on ink-900 |
| aqua-400 | #2DD4BF | Primary accent, button fill, focus ring on dark | 10.17 on ink-950 |
| indigo-400 | #818CF8 | Links and accent text on dark | 6.35 on ink-950 |
| border-on-dark | #6B7590 | Field and control borders | 4.12 on ink-950, 3.67 on ink-900 |

**Light theme tokens**

| Token | Hex | Role | Contrast |
| --- | --- | --- | --- |
| surface-50 | #F6F8FB | Light page background | base |
| white | #FFFFFF | Cards on light | base |
| text-on-light | #0B1020 | Primary text | 17.80 on surface-50 |
| slate-600 | #5B6475 | Secondary text on light only | 5.60 on surface-50, 5.96 on white |
| indigo-600 | #4F46E5 | Links, focus ring, accents on light | 5.91 on surface-50 |
| teal-700 | #0F766E | Aqua-toned text on light | 5.14 on surface-50, 5.47 on white |
| border-on-light | #737D92 | Field and control borders | 3.89 on surface-50, 4.14 on white |

**Status and decorative tokens**

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| error-on-dark | #F87171 | Errors on dark | 6.84 on ink-950 |
| error-on-light | #B42318 | Errors on light | 6.18 on surface-50 |
| success-on-dark | #34D399 | Success on dark | 9.85 on ink-950 |
| success-on-light | #047857 | Success on light | 5.15 on surface-50 |
| gradient accents | #2DD4BF, #4F46E5, #A78BFA, #38BDF8 | Orbs, glows, card backgrounds, illustration | Decorative only |

**Rules**

- **DES-COL-01** Text MUST meet 4.5:1 (large text 3:1) and UI borders and icons MUST meet 3:1, measured against the actual background, including video frames.
- **DES-COL-02** Aqua #2DD4BF MUST NOT be used as text on a light background (1.75:1). Use teal-700 or indigo-600.
- **DES-COL-03** Indigo #4F46E5 MUST NOT be used as text on a dark background (3.01:1). Use indigo-400. White text on an indigo fill is allowed (6.29:1).
- **DES-COL-04** Primary buttons on dark: aqua fill with ink text (10.17:1). Primary buttons on light: ink fill with white text (18.93:1).
- **DES-COL-05** Color never carries meaning alone. Errors, status and selection also use text or an icon.
- **DES-COL-06** Gradient accents are decorative. Text placed over a gradient sits on a solid or scrimmed area that meets DES-COL-01.

### 4.2 Typography

Headings use Sora. Body and UI use Inter. Both are open-licensed and MUST be self-hosted (Business Rules BR-36), with system-font fallbacks.

| Style | Font and weight | Desktop size / line | Mobile size / line |
| --- | --- | --- | --- |
| Display (hero H1) | Sora 600 | 64 / 68 px | 40 / 44 px |
| H2 (section) | Sora 600 | 44 / 48 px | 32 / 38 px |
| H3 | Sora 600 | 28 / 34 px | 22 / 28 px |
| H4 (card title) | Sora 500 | 20 / 28 px | 20 / 28 px |
| Body large (intro) | Inter 400 | 20 / 30 px | 18 / 28 px |
| Body | Inter 400 | 16 / 26 px | 16 / 26 px |
| Small (caption, tag) | Inter 500 | 14 / 22 px | 14 / 22 px |
| Button and label | Inter 600 | 16 / 24 px | 16 / 24 px |

- **DES-TYP-01** Body text MUST be at least 16 px and nothing may be smaller than 14 px.
- **DES-TYP-02** Sizes use rem so text scales to 200% without loss of content or function.
- **DES-TYP-03** Line length stays between 45 and 75 characters. Headings use sentence case. Long text is never all caps.
- **DES-TYP-04** Only weights 400, 500 and 600 are used.

### 4.3 Grid, Spacing and Breakpoints

| Item | Value |
| --- | --- |
| Base unit | 4 px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 |
| Mobile (menu shown) | below 768 px. Lowest supported width 320 px |
| Tablet | 768 to 1023 px, 8 columns |
| Desktop | 1024 px and up, 12 columns, content max width 1200 px |
| Wide | 1280 px and up |
| Section padding | 96 px vertical on desktop, 64 px on mobile |
| Gutters | 24 px desktop, 16 px mobile |

- **DES-GRID-01** The page reflows to a single column at 320 px with no horizontal scrolling, except inside a deliberate scroller such as the Insights carousel.
- **DES-GRID-02** Information density stays low: at most three content groups side by side on desktop, one on mobile.
- **DES-GRID-03** Related items sit closer to each other than to unrelated items (at least one spacing step of difference).

### 4.4 Shape and Elevation

- **DES-SHP-01** Radius tokens: 8 px (fields, tags), 12 px (buttons), 16 px (cards), 999 px (chat bar, pills).
- **DES-SHP-02** Separation uses 1 px hairlines (12% white on dark, 10% ink on light) and surface changes, not heavy shadows.
- **DES-SHP-03** Glow is reserved for the CTA button and the How It Works orb.

### 4.5 Icons and Illustration

- **DES-ICO-01** One outline icon family, 24 px grid, 1.5 px stroke, used at 20 or 24 px. Icons that carry meaning have a text label or an accessible name.
- **DES-ICO-02** The info icon is a 20 px (i) glyph inside a 44 px target. It opens a popover of 40 words or fewer, dismissible with Escape (Constitution UX-03).
- **DES-ILL-01** Illustration is abstract: gradient orbs, light streaks, simple diagrams. No stock cartoons and no real or realistic people (Business Rules BR-54).
- **DES-ILL-02** Every meaningful image has alt text. Decorative media is hidden from assistive technology.

### 4.6 Motion

| Token | Value | Use |
| --- | --- | --- |
| duration-fast | 150 ms | Hover, focus, toggles |
| duration-base | 250 ms | Dropdown, accordion, tooltips |
| duration-slow | 400 ms | Card transitions, banner |
| duration-scene | 800 ms | Scroll scenes (cards stacking, step change) |
| ease-standard | cubic-bezier(0.2, 0, 0, 1) | Default |
| ease-enter / ease-exit | cubic-bezier(0, 0, 0, 1) / cubic-bezier(0.3, 0, 1, 1) | Entering / leaving |

- **DES-MOT-01** Motion appears only to explain a change, guide attention or confirm an action.
- **DES-MOT-02** No more than one scroll-driven scene is animating at a time.
- **DES-MOT-03** Nothing flashes more than three times per second.
- **DES-MOT-04** The hero video and brand strip have no visible Pause control (owner decision, recorded as an approved exception in Constitution QG-07). They MUST stop under reduced motion and data-saver, the brand strip MUST pause on hover and focus, and hero clips MUST be slow, muted and free of flashing.
- **DES-MOT-05** With reduced motion on, every item below uses its static equivalent:

| Item | Normal | Reduced motion |
| --- | --- | --- |
| Hero background | Looping video, four clips | Poster image |
| Brand strip | Slow scrolling logos | Static row of logos |
| Services cards | Stack and overlap on scroll | Vertical list |
| How It Works | Scroll-driven steps, animated orb | Stacked steps, static orb |
| CTA background | Animated or video | Still image |
| Insights cursor | Round Read cursor follows mouse | Static Read link on each card |
| Accordion, dropdown | Animated open and close | Instant |

### 4.7 Media Art Direction

- **DES-MED-01** Hero: four loops of 6 to 8 seconds, one per service, same color grade, abstract or interface-led, no people. A dark scrim sits behind text so the headline and chat bar pass DES-COL-01 on the brightest frame.
- **DES-MED-02** CTA background: a single slow light-streak loop on ink-950, quieter than the hero.
- **DES-MED-03** How It Works: the orb is CSS or canvas gradient, not video.
- **DES-MED-04** Every video has a poster image of the same composition. File-size budgets are set in Architecture.

## 5. Layout, Hierarchy and Grouping

### 5.1 Home Page Rhythm

| # | Section | Theme | Focal point | Motion level |
| --- | --- | --- | --- | --- |
| 1 | Navbar | Dark | Book a Consultation button | Low |
| 2 | Hero and brand strip | Dark | Chat bar | High (video) |
| 3 | What We Build | Dark | Service cards | Medium (stacking) |
| 4 | How It Works | Dark | Active step and orb | High (scroll scene) |
| 5 | CTA | Dark | Button | Medium (background) |
| 6 | Insights | Light | Article cards | Low (carousel) |
| 7 | FAQ | Light | Open question | Low |
| 8 | Contact | Dark | Form | Low |
| 9 | Footer | Dark | Link groups | None |
| 10 | Cookie banner | Overlay | Three equal choices | Low |

### 5.2 Hierarchy Rules

- **DES-HIE-01** One H1 per page. Each section has one H2 and at most one primary button.
- **DES-HIE-02** Three levels of emphasis only: headline, supporting text, detail. Detail goes behind the (i) icon.
- **DES-HIE-03** Size, weight and color change together to signal rank. A secondary item never out-shouts a primary one.

### 5.3 Gestalt Principles Applied

| Principle | Where it is applied |
| --- | --- |
| Proximity | Card title, description and arrow sit together. Form label sits directly above its field. |
| Similarity | All primary buttons look alike. All service cards share one structure. |
| Common region | Cards, dropdown, banner and form each sit on their own surface. |
| Continuity | The orbiting ring and step numbers lead the eye from step 01 to 03. |
| Figure and ground | Text sits on scrimmed or solid areas, never directly on busy video. |
| Focal point | The chat bar is the largest and brightest object in the hero. |
| Simplicity | One idea per section, with generous space around it. |

## 6. Components

Every component below MUST show default, hover, focus, active and, where relevant, disabled, loading and error states in the prototype. Touch targets are at least 44 by 44 px.

| Component | Key specification |
| --- | --- |
| Skip link | First focusable item on every page. Visible on focus. Jumps to main content. |
| Navbar | Floating pill, 64 px high (56 px mobile), 16 px from the top, max width 1200 px. Logo left, About and Services center, Book a Consultation right. Solid ink-900 at 90% with a blur, never transparent over video. Scroll offset is at least 96 px so focus is never hidden behind it. |
| Services dropdown | Panel with the four services, each with icon, name and one-line description, plus View all services. Opens on hover or focus after a 150 ms intent delay, stays open while the pointer moves into it, closes with Escape or outside click, and returns focus to the chevron button. |
| Mobile menu | Full-screen sheet below 768 px. Services is an accordion with a text link and a chevron button. Focus is trapped and the page behind does not scroll. |
| Buttons | Height 48 px, padding 24 px, radius 12 px, Inter 600. Primary, secondary (1 px outline) and tertiary (underlined text). Loading shows a spinner and a text label. |
| Chat bar | Pill, max width 760 px, 64 px high (56 px mobile). Left: AI assistant chip. Right: 44 px submit button. Border-on-dark with an aqua focus ring. A short notice beside it says this is an AI assistant, the chat is saved and sensitive details should not be entered, with a Privacy Policy link. It stays visible. |
| Service card | Full width, 16 px radius, ink-900 base with a gradient accent per service. Name (H3), description (15 words or fewer), arrow. Whole card is one link. |
| How It Works step | Outline numeral (120 px desktop, 80 px mobile), title, 30-word description, timeline label. Orb about 360 px with a progress ring. |
| Insight card | 4:3 image, up to two tag pills, title, one-line summary, read time. Desktop pointer only: 88 px round Read cursor, aqua fill with ink text. |
| FAQ accordion | Items at least 64 px high, chevron rotates in 250 ms, real button elements with expanded state announced. Answers 60 words or fewer. |
| Form field | Height 48 px, visible label above the field, 16 px text, border-on-dark or border-on-light. Error shows an icon and text below the field and a marked border. |
| Cookie banner | Card at bottom left on desktop, full-width sheet on mobile. Accept all, Reject non-essential and Manage choices share one style and size. Manage opens a panel with 44 px toggles. |
| Calendly notice | Small modal with Continue and Open in new tab. Focus is trapped. |
| Info (i) popover | Opens on click or focus, stays until dismissed, closes with Escape, content 40 words or fewer. |
| Chat panel | Opens below the chat bar at the same width, up to 60% of the screen height, and scrolls inside itself. Visitor messages on the right, assistant messages on the left with an AI label. States to design: approved answer appearing at once, AI answer streaming with a typing indicator, assistant unavailable, slow-down message, blocked-message explanation, and the optional email offer. Each problem state is a plain-language card with Book a Consultation and Send a message buttons. Both buttons also stay visible at the foot. A screen reader announces each new answer politely. |

### 6.1 Presenting Data

- **DES-DATA-01** Show a number only when it is verified and sourced (Business Rules BR-50, BR-55). Pair each with a short label and, where needed, a source behind the (i) icon.
- **DES-DATA-02** Timelines and steps use labeled shapes (number, title, timeline label), not decoration.
- **DES-DATA-03** Any future chart has a text alternative and does not rely on color alone.

### 6.2 Interface Copy

- **DES-COPY-01** Tone is calm, plain and precise. No hype, no jargon without explanation.
- **DES-COPY-02** Fixed labels: Book a Consultation, Send message, Accept all, Reject non-essential, Manage choices, Continue, Open in new tab, View all services, View all insights, Read.
- **DES-COPY-03** Error messages say what happened and what to do next, in under 20 words.

## 7. The 10 Usability Heuristics Applied

| # | Heuristic | How the design meets it |
| --- | --- | --- |
| 1 | Visibility of system status | Loading states on buttons and form, progress ring on How It Works, current page marked in the navbar. |
| 2 | Match with the real world | Plain labels such as Book a Consultation and Send message. No internal jargon. |
| 3 | User control and freedom | Escape closes every overlay. Reduced-motion support on moving media. Cookie settings reopen any time. |
| 4 | Consistency and standards | One button style per rank, one card structure, one pattern for every booking action. |
| 5 | Error prevention | Required fields marked, input length limit with a message, Calendly notice before third-party loading. |
| 6 | Recognition over recall | Visible labels, services shown in the dropdown, no hidden gestures required. |
| 7 | Flexibility and efficiency | Skip link, full keyboard operation, one-click booking from every page. |
| 8 | Aesthetic and minimalist design | Four-item navbar, content limits, detail behind the (i) icon. |
| 9 | Recover from errors | Inline errors with a fix, typed text kept after a failure, direct Calendly link if the embedded scheduler fails. |
| 10 | Help and documentation | (i) popovers, FAQ, visible contact email, Privacy Policy link and Cookie settings control. |

## 8. Cognitive Walkthrough

For each step the reviewer answers four questions: Will the visitor try to do this? Will they see the control? Will they connect the control to their goal? Will they see progress after acting? Any No is a defect to fix before launch.

| Task | Steps | Success looks like |
| --- | --- | --- |
| T1: Book a consultation from Home | See Book a Consultation in navbar, click it, accept the notice if shown, pick a time, close the confirmation | Booked in 4 steps or fewer, with no dead end |
| T2: Find the Voice AI service | Open Services dropdown, choose Voice AI, read the page | Reached in 2 clicks |
| T3: Send a message | Scroll or use the chat bar response, open Contact, fill three fields, submit | Success message seen, typed text never lost |
| T4: Change cookie choices | Find Cookie settings in the footer, change a category, save | Choice applied and confirmed |
| T5: Use only a keyboard | Skip link, navbar, dropdown, booking, form, banner | Every action reachable with a visible focus |

Run T1 to T5 on the prototype with at least five people, including one keyboard-only user and one screen-reader user.

## 9. Accessibility Audit (WCAG 2.2)

**Target: Level AA on every page (mandatory). Selected Level AAA criteria are adopted where the cost is low.**

| Level | Criterion | Design requirement |
| --- | --- | --- |
| A | 2.2.2 Pause, Stop, Hide | Known exception, owner decision: no visible Pause control. Safeguards are in DES-MOT-04 and Constitution QG-07. |
| A | 2.1.2 No keyboard trap | Only modals trap focus, and Escape always exits them. |
| A | 3.3.7 Redundant entry | Contact form never asks for the same detail twice. |
| A | 3.2.6 Consistent help | Contact link and email stay in the same place on every page. |
| AA | 1.4.3, 1.4.11 Contrast | Section 4.1 tokens, checked over video frames. |
| AA | 1.4.4, 1.4.10, 1.4.12 Resize, reflow, text spacing | rem units, single column at 320 px, no clipping with increased spacing. |
| AA | 1.4.13 Content on hover or focus | Dropdown and popovers are dismissible, hoverable and persistent. |
| AA | 2.4.7, 2.4.11 Focus visible, focus not obscured | 2 px focus ring with 2 px offset (aqua on dark, indigo-600 on light). Sticky navbar never covers focus. |
| AA | 2.5.7 Dragging movements | Carousel has previous and next buttons as well as swipe. |
| AA | 2.5.8 Target size minimum | All targets are at least 44 by 44 px. |
| AA | 3.3.8 Accessible authentication | Spam control uses no cognitive puzzle (Business Rules BR-24). |
| AA | 3.2.3 Consistent navigation | Navbar and footer are identical on every page. |
| AAA adopted | 1.4.6 Enhanced contrast | Body text uses text-on-dark or text-on-light (17.80:1). Slate-600 is for secondary text only. |
| AAA adopted | 2.5.5 Target size enhanced | 44 by 44 px minimum is the standard. |
| AAA adopted | 1.4.8 Visual presentation | Line length stays at or under 75 characters. |

- **DES-A11Y-01** Native elements are used first (button, a, input, details-style disclosure). ARIA is added only where native elements cannot do the job.
- **DES-A11Y-02** Every page has landmarks (header, nav, main, footer), one H1 and a logical heading order.
- **DES-A11Y-03** The audit runs on the prototype and again on the build, using automated checks plus manual keyboard and screen-reader passes.

## 10. Content Audit

Every text block is checked against these rules before it is approved.

| Check | Rule | Source |
| --- | --- | --- |
| Purpose | The block serves the section's one message. | DES-P1 |
| Length | It is within the PRD content limits. | PRD section 8 |
| Accuracy | Every claim, number and logo is real and approved. | BR-50 to BR-55 |
| Plain language | Reading level is about grade 8 or lower. Jargon is explained. | DES-COPY-01 |
| Placeholder | No placeholder text, logos or contact details remain. | Business Rules launch gate |
| Single source | The text lives in the content layer, once. | SSOT-04 |
| Honesty | AI is labeled as AI. No guaranteed outcomes. | Constitution non-negotiables |
| Action | Each section has one clear next step. | UX-01 |

Content still owed by the owner: hero headline, How It Works steps and timing, FAQ copy, About content, contact and privacy emails.

## 11. Magic Patterns Prototyping Guide

**Order of prompts** (one section per prompt, each with the token tables from section 4 pasted in and the matching recording as reference):

1. Tokens and navbar (Hero recording, navbar)
2. Hero with chat bar and brand strip (Hero recording)
3. What We Build cards (Services recording)
4. How It Works (How We Work recording)
5. CTA (CTA recording)
6. Insights carousel (Blogs recording)
7. FAQ (light theme, accordion)
8. Contact (Contact recording)
9. Footer and cookie banner

**A section is ready for Bolt only when:**

1. It uses tokens only, with no hard-coded colors or sizes.
2. Every state in section 6 is shown.
3. Both 360 px and 1280 px views exist.
4. The reduced-motion version is described or shown.
5. Contrast has been spot-checked on the busiest area.
6. Copy stays within content limits and placeholders are labeled.
7. No logo, footage or text from the reference sites is used.

## 12. Acceptance Criteria

| ID | Criterion | How to verify |
| --- | --- | --- |
| DES-AC-01 | Every text and UI color pair meets the ratios in section 4.1, including over video frames. | Contrast tool on prototype and build. |
| DES-AC-02 | No color value or font size appears outside the tokens file. | Code search. |
| DES-AC-03 | The page has no horizontal scroll at 320 px, except the Insights carousel. | Resize test. |
| DES-AC-04 | With reduced motion on, each item in the DES-MOT-05 table shows its static version. | OS setting test. |
| DES-AC-05 | Hero video and brand strip stop with reduced motion or data-saver on, and the brand strip pauses on hover and focus. | OS setting and manual test. |
| DES-AC-06 | Every interactive element shows hover, focus and active states, and focus is never hidden by the navbar. | Manual pass. |
| DES-AC-07 | All targets are at least 44 by 44 px. | Inspection. |
| DES-AC-08 | Cognitive walkthrough tasks T1 to T5 pass with no unresolved No answers. | Test log. |
| DES-AC-09 | Fonts are self-hosted and no third-party font request is made before consent. | Network panel. |
| DES-AC-10 | The content audit table passes for every block on every built page. | Review. |

## 13. Dependencies

**Upstream:** Project Constitution and Charter, PRD, Business Rules.

**Downstream:** Architecture (media and font budgets), AEO/SEO Document (Open Graph image style), AI Observability and Security (chat bar states), agents.md, and the asset-generation prompts.

## 14. Open Questions

| ID | Question | Current assumption |
| --- | --- | --- |
| OQ-01 | Is the proposed palette and Sora plus Inter pairing approved as the brand? | Yes, until a logo is commissioned. |
| OQ-02 | The owner declined a Pause control for moving media. Should an accessibility specialist review this exception before launch? | Exception recorded. PRD unchanged. |
| OQ-03 | Is 768 px the right breakpoint for the mobile menu? | Yes. |
| OQ-04 | Final logo and favicon artwork. | Wordmark placeholder. |

## 15. Change Log

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-10-13 | Initial draft. |
| 0.2 | 2026-10-13 | Removed the Pause control requirement (owner decision) and recorded the safeguards that remain. |
| 0.3 | 2026-10-14 | Aligned footer/legal guidance with one Privacy Policy route and the Cookie settings control. |
