# documenso (Verafirma fork) — current state

_Last updated: 2026-04-27, by Code Claude (rebuild-docs pass)_

## TL;DR

Whitelabel/reskinned fork of upstream `documenso/documenso`, used as Verafirma's
signing surface. Five fork commits stack on top of upstream v2.8.1: rebrand to
Verafirma, redirect unauthenticated traffic to verafirma.com, and disable
cert-chain building so self-signed CAs work.

## What's working

- All upstream documenso functionality (envelope creation, signing flows, REST
  V1 + tRPC V2 APIs, webhook delivery, auth via OAuth + passkeys).
- Fork-specific behavior: Verafirma-branded signing UI, redirect to
  https://www.verafirma.com on root + signup, self-signed cert support in local
  signing transport, `noindex, nofollow` robots on the signing app.
- Standard upstream dev loop (`npm run dx`) works on this fork.

## What's WIP

- Nothing actively in flight inside the fork itself. The five fork commits all
  landed 2026-04-07 → 2026-04-11.
- Next likely change: establishing a fork-sync workflow (see Sharp edges).

## What's broken / known bugs

- No bugs introduced by the fork commits (changes are surgical: redirects,
  branding strings, one boolean in signing transport).
- Upstream issues inherited as-is — refer to `documenso/documenso` issue
  tracker.

## How to run it (cheat sheet)

```bash
# install + bring up local infra
npm run dx           # convenience: ci → docker up → migrate → seed
# OR step-by-step
npm install
npm run dx:up        # postgres :54320, redis, minio, inbucket
npm run prisma:migrate-dev
npm run prisma:seed

# dev
npm run dev          # Remix on :3000

# build / deploy
# (no fork-specific deploy docs yet — TODO)
```

## Environment variables

See `.env.example` (large; categories below). Fork-specific defaults:
`NEXT_PRIVATE_SMTP_FROM_ADDRESS=service@verafirma.com`,
`NEXT_PRIVATE_SMTP_FROM_NAME=Verafirma`, plus Resend wiring.

Categories:

- **App**: `NEXT_PUBLIC_WEBAPP_URL`, `NEXT_PRIVATE_INTERNAL_WEBAPP_URL`, `PORT`
- **Database**: `NEXT_PRIVATE_DATABASE_URL`, `NEXT_PRIVATE_DIRECT_DATABASE_URL`
- **Auth**: `NEXTAUTH_SECRET`, OAuth (Google, Microsoft, OIDC), passkeys
- **Crypto**: `NEXT_PRIVATE_ENCRYPTION_KEY`,
  `NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY` (32+ char each)
- **Email**: `NEXT_PRIVATE_SMTP_*` / `NEXT_PRIVATE_RESEND_*`
- **Signing**: transport (local P12 or GCP HSM), passphrase, cert paths,
  timestamp authority URLs
- **Storage**: transport (database or S3), MinIO/S3 endpoint, bucket, access
  keys
- **License**: `NEXT_PRIVATE_DOCUMENSO_LICENSE_KEY` (enterprise features)

## External dependencies

**Calls out to**: Postgres, Redis, MinIO/S3, Resend (or any SMTP), timestamp
authorities (FreeTSA), Google Cloud HSM (if HSM transport), OAuth providers,
Stripe (upstream features).
**Called by**: verafirmabolt's `src/services/documenso.ts` —
envelope create / list / distribute / status. End users hit signing pages
directly via the Verafirma signing link.

## Recent significant commits

```
aa98fc65 Rebrand Documenso to Verafirma on signing pages          (FORK)
8c3ab0d1 Disable buildChain for self-signed certificate compatibility (FORK)
9860b331 Redirect unauthenticated root to verafirma.com           (FORK)
26bf0eab Redirect signup to verafirma.com, remove signup link from signin (FORK)
6928a608 Update .env.example                                      (FORK — Resend + Verafirma defaults)
6f650e1c feat: add document rename feature (#2542) (#2595)         (UPSTREAM)
0b9a23c5 fix: handle malformed pdf cropbox/mediabox entries (#2668) (UPSTREAM)
3cca8cda fix: labeler typo (#2670)                                (UPSTREAM)
b13ec890 fix: resolve incorrect recipient comparision check (#2646) (UPSTREAM)
e3b7a9e7 feat: add ability to save documents as template (#2661)  (UPSTREAM)
```

## Architecture / integration notes

- **Fork delta vs upstream `documenso/documenso`** (no `upstream` remote
  configured; identified by author + missing PR-number suffix on the commit
  subject):
  1. `6928a608` — `.env.example`: added Resend + Verafirma email defaults.
  2. `26bf0eab` — `apps/remix/app/routes/_unauthenticated+/{signin,signup}.tsx`:
     signup → redirect to https://www.verafirma.com.
  3. `9860b331` — `apps/remix/app/routes/_index.tsx`: unauthenticated root →
     redirect to https://www.verafirma.com (authed users still go to team
     inbox).
  4. `8c3ab0d1` — `packages/signing/transports/local.ts`: `buildChain: true` →
     `false` for self-signed cert compat.
  5. `aa98fc65` — branding logo (Documenso SVG → "V" in Georgia serif), signing-
     page copy, OG/Twitter meta, `noindex, nofollow` robots, CTA links →
     verafirma.com.
- **License**: AGPL-3.0. If we serve this modified code to customers, they're
  entitled to the source on request. Keep that in mind before adding any
  closed-source features in-tree.
- **Integration boundary**: verafirmabolt is the only internal caller (REST V1
  / tRPC V2). Nothing in this repo references relaystation today. If we ever
  add "signing complete" callbacks back into our stack, those belong in
  `packages/lib`, not in a sixth fork commit.
- **Fork-sync risk**: no `upstream` remote, no documented sync workflow.
  Pulling upstream security patches without a plan would clobber the rebrand.
  Address before next upstream merge.
