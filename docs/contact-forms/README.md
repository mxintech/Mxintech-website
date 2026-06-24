# Contact forms

México in Tech has four contact profiles, each with its own route, copy, benefits list, and form configuration. All forms share the same React component and API endpoint; behavior differs by `contactType`.

## Routes

| Route | Profile | `contactType` |
|-------|---------|---------------|
| `/contact/member` | Become a member | `member` |
| `/contact/leader` | Become a leader | `leader` |
| `/contact/speaker` | Become a speaker | `speaker` |
| `/contact/business` | Business / collaborations | `business` |

## Profile intent

### Member (`member`)

**Audience:** Someone who wants to learn more and grow their professional career.

**Goals:**
- Stay informed about new events and courses
- Join the community without committing to organizing or speaking

**Benefits highlighted on the page:** continuous learning, event/course notifications, professional network, career growth within the AWS User Group Tlaxcala ecosystem.

### Leader (`leader`)

**Audience:** Someone ready to go beyond being a spectator.

**Goals:**
- Contribute to the community in one or more ways
- Help organize events, share/diffuse events, create content, grow membership

**Benefits highlighted:** event organization, community outreach, content creation, multi-area contribution.

### Speaker (`speaker`)

**Audience:** A technical expert willing to share knowledge with the community.

**Goals:**
- Propose a talk or workshop
- Explain experience and talk focus

**Extra field:** `talkTitle` (required) — name of the proposed session.

**Benefits highlighted:** knowledge sharing, community impact, visibility, flexible formats (talks, workshops, live sessions).

### Business (`business`)

**Audience:** A person representing a company or institution.

**Goals:**
- Support the community through sponsorship or collaboration
- Offer venues, swag, courses, or other resources
- Request collaborations, respond to invitations, or partner with institutions/businesses

**Benefits highlighted:** sponsorship/visibility, meetup venues, swag/scholarships, open collaborations.

## Where to edit copy and UI

| Concern | Location |
|---------|----------|
| Headlines, benefits, form labels, placeholders, submit button text | [`src/config/contactForms.js`](../../src/config/contactForms.js) |
| Page layout, hero icon, entrance animations | [`src/components/ContactPageLayout.jsx`](../../src/components/ContactPageLayout.jsx) |
| Form fields, field icons, validation wiring | [`src/ContactForm.js`](../../src/ContactForm.js) |
| Client-side validation rules | [`src/utils/contactFormValidation.js`](../../src/utils/contactFormValidation.js) |
| Layout and benefit list styling | [`src/App.css`](../../src/App.css) (`.contact-*`) |
| Form card and input styling | [`src/ContactForm.css`](../../src/ContactForm.css) |
| SEO titles/descriptions | [`src/config/site.js`](../../src/config/site.js) → `PAGE_META` |

## Form fields

| Field | Member | Leader | Speaker | Business | Required |
|-------|--------|--------|---------|----------|----------|
| `name` | ✓ | ✓ | ✓ | ✓ | Yes |
| `email` | ✓ | ✓ | ✓ | ✓ | Yes |
| `mobile` | ✓ | ✓ | ✓ | ✓ | No |
| `talkTitle` | — | — | ✓ | — | Yes (speaker only) |
| `message` | ✓ | ✓ | ✓ | ✓ | Yes |
| Turnstile | ✓ | ✓ | ✓ | ✓ | When configured |

Submissions are sent to `POST https://api.mxintech.org/contact` with header `X-Requested-With: MxintechWebsite`.

## Backend

Validation and persistence live in [`infra/contact-api/src/handler.py`](../../infra/contact-api/src/handler.py).

- DynamoDB item includes all submitted fields (`talkTitle` stored when present).
- SES confirmation and team notification emails include phone (or “No proporcionado”) and talk title for speaker submissions.

After changing handler logic, deploy with **AWS deploy → contact-api**. After frontend/copy changes, run **Frontend publish**.

## Adding a new profile

1. Add an entry to `CONTACT_FORMS` in `src/config/contactForms.js`.
2. Add the type to `CONTACT_TYPES` in `contactFormValidation.js` and in the Lambda handler.
3. Add a route in `App.js` and navigation link if needed.
4. Add `PAGE_META` in `site.js`.
5. Update this document.

## Animations

Entrance animations use CSS only (`contact-section--visible`, staggered `contact-form-field--animated`). They are disabled when the user prefers reduced motion (`prefers-reduced-motion: reduce`).
