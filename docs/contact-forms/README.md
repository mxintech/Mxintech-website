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

## Email verification (2FA)

Submissions require a **two-step flow** (same pattern as [invitadoestas](https://invitadoestas.com)):

1. **`POST /contact/request`** — Validates the form, applies rate limits, sends a 6-digit code to the user's email, and stores the pending payload in DynamoDB (hashed token, 15-minute TTL).
2. **`POST /contact/verify`** — User submits `{ email, token, contactType }`. On success the submission is saved to DynamoDB and confirmation/notification emails are sent.

### Limits

| Limit | Default |
|-------|---------|
| Code TTL | 15 minutes |
| Resend per email | 1 request / 60 seconds |
| Verify attempts per code | 5 |
| Submissions per email / day | 3 |
| Request attempts per IP / hour | 5 |
| Verify attempts per IP / hour | 15 |
| Global outbound emails / day | 200 |
| OTP codes per email / day | 5 |
| Disposable / invalid MX domains | Blocked before send |
| Hard bounces & complaints | Auto-suppressed (`OPTOUT#` in tokens table) |

See [`docs/monitoring/README.md`](../monitoring/README.md) for the CloudWatch dashboard and alarms.

Pending tokens and rate-limit counters live in `mxintech-website-contact-verification-tokens` (TTL on `expiresAt`).

Submissions are sent to `POST https://api.mxintech.org/contact/request` then `POST https://api.mxintech.org/contact/verify` with header `X-Requested-With: MxintechWebsite`.

## Reviewing and responding to submissions

There is no admin dashboard yet. Today the team workflow is:

### 1. Email inbox (fastest)

Each verified submission sends a notification to **`contacto@mxintech.org`** (configured as `NotificationEmail` in the contact API stack).

That email includes:

- Contact profile (member, leader, speaker, business)
- Name, email, phone, message (and talk title for speakers)
- Submission ID and timestamp
- A **Responder al solicitante** button (or reply directly — `Reply-To` is set to the submitter’s email)

**To respond:** hit Reply in your mail client, or use the button. Your reply goes to the person who filled out the form.

The submitter also receives an auto-confirmation from `noreply@mxintech.org` with a summary of what they sent.

### 2. DynamoDB (audit / search)

All verified submissions are stored in **`mxintech-website-contact-submissions`** (AWS Console → DynamoDB → us-east-1).

Each item includes: `id`, `status` (`verified`), `contactType`, `name`, `email`, `mobile`, `message`, `talkTitle` (if any), `timestamp`, `sourceIp`.

The table has a GSI **`StatusTimestampIndex`** (`status` + `timestamp`) for listing recent items by status.

Useful CLI example (read-only):

```bash
aws dynamodb query \
  --table-name mxintech-website-contact-submissions \
  --index-name StatusTimestampIndex \
  --key-condition-expression "#s = :verified" \
  --expression-attribute-names '{"#s":"status"}' \
  --expression-attribute-values '{":verified":{"S":"verified"}}' \
  --scan-index-forward false \
  --limit 20
```

### 3. Optional next steps (not built yet)

- Mark submissions as `reviewed` / `replied` in DynamoDB
- Simple internal admin page or Slack webhook on new submissions
- SES event tracking (bounces/complaints)

## Branded transactional email

Outbound mail from `noreply@mxintech.org` uses HTML templates in [`infra/contact-api/src/email_templates.py`](../../infra/contact-api/src/email_templates.py):

- Official palette (Azul `#1B3F8B`, Rosa `#EF5980`, Carbón `#314044`)
- Logo: `https://mxintech.org/assets/ajolote.png`

Emails sent:

| When | Recipient | Purpose |
|------|-----------|---------|
| `/contact/request` | Submitter | 6-digit verification code |
| `/contact/verify` | Submitter | Confirmation + summary |
| `/contact/verify` | `contacto@mxintech.org` | Team alert with Reply-To |

After changing templates or handler logic, deploy with **AWS deploy → contact-api**.

## Backend

Validation and persistence live in [`infra/contact-api/src/handler.py`](../../infra/contact-api/src/handler.py).

- DynamoDB item includes all submitted fields (`talkTitle` stored when present).
- SES confirmation and team notification emails are sent **after** email verification succeeds.
- Verification tokens table: `mxintech-website-contact-verification-tokens`.

After changing handler logic, deploy with **AWS deploy → contact-api**. After frontend/copy changes, run **Frontend publish**.

## Adding a new profile

1. Add an entry to `CONTACT_FORMS` in `src/config/contactForms.js`.
2. Add the type to `CONTACT_TYPES` in `contactFormValidation.js` and in the Lambda handler.
3. Add a route in `App.js` and navigation link if needed.
4. Add `PAGE_META` in `site.js`.
5. Update this document.

## Animations

Entrance animations use CSS only (`contact-section--visible`, staggered `contact-form-field--animated`). They are disabled when the user prefers reduced motion (`prefers-reduced-motion: reduce`).
