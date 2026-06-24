# Monitoring — mxintech.org & contact API

CloudWatch dashboard and alarms ship with the **contact-api** SAM stack (`infra/contact-api/template.yaml`).

## Dashboard

After deploy, open:

**CloudWatch → Dashboards → `mxintech-website-operations`**

Or use stack output `OperationsDashboardUrl`.

Widgets include:

| Section | What it shows |
|---------|----------------|
| Active alarms | All contact/API/SES alarms in one panel |
| Contact API | API Gateway request volume, 4xx, 5xx |
| Contact Lambda | Invocations, errors, p99 duration |
| Website CloudFront | Requests and error rates for the marketing site |
| API CloudFront | Requests and error rates for `api.mxintech.org` |
| OTP & abuse | Rate limits, daily OTP caps, deliverability blocks, verified submissions |
| SES | Send volume, bounce/complaint rates, permanent bounces |
| Security log table | Recent structured `contactEvent` entries |

## Alerts

Alarms publish to SNS topic **`mxintech-website-alerts`**.

Default email subscriber: **`contacto@mxintech.org`** (`AlertNotificationEmail` parameter). Confirm the SNS subscription email after the first deploy.

| Alarm | Triggers when |
|-------|----------------|
| `mxintech-website-contact-lambda-errors` | ≥ 3 Lambda errors in 5 min |
| `mxintech-website-contact-api-5xx` | ≥ 5 API 5xx in 5 min |
| `mxintech-website-contact-api-abuse` | ≥ 120 API 4xx in 10 min (OTP spam / abuse) |
| `mxintech-website-email-cap-exhausted` | Daily SES send budget hit |
| `mxintech-website-otp-abuse` | ≥ 10 daily OTP limit blocks in 15 min |
| `mxintech-website-ses-bounce-rate` | Account bounce rate ≥ 5% (1 h) |
| `mxintech-website-ses-complaint-rate` | Account complaint rate ≥ 0.1% (1 h) |
| `mxintech-website-ses-bounce-volume` | ≥ 10 permanent bounces in 30 min |

SES bounce/complaint **events** also email **`contacto@mxintech.org`** via the `mxintech-website-ses-feedback` SNS topic.

## Abuse & SES protections (Lambda)

The contact handler enforces:

| Control | Default |
|---------|---------|
| OTP resend cooldown (per email) | 60 s |
| OTP codes per email per day | 5 |
| Verified submissions per email per day | 3 |
| OTP requests per IP per hour | 5 |
| Verify attempts per IP per hour | 15 |
| Verify attempts per code | 5 |
| Global SES sends per day | 200 |
| Disposable email domains | Blocked |
| Domains without MX records | Blocked |
| Opted-out / hard-bounced addresses | Suppressed (no send) |

Permanent bounces and spam complaints auto-add `OPTOUT#` records in `mxintech-website-contact-verification-tokens`.

## Deploy

```bash
# GitHub Actions → AWS deploy → contact-api
```

Parameters (optional overrides):

- `AlertNotificationEmail` — alarm + SES feedback inbox
- `FrontendCloudFrontDistributionId` — website CloudFront ID for dashboard
- `LogRetentionDays` — default 14

## IAM

Deploy role needs CloudWatch, SNS, and SES configuration-set permissions — see [`docs/iam/oidc-github-deploy-role-policy.json`](../iam/oidc-github-deploy-role-policy.json).

Lambda role needs SES feedback + tokens table access — see [`docs/iam/lambda-contact-form-role-policy.json`](../iam/lambda-contact-form-role-policy.json).
