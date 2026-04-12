# Multi-Region Deployment for hitApi

This function is deployed to 2 regions:

- KR -> `koreacentral`
- IN -> `centralindia`

This mapping is policy-compliant for your current Azure subscription (`sys.regionrestriction`).

Note: This setup intentionally deploys only KR and IN.

## GitHub Actions Workflow

Workflow file:

- `.github/workflows/deploy-hitapi-multi-region.yml`

Trigger conditions:

- Push to `main` when files under `apps/serverless/hitApi/**` change
- Manual run via `workflow_dispatch`

## Required GitHub Secrets

Set these repository secrets before running the pipeline:

- `AZURE_CREDENTIALS`
  - JSON credentials for a service principal with deployment access to both Function Apps.
- `AZURE_FUNCTIONAPP_NAME_KR`
- `AZURE_FUNCTIONAPP_NAME_IN`

## Function App Requirements

You must create 2 Azure Function Apps (one per region) in advance.

Each app should:

- Run on Node.js (compatible with this project)
- Have required app settings configured (for example DB connection settings)
- Be accessible by the same Azure service principal used in `AZURE_CREDENTIALS`
