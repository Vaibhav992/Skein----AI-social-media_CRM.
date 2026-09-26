# Skein

**Plan once. Publish everywhere.**

Skein is a social workspace for ideas, drafts, and scheduled publishing. It is a [Northloop](https://github.com/Vaibhav992) product — every surface says **Powered by Northloop**.

## What it does

- **Ideas** — Kanban board plus AI idea generation
- **Schedule** — calendar and list views, compose, draft, queue, publish now
- **Apps** — live Composio marketplace (1000+ toolkits), category browse, OAuth / API-key connect
- **Publish** — Inngest waits until `scheduled_at`, then posts through Composio (`session.execute`)
- **Billing** — Studio / Pro / Business pricing on the landing page (InsForge Stripe is next)

First-class compose and calendar stay on eight social networks. The marketplace lists the full Composio catalog. Connected Gmail lives under Productivity; connected Instagram also appears as a schedule channel.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 (App Router), React 19, Tailwind 4 |
| Auth | Clerk (login only) |
| Backend | [InsForge](https://insforge.dev) (Postgres, RLS, storage, AI gateway) |
| Connections | [Composio](https://composio.dev) (catalog, OAuth, outbound tools) |
| Jobs | Inngest (`sleepUntil` + cron safety net) |

Clerk is identity. InsForge is data and billing source of truth. Composio is connect and publish. Custom OAuth is not used.

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Copy `.env.example` and fill real values. Never commit `.env`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_INSFORGE_BASE_URL` | InsForge project URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | InsForge anon key |
| `INSFORGE_PROJECT_API_KEY` | Server / admin InsForge key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Clerk |
| `NEXT_PUBLIC_CLERK_INSFORGE_TEMPLATE` | Clerk JWT template name (`insforge`) |
| `NEXT_PUBLIC_APP_URL` | Public app URL (OAuth callbacks) |
| `COMPOSIO_API_KEY` | Composio **project** API key (`ak_…`, not a consumer `ck_…` key) |
| `COMPOSIO_TWITTER_AUTH_CONFIG_ID` | Required before X / Twitter Connect works |
| `INNGEST_DEV` | Set `1` for local Inngest |

Clerk needs a JWT template named `insforge` (HS256, claims `{ role, aud }`) using the InsForge JWT secret.

Apply SQL in `migrations/` on the InsForge project before using the dashboard.

## Scripts

```bash
npm run dev      # Next.js on :3000
npm run build
npm run start
npm run lint
```

Inngest functions live at `/api/inngest` (cron + per-post publish + catalog refresh + health checks).

## Repo map

| Path | What |
| --- | --- |
| `app/` | Marketing site, dashboard, API routes |
| `components/` | UI, schedule composer, marketplace |
| `lib/composio/` | Catalog, connect, health, publish |
| `inngest/functions/` | Scheduled publish and jobs |
| `migrations/` | InsForge SQL |
| `features.md` | Product spec |
| `steps-track.md` | Live done / pending checklist |

## Plans

| Plan | Price | Caps (intended) |
| --- | --- | --- |
| Studio | Free | 3 publish channels, 5 other apps |
| Pro | $29 / mo | 10 publish + 25 apps, AI, text auto-reply |
| Business | $79 / mo | Unlimited, file-in-DM, agent post-now |

Stripe through InsForge is not live yet. Do not treat Clerk Billing as the catalog.

## Status

Build order is in [steps-track.md](steps-track.md). Spec is in [features.md](features.md).

- Phase 1 marketplace + connect: code done; you connect and verify
- Phase 2 Composio publish: code done; prove X text, X + image, LinkedIn
- Phase 3+ agent, remaining networks, inbox, InsForge Stripe: not started

## License

Private. All rights reserved. Northloop / Skein.
