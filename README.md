# mxintech.org — México in Tech | AWS User Group Tlaxcala

Community website: webinars, events, courses, and four contact funnels
(member / leader / speaker / business) with email verification.

**Stack:** React 19 + Vite, React Router 6, Vitest + React Testing Library.
Hosted on S3 + CloudFront; contact API on API Gateway + Lambda + SES (see `infra/`).

## Development

```bash
npm install
npm run dev        # dev server on http://localhost:3000
npm test           # run unit tests once
npm run test:watch # watch mode
npm run build      # production build into build/
npm run preview    # serve the production build locally
```

## Project structure

```
index.html              Vite entry (meta tags, fonts, JSON-LD)
src/
  main.jsx              React root
  App.jsx               Routes + layout composition
  components/layout/    Header, Footer, AnnouncementBar, ThemeToggle
  components/           Reveal (scroll animations), ContactPageLayout, TurnstileWidget
  pages/                HomePage, CursosPage, NotFoundPage
  sections/             Hero, Acercade, Webinars, Eventos
  ContactForm.jsx       Multi-step contact wizard (per-persona)
  config/               brand, contactForms (copy + wizard steps), content, site, social
  utils/                form validation + payload builders
  hooks/                useTheme, usePageMeta
infra/                  CloudFormation/SAM stacks (website + contact API)
docs/                   brand, contact-forms, deployment, iam, monitoring
```

## Environment variables

Copy `.env.example` to `.env`:

```
VITE_API_ENDPOINT=https://api.mxintech.org
VITE_TURNSTILE_SITE_KEY=   # optional locally; empty disables the widget
```

In CI these are resolved from CloudFormation outputs and Secrets Manager.

## Testing

Vitest + React Testing Library. Tests live next to the code they cover
(`*.test.js` / `*.test.jsx`). The deploy workflow runs `npm test` and blocks
publishing if anything fails.

## Deployment

Production deploys run through GitHub Actions (manual dispatch, authorized
actors only):

- **Frontend publish** — runs tests, builds with the resolved API URL +
  Turnstile key, syncs `build/` to S3, and invalidates CloudFront.
- **AWS deploy** — deploys the `website` or `contact-api` CloudFormation/SAM
  stacks (see `.github/workflows/aws-deploy.yaml`).

Manual S3 deploy (needs `S3_BUCKET` env var and AWS credentials):

```bash
export S3_BUCKET=your-website-bucket
npm run deploy:s3
```

### Contact API

The 4 contact forms submit to the same API with a `contactType` field:
`/contact/member`, `/contact/leader`, `/contact/speaker`, `/contact/business`.
Submissions require email verification via a 6-digit OTP sent through SES.
Deployment and configuration details: `docs/deployment/` and
`infra/contact-api/`.
