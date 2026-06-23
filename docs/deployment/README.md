# Deployment

Mxintech-website is deployed manually through GitHub Actions using AWS OIDC.

## Prerequisites

1. **IAM roles** — create the Lambda execution role and the GitHub OIDC deploy role documented in [docs/iam/README.md](../iam/README.md).
2. **Secrets Manager** — `mxintech-website/cloudflare-widget/turnstile` with `SITE_KEY` and `SECRET_KEY`.
3. **SES** — identity `arn:aws:ses:us-east-1:401202591305:identity/mxintech.org` (verified, DKIM configured).
4. **SSM** — created automatically on first contact-api deploy: `/mxintech-website/contact-api/origin-verify-secret`.

## Stacks

| Stack name | Template | Purpose |
|------------|----------|---------|
| `mxintech-website` | [infra/website/root.yaml](../../infra/website/root.yaml) | S3 `mxintech.org`, CloudFront, logging bucket |
| `mxintech-contact-api` | [infra/contact-api/template.yaml](../../infra/contact-api/template.yaml) | Contact form API, DynamoDB, CloudFront `api.mxintech.org` |

## Workflows

| Workflow | Input | Action |
|----------|-------|--------|
| [AWS deploy](../../.github/workflows/aws-deploy.yaml) | `website` or `contact-api` | Update infrastructure |
| [Frontend publish](../../.github/workflows/frontend-publish.yaml) | git ref (default `main`) | Build CRA app, sync to S3, invalidate CloudFront |

Both workflows assume:

`arn:aws:iam::401202591305:role/oidc-github-mxintech-website-role`

## Recommended order

1. Create IAM roles ([docs/iam/README.md](../iam/README.md))
2. **AWS deploy** → `website`
3. **AWS deploy** → `contact-api`
4. **Frontend publish**

## Local development

Copy [.env.example](../../.env.example) to `.env`:

```bash
REACT_APP_API_ENDPOINT=https://api.mxintech.org
REACT_APP_TURNSTILE_SITE_KEY=<from Secrets Manager SITE_KEY>
```

Run `npm start`.

## Contact submissions

Submissions are stored in DynamoDB (`mxintech-website-contact-submissions`) and trigger SES emails when the Lambda role and identity are configured. See [docs/iam/lambda-contact-form-role-policy.json](../iam/lambda-contact-form-role-policy.json).
