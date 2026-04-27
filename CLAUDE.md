# documenso (Verafirma fork)

## What this is

A **fork of [documenso/documenso](https://github.com/documenso/documenso)**
(the open-source DocuSign alternative, AGPL-3.0). We use it as Verafirma's
whitelabel signing surface — the API + UI customers actually sign documents
on. Five thin commits on top of upstream rebrand it to Verafirma and bend the
auth/redirect behavior to fit our product. We do NOT run this as a standalone
signing SaaS.

## How to run it locally

```bash
npm run dx           # convenience: ci → docker compose up → migrate → seed
npm run dev          # Remix on :3000
```

That's the happy path. Manually:

```bash
npm install
npm run dx:up        # postgres :54320, redis, MinIO (S3-compat), Inbucket (mail)
npm run prisma:migrate-dev
npm run prisma:seed
cp .env.example .env # fill secrets (NEXTAUTH_SECRET, encryption keys, signing passphrase)
```

- Node 22+, npm 10.7+.
- Postgres on port 54320 via docker-compose.
- Storage: local MinIO by default; switch to S3 via env.

## Architecture at a glance

Monorepo (npm workspaces, NOT pnpm — different from relaystation):

- `apps/remix` — main app (React Router 7 / Remix on Hono, port 3000). Login,
  signing, dashboard, API endpoints.
- `apps/docs` — Nextra docs site (port 3002).
- `apps/openpage-api` — public openpage analytics API (port 3003).
- `packages/lib` — server/client/universal business logic.
- `packages/trpc` — tRPC API V2 (with OpenAPI generation).
- `packages/api` — REST API V1 via ts-rest.
- `packages/prisma` — Prisma + Kysely DB layer.
- `packages/signing` — PDF signing (local P12 transport or Google Cloud HSM).
- `packages/auth` — Arctic OAuth + WebAuthn passkeys.
- `packages/email` — React Email templates.
- `packages/ui` — Shadcn + Radix + Tailwind.
- `packages/ee` — Enterprise Edition features.
- `packages/app-tests` — Playwright E2E.

## Conventions worth knowing

- **Upstream's `CONTRIBUTING.md` / `CODE_STYLE.md` / `WRITING_STYLE.md` still
  apply** for any code in `packages/` and most of `apps/remix`. Don't import
  conventions from verafirmabolt or relaystation; treat this codebase as
  upstream-local.
- **Fork commits are minimal by policy** — see "Things to NOT do" for the
  merge-strategy reasoning.
- **Self-signed certs**: signing transport's `buildChain` is `false` in our
  fork to support self-signed CAs. Don't toggle without testing.
- **Robots are `noindex, nofollow`** on the signing app — intentional; we
  don't want our whitelabel surface in search results.

## Things I should NOT do without asking

- **Never `git merge upstream/main` blindly.** The five fork commits include
  UI rebranding that will conflict, and the redirects to verafirma.com would
  be silently reverted by a clean merge. Intended sync workflow: cherry-pick
  / rebase fork commits onto an upstream tag, run a full Playwright pass,
  then push.
- **Don't add an `upstream` remote without a sync plan documented** — there
  isn't one yet, and adding the remote without a process is how clobbers
  happen.
- **Don't relax AGPL compliance.** If we're serving modified code to
  customers, they're entitled to the source. Don't add proprietary wrappers
  in this tree.
- **Don't change the redirects to verafirma.com** without product alignment —
  the unauthenticated root + signup redirects are what makes this a whitelabel
  surface, not a standalone signup funnel.
- **Don't toggle `buildChain` in `packages/signing/transports/local.ts`** —
  self-signed cert support depends on it being `false`.

## Open questions / known sharp edges

- **No upstream remote, no fork-sync doc.** The biggest unaddressed risk: how
  do we pull security patches? Suggested path:
  `git remote add upstream https://github.com/documenso/documenso.git` and a
  documented rebase-on-top workflow. Not done yet.
- **Deployment story not documented in this repo.** Where does it run? How is
  the signing P12 cert provisioned? Capture this when we wire it up.
- **Integration with relaystation/verafirmabolt is unidirectional**:
  verafirmabolt calls this app's REST/tRPC API; this app does not call
  relaystation. If we add "signing complete" callbacks, they'd live in
  `packages/lib`, not in fork-specific commits.
