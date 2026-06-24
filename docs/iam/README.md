# IAM roles for Mxintech-website

This repository deploys with **GitHub Actions OIDC** and runs the contact form on **Lambda behind API Gateway + CloudFront**. IAM roles are created **outside CloudFormation** (same pattern as [invitadoestas](https://github.com/mxintech/invitadoestas)) so org SCPs that block IAM creation from CI still allow deployments.

Account: `401202591305` · Region: `us-east-1` · GitHub repo: `mxintech/Mxintech-website`

## Security admin only — never via CI or automation agents

**IAM roles and policies are owned by your security / platform team.** GitHub Actions, CloudFormation, SAM, and coding agents must **never** create, update, delete, or attach IAM roles or policies.

This repo only **documents** the JSON your admin should apply in the AWS IAM console (or their internal tooling).

When deploy workflows fail with `AccessDenied` on IAM or S3/CloudFormation actions, send your admin the updated JSON from this folder — do not attempt CLI `iam put-role-policy` from the app team.

## Roles to create

| Role name | Purpose | Trust policy | Permissions policy |
|-----------|---------|--------------|-------------------|
| `mxintech-website-lambda-contract-form-role` | Lambda execution for `mxintech-website-contact-form-handler` | [lambda-contact-form-role-trust.json](./lambda-contact-form-role-trust.json) | [lambda-contact-form-role-policy.json](./lambda-contact-form-role-policy.json) |
| `oidc-github-mxintech-website-role` | GitHub Actions deploy + frontend publish for **this repo only** | [oidc-github-deploy-role-trust.json](./oidc-github-deploy-role-trust.json) | [oidc-github-deploy-role-policy.json](./oidc-github-deploy-role-policy.json) |

Tag both roles with `project=mxintech-website` if your organization requires resource tags.

## 1. Contact form Lambda role

**Create role:** `mxintech-website-lambda-contract-form-role`

1. Trust policy → paste [lambda-contact-form-role-trust.json](./lambda-contact-form-role-trust.json)
2. Permissions → create inline policy `ContactFormLambdaAccess` from [lambda-contact-form-role-policy.json](./lambda-contact-form-role-policy.json)

**Permissions summary**

| Service | Access |
|---------|--------|
| CloudWatch Logs | Write to `/aws/lambda/mxintech-website-contact-form-handler` |
| DynamoDB | `PutItem`, `GetItem`, `Query` on `mxintech-website-contact-submissions` (+ indexes); `PutItem`, `GetItem`, `UpdateItem`, `DeleteItem` on `mxintech-website-contact-verification-tokens` |
| SES | `SendEmail` / `SendRawEmail` on identity `mxintech.org` |

**SES identity (verified):**

`arn:aws:ses:us-east-1:401202591305:identity/mxintech.org`

After the role exists, the contact API stack uses it via the `ContactFormLambdaRoleArn` parameter (default in [infra/contact-api/samconfig.toml](../../infra/contact-api/samconfig.toml)).

## 2. GitHub OIDC deploy role

**Create role:** `oidc-github-mxintech-website-role`

1. Trust policy → paste [oidc-github-deploy-role-trust.json](./oidc-github-deploy-role-trust.json)
   - Restricts assumption to `repo:mxintech/Mxintech-website:*`
   - Requires the GitHub OIDC provider: `arn:aws:iam::401202591305:oidc-provider/token.actions.githubusercontent.com`
2. Permissions → create inline policy `MxintechWebsiteDeploy` from [oidc-github-deploy-role-policy.json](./oidc-github-deploy-role-policy.json)

**Permissions summary**

| Area | Scope |
|------|--------|
| CloudFormation | Stacks `mxintech-website`, `mxintech-contact-api` |
| S3 | Publish to `mxintech.org`; SAM artifacts bucket |
| CloudFront | Invalidate website distribution `E3GWK6OJ2D9DKH`; manage contact API distribution via deploy |
| Lambda / API Gateway / DynamoDB / ACM / Route53 | Contact API stack in `us-east-1` |
| Secrets Manager | Read `mxintech-website/cloudflare-widget/turnstile` |
| SSM | Read/write `/mxintech-website/contact-api/*` (origin verify secret) |
| IAM | **`iam:PassRole` only** — attach the pre-created Lambda role; **no** `iam:CreateRole` |

Workflows assume this role ARN:

`arn:aws:iam::401202591305:role/oidc-github-mxintech-website-role`

## GitHub OIDC provider (one-time per account)

If the account does not already have the GitHub OIDC provider, create it once (same as invitadoestas):

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03fa271bd7a0d2cf6e39c2f0d22
```

## Deploy order after roles exist

1. **AWS deploy** → `website` (updates `mxintech-website`)
2. **AWS deploy** → `contact-api` (creates `mxintech-contact-api`; passes Lambda role ARN + SES identity)
3. **Frontend publish** (build + S3 sync + CloudFront invalidation)

## Updating policies

When adding new Lambdas or AWS services:

1. Extend [lambda-contact-form-role-policy.json](./lambda-contact-form-role-policy.json) and ask your **security admin** to update the role in IAM.
2. Extend [oidc-github-deploy-role-policy.json](./oidc-github-deploy-role-policy.json) if CI needs new deploy permissions — **security admin applies** the change.
3. Keep Lambda roles **out of** the SAM/CloudFormation template so OIDC never needs `iam:CreateRole`.

### Current deploy blocker (2026-06-23)

**Website stack** and **frontend publish** are deployed successfully.

**Contact API** stack `mxintech-contact-api` may be in **`ROLLBACK_FAILED`** after a partial create. Ask your security admin to refresh inline policy **`MxintechWebsiteDeploy`** from the latest [oidc-github-deploy-role-policy.json](./oidc-github-deploy-role-policy.json):

1. **`CloudFormationTransform`** — `cloudformation:CreateChangeSet` on `arn:aws:cloudformation:us-east-1:aws:transform/Serverless-2016-10-31` (literal `aws`, not the account ID)
2. **`Route53ChangeStatus`** — `route53:GetChange` on `arn:aws:route53:::change/*` (not on the hosted zone ARN)
3. **`CloudFormationWebsiteStack`** — includes `cloudformation:ContinueUpdateRollback` for stuck stacks

After the policy is applied, re-run **AWS deploy → contact-api** (the workflow skips stuck Route53 records during rollback recovery), then **Frontend publish**.

## Related docs

- [Deployment overview](../deployment/README.md)
- Contact API template: [infra/contact-api/template.yaml](../../infra/contact-api/template.yaml)
- Workflows: [.github/workflows/aws-deploy.yaml](../../.github/workflows/aws-deploy.yaml), [.github/workflows/frontend-publish.yaml](../../.github/workflows/frontend-publish.yaml)
