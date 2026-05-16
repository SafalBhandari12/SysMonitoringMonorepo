# Plan: Remove the onboarding flow entirely

## Goal
Remove the current domain-registration onboarding process so new and existing users go straight into the product without being blocked by onboarding state, domain verification, or any `onboarded` gating.

## What changes
- Delete the onboarding route and all UI that exists only to register or verify a domain.
- Remove every redirect, guard, and feature gate that depends on `user.onboarded` or `/api/onboarding/domain`.
- Keep authentication intact, but stop treating onboarding as a required prerequisite for using the dashboard.
- Remove the domain-ownership verification flow from the product surface.

## Scope of removal
### Routes and pages
- Remove `/onboarding`.
- Remove `/dashboard/domain`.
- Remove onboarding loading states that only exist for the onboarding route.

### API routes
- Remove `/api/onboarding/domain`.
- Remove `/api/onboarding/domain/verify`.

### Client components and actions
- Remove `components/onboarding/domainRegistration.tsx`.
- Remove `components/onboarding/domainVerificationInstructions.tsx`.
- Remove `components/onboarding/domainVerificationButton.tsx`.
- Remove `actions/domain/registerrDomain.ts`.
- Remove `actions/domain/verifyDomain.ts`.
- Remove onboarding-specific helper logic such as domain verification copy, clipboard handling, and verification polling/checks.

### Server and auth state
- Remove the `User.onboarded` field from Prisma and any generated/auth/session typing that exposes it.
- Remove auth-session population that copies `onboarded` into JWT/session payloads.
- Remove any server-side logic that sets `onboarded` to `true` or `false`.
- Remove code that fetches the current domain record during dashboard startup.

### Dashboard and navigation
- Remove sidebar and layout links that point to domain onboarding or domain management.
- Remove any dashboard buttons, cards, or empty states that route users into onboarding.
- Replace onboarding-gated create flows so they are available without checking `onboarded`.

### Database
- Keep the `Domain` table, but remove the onboarding-only schema usage from Prisma where it creates hidden flow control.
- Remove the `onboarded` column from `User`.
- Remove or relax constraints that make the domain record act like a one-time onboarding lock, especially `@unique` constraints on `domain` and `userId` if they are only enforcing onboarding behavior.
- Remove verification-centric columns or defaults that are only needed for the onboarding flow if the table no longer needs them, such as `verificationCode`, `verificationStatus`, `verificationAttempts`, `lastVerificationAttempt`, and `verifiedAt`.
- Update the migration path so existing data survives the schema change without dropping the table, using `ALTER TABLE` style changes rather than table removal.
- Preserve any non-onboarding domain records only if they still serve a product purpose; otherwise migrate them to a neutral shape and stop reading them from onboarding code.

## Files most likely to change
- `apps/web/app/(non-dashboard)/onboarding/page.tsx`
- `apps/web/app/dashboard/domain/page.tsx`
- `apps/web/app/api/onboarding/domain/route.ts`
- `apps/web/app/api/onboarding/domain/verify/route.ts`
- `apps/web/components/onboarding/domainRegistration.tsx`
- `apps/web/components/onboarding/domainVerificationInstructions.tsx`
- `apps/web/components/onboarding/domainVerificationButton.tsx`
- `apps/web/actions/domain/registerrDomain.ts`
- `apps/web/actions/domain/verifyDomain.ts`
- `apps/web/app/types/next-auth.d.ts`
- `apps/web/auth.ts`
- `apps/web/components/app-sidebar.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/dashboard/api/create/page.tsx`
- `apps/web/app/dashboard/apikeys/page.tsx`
- `apps/web/app/dashboard/apigroups/page.tsx`
- `apps/web/prisma/schema.prisma` domain model cleanup, especially uniqueness and relation constraints
- `apps/web/prisma/migrations/*`

## Implementation order
1. Remove all references to onboarding from navigation and dashboard entry points.
2. Remove onboarding pages, API routes, actions, and components.
3. Remove `onboarded` from auth/session and from any feature gating.
4. Remove domain model usage from Prisma schema and update the database migration path.
	Keep the table, but remove onboarding-specific constraints, defaults, and any schema shape that forces a verification gate.
5. Clean up any stale imports, copy, tests, and generated type references.
6. Regenerate Prisma/client artifacts if the schema changes.

## Acceptance criteria
- Visiting the app never sends a user to onboarding.
- No dashboard screen depends on domain registration or verification.
- No code path reads or writes `user.onboarded`.
- No public route or API endpoint for onboarding remains in the app.
- The app still supports login, dashboard access, and existing monitoring features.

## Validation checklist
- Run a workspace search for `onboarding`, `onboarded`, and `/api/onboarding/domain` and confirm only intentional historical artifacts remain.
- Run the web app typecheck/build for the touched package.
- If Prisma schema changes, generate and apply the migration, then verify the client still builds.

## Notes
- If the product still needs a notion of verified customer domains later, reintroduce it as a separate feature with a different name and explicit user value, not as a hidden onboarding gate.