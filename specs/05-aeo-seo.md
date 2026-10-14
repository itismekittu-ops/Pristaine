# Pristaine: AEO and SEO Document

**Version:** 0.3 (Draft — route inventory aligned to current UI and migration baseline)  |  **Date:** 2026-10-14  |  **Depends on:** Project Constitution and Charter v0.3, PRD v0.4, Business Rules v0.4, Architecture v0.3, Design Document v0.3  |  **Status:** For review

## 1. Purpose

This document is the permanent rulebook that keeps pristaine.com discoverable and correctly described by search engines (SEO) and by AI answer engines (AEO). Every current and future public page is checked against it. It does not expire when today's issues are fixed.

## 2. Scope and Out of Scope

**In scope:** on-site technical SEO, page metadata, structured data, crawl files, answer-ready content, content standards, internal linking, and measurement.

**Out of scope:** paid search, social media, link-building campaigns, and directory listings. These need their own plan if the owner wants them.

## 3. Principles

| ID | Principle | Source |
| --- | --- | --- |
| SEO-P1 | Crawlable first: every public page returns complete HTML on the first response, with no JavaScript needed. | Architecture ARC-P1, PRD F8-US1 |
| SEO-P2 | Accuracy over reach: no page, tag or structured data states a claim, client, number or credential that is not real and approved. | Constitution zero fabrication, Business Rules BR-50 |
| SEO-P3 | One source of truth: metadata, structured data, sitemap and llms.txt are built from the same data as the visible page. | Constitution SSOT-01 |
| SEO-P4 | No cloaking: crawlers and visitors see the same content. The consent banner never hides content from either. | Business Rules section 6 |
| SEO-P5 | People first: pages are written to help a prospect, not to repeat keywords. | Design Document DES-P1 |
| SEO-P6 | AEO is SEO: there is no separate trick for AI answers. Clear, accurate, well-structured pages serve both. | Section 4 |
| SEO-P7 | No placeholders in production: any template value must be replaced with real content before launch. | Architecture ARC-CON-02 |

## 4. What Is True in 2026

These facts were checked in October 2026 from industry reports of Google and AI-company guidance. Confirm them against the official sources at each quarterly review (SEO-GOV-02).

| Fact | What this document does |
| --- | --- |
| Google stopped showing FAQ rich results on May 7, 2026. FAQPage markup is still valid, and other search and answer engines can read it. | Keep FAQPage markup that matches the visible FAQ, and expect no FAQ result in Google. |
| Google says no special markup is needed for its AI search features, and that Google Search ignores llms.txt. | Structured data and llms.txt are low-cost extras, never a substitute for clear, accurate content. llms.txt is still required for launch by owner decision. |
| AI companies run separate crawlers for search, for user requests and for model training. | Allow search and user-request crawlers. Training crawlers are the owner's choice (OQ-02). |
| Google treats optimizing for AI answers as the same work as SEO. | One standard for both: crawlable pages, accurate answers, clear structure. |

## 5. Topic and Intent Map

These topics are proposals. Validate them with a keyword tool before the copy is final (OQ-01).

| Page | Main topic | Example searches |
| --- | --- | --- |
| Home | AI agency for customer conversations | AI agency for customer service, chat and voice AI for business |
| Conversational AI and Chatbots | AI chatbots for business | AI chatbot for business website, customer service chatbot |
| Voice AI | AI phone agents | AI phone agent, AI receptionist, voice AI for business |
| AI Solutions | Custom AI automation | custom AI automation, AI workflow integration |
| AI Consultation | AI readiness and roadmap | AI readiness assessment, AI consulting for small business |
| About | The Pristaine brand | Pristaine AI agency |
| Insights | Practical AI guidance | how to test an AI chatbot, chatbot vs voice AI |

## 6. Technical SEO Standards

- **SEO-TECH-01** Every public route is generated at build time. A plain request without JavaScript MUST return the page's real, complete content (Architecture ARC-RT-01). Routes added later inherit this rule.
- **SEO-TECH-02** One H1 per page that states the page subject in plain words, and a logical heading order below it.
- **SEO-TECH-03** Every route has a unique title and meta description, set in code from the page's data, never a default. Titles are 60 characters or fewer. Descriptions are 120 to 160 characters and read as real, specific copy.
- **SEO-TECH-04** Every route has a canonical tag with its exact URL from SITE\_URL. One convention: no trailing slash, lowercase paths.
- **SEO-TECH-05** Open Graph and Twitter Card tags are on every public route, with a route-specific 1200 by 630 image, not one image reused everywhere.
- **SEO-TECH-06** The html tag declares the page language. No hreflang is needed while the site has one English version. The site uses one spelling convention throughout (OQ-03).
- **SEO-TECH-07** Images have descriptive alt text and file names, modern formats and fixed dimensions. Decorative media is hidden from assistive technology.
- **SEO-TECH-08** A missing page returns a real 404 status with a helpful page (Architecture ARC-RT-05). Moved pages return a 301 from the single redirects file.
- **SEO-TECH-09** HTTPS only, no mixed content, and Core Web Vitals at the Constitution's QG-02 thresholds, verified on production builds.
- **SEO-TECH-10** The consent banner and chat panel never shift the layout, never become the largest paint, and never cover the main content in a way that blocks reading (no intrusive interstitials).
- **SEO-TECH-11** API routes are never indexed. They are excluded in robots.txt and return no HTML pages.

### 6.1 Draft Metadata

These drafts need owner approval. A draft left in production fails the placeholder rule. Metadata for planned service-detail and Insights routes is a specification only; a route must not enter the sitemap or llms.txt until its page exists and its copy is approved.

| Route | Title | Meta description |
| --- | --- | --- |
| / | Pristaine \| Reliable Chat and Voice AI for Business | Pristaine builds chat and voice AI for customer conversations, tested before launch and built for privacy in the US and Canada. Book a consultation. |
| /about | About Pristaine \| A Clean, Reliable AI Agency | Meet Pristaine, an AI agency building tested, privacy-first chat and voice AI for businesses in the US and Canada. See how we work. |
| /services | AI Services: Chat, Voice and Custom AI \| Pristaine | Explore Pristaine's AI services: conversational AI and chatbots, voice AI, custom AI solutions and AI consultation for US and Canadian businesses. |
| /services/conversational-ai | AI Chatbots for Business \| Pristaine | Pristaine builds AI chatbots that answer customers instantly on your website and messaging channels, with guardrails and testing built in. |
| /services/voice-ai | Voice AI Phone Agents for Business \| Pristaine | AI phone agents that answer, qualify and book calls for your business, built by Pristaine with testing and privacy in mind. |
| /services/ai-solutions | Custom AI Solutions and Automation \| Pristaine | Custom AI automations and integrations built around your workflow and your existing tools, delivered with testing and clear results. |
| /services/ai-consultation | AI Consultation and Readiness \| Pristaine | Find where AI will pay off first. Pristaine's AI consultation gives your business a clear roadmap and a practical place to start. |
| /insights | Insights on Chat and Voice AI \| Pristaine | Practical guidance on chatbots, voice AI and adopting AI in your business, from the Pristaine team. Read our latest articles. |
| /book | Book a Consultation \| Pristaine | Talk with Pristaine about customer conversations, voice AI and practical AI opportunities for your business. |
| /privacy | Privacy Policy \| Pristaine | How Pristaine handles information from its website, AI assistant, booking and contact form for visitors in the US and Canada. |

Article pages use the pattern: title is the article headline followed by Pristaine, and the description is a one-sentence summary written for that article.

## 7. Structured Data (JSON-LD)

| Type | Where | Rule |
| --- | --- | --- |
| Organization | Every page, by one shared identifier | Name, URL, logo, description and public email from the site config. Profile links only if they are real. |
| WebSite | Home | Name and URL. |
| Service | Each service page | Name and description from the services data file, with Pristaine as provider and the United States and Canada as the area served. |
| FAQPage | Any page that shows an FAQ | Text matches the visible FAQ word for word. Never added where no FAQ is visible. |
| BreadcrumbList | Every nested page | Matches the visible breadcrumb. |
| BlogPosting | Each Insights article | Headline, author, publish date and modified date. The modified date changes only when the content really changes. |

- **SEO-SD-01** Every value comes from the same source as the visible page (Constitution SSOT-01), never a separately typed copy.
- **SEO-SD-02** No telephone, address, rating, review, award or certification appears unless it is real and approved (Business Rules BR-50, BR-51).
- **SEO-SD-03** Structured data is validated with the Schema.org validator and Search Console. Google's Rich Results Test no longer checks FAQPage.
- **SEO-SD-04** Article authors are real, named people with a short real bio. A profile link is added only if it exists.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://pristaine.com/#organization",
  "name": "Pristaine",
  "url": "https://pristaine.com",
  "logo": "https://pristaine.com/<logo file from site config>",
  "description": "<mission sentence from the Constitution>",
  "email": "<public email from site config>",
  "sameAs": ["<real profile URLs from site config>"]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "<service name from the services data file>",
  "description": "<service description from the services data file>",
  "url": "https://pristaine.com/services/<slug>",
  "provider": { "@id": "https://pristaine.com/#organization" },
  "areaServed": ["United States", "Canada"]
}
```

The angle-bracket values above are filled from the site config and services data at build time. The placeholder guard fails the production build if any remain.

## 8. Crawl and Discovery Files

- **SEO-CRAWL-01** robots.txt allows all public routes, excludes /api/, and lists the sitemap. Rules are added only for paths that genuinely should not be crawled.
- **SEO-CRAWL-02** sitemap.xml is generated at build time from the real route list and content dates, never edited by hand (PRD F8-US4). It lists every public route and nothing else.
- **SEO-CRAWL-03** llms.txt is required for launch (owner decision). Google Search ignores it, so it is never counted as a ranking tactic. It is short, factual, generated at build time from the same data as the site, and every page it names exists.
- **SEO-CRAWL-04** The sitemap is submitted to Google Search Console and Bing Webmaster Tools, and resubmitted when routes change.
- **SEO-CRAWL-05** Search and user-request AI crawlers (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User) are allowed so Pristaine can be found and cited. Training crawlers (GPTBot, ClaudeBot, CCBot) and the Google-Extended token follow the owner's decision (OQ-02). User-request fetchers can ignore robots.txt, and abusive bots are handled by rate limits, not robots.txt.

```text
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://pristaine.com/sitemap.xml
```

```markdown
# Pristaine

> Pristaine builds clean, reliable AI for customer conversations and operations, with guardrails, testing and measurable results built in.

## Key pages
- [Home](https://pristaine.com/): Overview of Pristaine and its current services.
- [About](https://pristaine.com/about): About Pristaine.
- [Services](https://pristaine.com/services): Overview of conversational AI and chatbots, voice AI, AI solutions and AI consultation.
- [Book a consultation](https://pristaine.com/book): Consultation information.
- [Privacy Policy](https://pristaine.com/privacy): Privacy information and cookie controls.
```

## 9. Answer-Ready Content (AEO)

- **AEO-01** Each service page opens with a self-contained definition of 40 to 60 words that says what the service is, who it is for and what outcome it gives. It must make sense if lifted alone.
- **AEO-02** Headings are written as the question a buyer would ask, where natural, and the first sentence under each heading answers it.
- **AEO-03** FAQ answers are self-contained and 60 words or fewer (PRD F3-US5). Each answer must be correct without any other context.
- **AEO-04** Lists and tables are used where content is a set of steps, options or comparisons, so it is easy to scan and quote.
- **AEO-05** The brand is described the same way everywhere: the Constitution's mission sentence appears, unchanged, on About, in the Organization data and in llms.txt.
- **AEO-06** Anything that matters for how an AI describes Pristaine exists in the static HTML, never only in the chat or behind JavaScript.
- **AEO-07** The words Pristaine and what it does appear plainly on the Home and About pages. People may type pristine by mistake, so the brand is never abbreviated or varied.
- **AEO-08** Every page states that a person is available, with Book a Consultation and Send a message (Constitution human in the loop).

## 10. Content Standards

- **CONT-01** Every Insights article has a named author with a short real bio, a publish date, a modified date if updated, and a Book a Consultation call to action.
- **CONT-02** Educational content is clearly separate from anything that reads as advice about a visitor's specific situation. No legal, medical or financial advice. No guaranteed outcomes (Business Rules BR-55).
- **CONT-03** AI may help draft content, but a person reviews and approves every page. Pages made in bulk, or near-duplicate pages for each city or industry, are not allowed. They risk being treated as spam.
- **CONT-04** Claims about results or time saved need a documented basis before they are published.
- **CONT-05** Pages are reviewed every six months. The modified date and sitemap date change only when the content really changes.
- **CONT-06** Starting Insights topics (to be confirmed): what voice AI is and when it pays off; chatbot or voice AI, which first; how to test an AI chatbot before launch; what to ask an AI vendor about privacy; where to start with AI in a small business; what guardrails a customer-facing assistant needs.

### 10.1 Internal Linking

- **SEO-LINK-01** Home links to every service page. Each service page links to Book a Consultation and to at least one related service or article.
- **SEO-LINK-02** Every article links to at least one relevant service page with descriptive link text.
- **SEO-LINK-03** No page is orphaned. Every public route is reachable from the navbar, footer, a card or a link within two clicks of Home.
- **SEO-LINK-04** Link text describes the destination. It is never click here.

## 11. Measurement and Monitoring

- **SEO-MEAS-01** Google Search Console and Bing Webmaster Tools are set up before launch using DNS or a meta tag, which need no cookies (Business Rules BR-36).
- **SEO-MEAS-02** Monthly review: pages indexed against live routes, impressions, clicks and position for brand and service searches, Core Web Vitals field data, and crawl errors.
- **SEO-MEAS-03** Monthly AI visibility check: ask a fixed list of 10 buyer questions in the major AI assistants, record whether Pristaine is mentioned or cited, and check every fact stated about it.
- **SEO-MEAS-04** Any wrong fact found in an AI answer is fixed at the source: the page, the structured data or the profile that feeds it.
- **SEO-MEAS-05** Website analytics, if used, loads only after consent (Business Rules section 6).

| Metric | Target |
| --- | --- |
| Public routes with valid title, description, canonical, Open Graph and structured data | 100% |
| Indexed pages that are live routes | 100%, with zero orphaned or stale URLs |
| Pages passing the verification checklist before launch | 100% |
| Wrong facts about Pristaine found in AI checks | 0 left unfixed after one month |

## 12. Governance

- **SEO-GOV-01** The verification checklist in section 13 runs on every new page before launch and on the whole site every quarter.
- **SEO-GOV-02** The facts in section 4, the crawler list and the structured data guidance are re-checked against official sources every quarter.
- **SEO-GOV-03** URL changes are avoided. If one is needed, the old path gets a 301 to the new one in the redirects file, in the form: /old-path to /new-path, 301.

## 13. Verification Checklist

- [ ] A plain request returns real, complete HTML with no JavaScript
- [ ] Unique title and meta description of the right length
- [ ] Canonical tag, Open Graph and Twitter tags render correctly in a preview tool
- [ ] Page is in sitemap.xml and not blocked in robots.txt
- [ ] Structured data is present where it applies, valid, and matches the visible page
- [ ] One H1, a logical heading order, and descriptive alt text
- [ ] The page meets the Core Web Vitals thresholds on a production build
- [ ] No placeholder text, logo or contact detail remains
- [ ] Claims, numbers and names are real and approved
- [ ] Internal links in and out are present with descriptive text
- [ ] The consent banner and chat panel do not hide or shift the content
- [ ] llms.txt lists the page if it is a key page, and names only pages that exist

## 14. Acceptance Criteria

| ID | Criterion | How to verify |
| --- | --- | --- |
| SEO-AC-01 | A plain request to every public route returns its full content. | curl or view source |
| SEO-AC-02 | Every route has a unique title (60 characters or fewer) and description (120 to 160). | Build-time check |
| SEO-AC-03 | Every route has a canonical tag matching its URL, and Open Graph tags with a route-specific image. | Preview tool |
| SEO-AC-04 | sitemap.xml lists exactly the live public routes and was generated at build time. | Compare with route map |
| SEO-AC-05 | robots.txt allows public routes and excludes /api/. | Fetch the file |
| SEO-AC-06 | Organization data is on every page, Service data on each service page, and FAQPage data only beside a visible FAQ with identical text. | Schema.org validator |
| SEO-AC-07 | No structured data field contains a telephone, address, rating or award that is not real. | Review |
| SEO-AC-08 | The production build fails if any placeholder remains in metadata, structured data, sitemap or llms.txt. | Inject one, build |
| SEO-AC-09 | Each service page opens with a self-contained definition of 40 to 60 words. | Content review |
| SEO-AC-10 | Every public page is reachable within two clicks of Home. | Link crawl |
| SEO-AC-11 | The consent banner and chat panel cause no layout shift and do not hide the main content. | Lighthouse and visual check |
| SEO-AC-12 | Search Console and Bing Webmaster Tools are set up and the sitemap is submitted. | Dashboard check |
| SEO-AC-13 | llms.txt exists at the site root, is generated at build time, names only pages that exist, and contains no placeholder. | Fetch the file, run the placeholder guard |

## 15. Dependencies

**Upstream:** Project Constitution and Charter, PRD, Business Rules, Architecture, Design Document.

**Downstream:** agents.md (metadata, structured data and crawl file build rules).

## 16. Open Questions

| ID | Question | Current assumption |
| --- | --- | --- |
| OQ-01 | Do the topics and search phrases in section 5 match real search demand? | Proposals, validated with a keyword tool before copy is final. |
| OQ-02 | Should AI training crawlers (GPTBot, ClaudeBot, CCBot) and Google-Extended be allowed? | Allowed, so the brand is well known to AI systems. The owner decides. |
| OQ-03 | Which spelling convention for the whole site, American or Canadian? | One convention, chosen by the owner. |
| OQ-04 | Which real profile links (LinkedIn and others) and which logo file go in the Organization data? | None until they exist. |
| OQ-05 | Will Pristaine have a public business address or a Google Business Profile? | No address in v1. |
| OQ-06 | Who are the named authors for Insights, and what are their bios? | To be provided by the owner. |
| OQ-07 | Are the draft titles and descriptions in section 6.1 approved? | Drafts only, until approved. |
| OQ-08 | PRD F8-US3 requires FAQPage data and F8-US4 requires llms.txt. Does anything change in the PRD? | No. Both stay as Must stories. llms.txt is required for launch, and neither is expected to give Google results. |

## 17. Change Log

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-10-13 | Initial draft. |
| 0.1 (update) | 2026-10-13 | Owner decision: llms.txt is required for launch. Updated SEO-CRAWL-03, section 4, OQ-08, SEO-AC-13 and the checklist. |
| 0.3 | 2026-10-14 | Aligned current page metadata and crawler examples with the implemented route set; future routes stay out of crawl feeds until published. |
