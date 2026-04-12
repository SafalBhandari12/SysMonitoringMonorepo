# Create 2 Azure Function Apps (Korea, India)

This guide creates 2 Azure Function Apps for these deployment locations:

- KR -> koreacentral
- IN -> centralindia

## Prerequisites

- Azure CLI installed
- Logged in to Azure: `az login`
- Correct subscription selected: `az account set --subscription <SUBSCRIPTION_ID_OR_NAME>`

Register required providers once per subscription:

```bash
az provider register --namespace Microsoft.Web
az provider register --namespace Microsoft.Storage
az provider register --namespace Microsoft.Insights
az provider register --namespace Microsoft.OperationalInsights

az provider show --namespace Microsoft.Web --query registrationState -o tsv
```

If `registrationState` is not `Registered`, wait and re-check.

## Naming Convention

Use globally unique app names. Example pattern:

- monitoring-hitapi-kr
- monitoring-hitapi-in

Storage account names must be globally unique, lowercase, 3-24 chars, letters and numbers only.

## One-Time Variables

Run this first and update values as needed:

```bash
PROJECT=monitoring-hitapi
RUNTIME=node
RUNTIME_VERSION=24
SKU=Y1
OS=Linux

# Change this to your preferred location for metadata if needed
TAGS="project=monitoring env=prod service=hitApi"
```

## Create 2 Resource Groups

```bash
az group create --name rg-monitoring-hitapi-kr --location koreacentral
az group create --name rg-monitoring-hitapi-in --location centralindia
```

## Create Storage Accounts (One Per Location)

Update names if they are already taken.

```bash
az storage account create --name stmonhitkr001 --resource-group rg-monitoring-hitapi-kr --location koreacentral --sku Standard_LRS
az storage account create --name stmonhitin001 --resource-group rg-monitoring-hitapi-in --location centralindia --sku Standard_LRS
```

## Create 2 Function Apps

```bash
az functionapp create \
  --resource-group rg-monitoring-hitapi-kr \
  --consumption-plan-location koreacentral \
  --runtime node \
  --runtime-version 24 \
  --functions-version 4 \
  --name monitoring-hitapi-kr \
  --storage-account stmonhitkr001 \
  --os-type Linux

az functionapp create \
  --resource-group rg-monitoring-hitapi-in \
  --consumption-plan-location centralindia \
  --runtime node \
  --runtime-version 24 \
  --functions-version 4 \
  --name monitoring-hitapi-in \
  --storage-account stmonhitin001 \
  --os-type Linux
```

## Verify Storage Accounts Before Function App Create

Run this check first. Each account must appear before creating function apps.

```bash
az storage account show -g rg-monitoring-hitapi-kr -n stmonhitkr001 --query "{name:name,location:location}" -o table
az storage account show -g rg-monitoring-hitapi-in -n stmonhitin001 --query "{name:name,location:location}" -o table
```

## Configure Required App Settings

Set settings for each app (repeat for both apps):

```bash
    az functionapp config appsettings set \
  --name monitoring-hitapi-kr \
  --resource-group rg-monitoring-hitapi-kr \
    --settings NODE_ENV=production DATABASE_URL="<YOUR_DATABASE_URL>"
```

Repeat with each app name and resource group:

- monitoring-hitapi-kr / rg-monitoring-hitapi-kr
- monitoring-hitapi-in / rg-monitoring-hitapi-in

## Verify Apps Exist

```bash
az functionapp list --query "[].{name:name, rg:resourceGroup, location:location}" -o table
```

## GitHub Secrets to Add

After creation, set these repo secrets for your workflow:

- AZURE_CREDENTIALS
- AZURE_FUNCTIONAPP_NAME_KR=monitoring-hitapi-kr
- AZURE_FUNCTIONAPP_NAME_IN=monitoring-hitapi-in

## Optional: Add Tags

```bash
az resource tag --tags ${TAGS} --ids $(az functionapp show -g rg-monitoring-hitapi-kr -n monitoring-hitapi-kr --query id -o tsv)
az resource tag --tags ${TAGS} --ids $(az functionapp show -g rg-monitoring-hitapi-in -n monitoring-hitapi-in --query id -o tsv)
```

## Troubleshooting

- If storage account name is already taken, rename it and retry.
- If a region is blocked by `sys.regionrestriction`, use only regions from `listOfAllowedLocations`.
- If a region is unavailable for your subscription, pick a nearby supported region and update the workflow matrix accordingly.
- If runtime version fails, check available runtimes: `az functionapp list-runtimes --linux -o table`.
- If you get `MissingSubscriptionRegistration` for `Microsoft.Web`, run:

```bash
az provider register --namespace Microsoft.Web
az provider show --namespace Microsoft.Web --query registrationState -o tsv
```
