# Skein build tracker

**Product:** Skein  
**Studio:** Northloop (“Powered by Northloop” on every surface)  
**Follow this file** to see what is done vs pending. Spec lives in [features.md](features.md). Platform research stays in [STEPS.md](STEPS.md).

How to update: change `[ ]` to `[x]` when a step is done. Add a one-line note under **Last change** if something is blocked.

**Last change:** 2026-09-27 — Phase 2 publish path now uses Composio `session.execute` plus per-post `sleepUntil`. Prove X/LinkedIn yourself after you connect.

---

## Status legend

| Mark | Meaning |
|---|---|
| `[x]` | Done |
| `[ ]` | Pending |
| `[-]` | Skipped / not needed now |

---

## Already in the product

- [x] Clerk sign-in / sign-up routes (needs real Clerk keys — keys are in `.env`)
- [x] Skein marketing site (hero, features, workflow, channels, 3-plan pricing)
- [x] Powered by Northloop on logo, footer, pricing
- [x] Dashboard + New Post
- [x] Ideas Kanban
- [x] AI idea generation
- [x] Calendar + list views
- [x] Compose / schedule / publish-now
- [x] AI draft: generate, rephrase, shorten, expand (still gated on Clerk pro/premium)
- [x] Image upload (posts only)
- [x] Channel previews
- [x] Connect / disconnect UI (Composio marketplace on `/apps`; Settings Channels is the Social shortcut)
- [x] Inngest scheduled publish (X + LinkedIn only)
- [x] Billing page (Clerk PricingTable — not InsForge yet)
- [x] InsForge env + Composio API key in `.env`
- [x] Landing type no longer smashed (Inter + system fallbacks)
- [x] Clerk “Configure your application” dock hidden; sign-in title is Skein

---

## Phase 0 — Prep

- [x] `COMPOSIO_API_KEY` in `.env`
- [x] InsForge URL + anon key + project API key
- [x] Clerk publishable + secret keys in `.env`
- [ ] Composio X custom auth config (`COMPOSIO_TWITTER_AUTH_CONFIG_ID`)
- [x] Apply InsForge SQL (scheduling tables + lookup seed + RLS)
- [x] Fix `lib/insforge-server.ts` per-request client
- [x] Clerk JWT template `insforge` (HS256 + InsForge JWT secret)
- [ ] Create `northloop` storage bucket (infra name stays Northloop)
- [x] Public `/api/webhooks/(.*)` in `proxy.ts`
- [ ] `npx @insforge/cli payments stripe status` + test webhooks
- [ ] Rename the Clerk application to **Skein** in [dashboard.clerk.com](https://dashboard.clerk.com) (stops “My Application”)

**Checkpoint:** InsForge tables exist, Stripe healthy, Composio key works, Clerk sign-in works without the dock.

---

## Phase 1 — Marketplace + connect (category-wise)

- [x] `lib/composio/client.ts` + catalog helpers
- [x] Cache job for Composio toolkits / categories
- [x] `GET /api/apps/categories`
- [x] `GET /api/apps` (category, search, cursor)
- [x] `GET /api/apps/connected` grouped by category
- [x] `POST /api/apps/connect`
- [x] API-key connect form
- [x] Callback + health check + `user_connected_apps`
- [x] Disconnect + reconnect
- [x] Social slugs also upsert `user_channels`
- [x] `/apps` marketplace UI (category rail + search + cards)
- [x] My apps grouped by category
- [x] Sidebar **Apps** + connected logos by category
- [ ] Test: OAuth (Gmail/Slack + LinkedIn)
- [ ] Test: X custom auth
- [ ] Test: one API-key app
- [ ] Test: failed health → `needs_reauth`
- [ ] Test: Instagram in Social + Schedule
- [ ] Test: disconnect removes app from Skein and Composio

**Checkpoint:** Browse Social vs Productivity, connect two auth types, category grouping is correct.

---

## Phase 2 — Publish through Composio

- [x] `lib/composio/publish.ts` fixed tool map
- [x] Inngest uses `session.execute` (no direct X/LinkedIn HTTP)
- [x] Per-post `sleepUntil` + cron safety net
- [ ] Prove X text
- [ ] Prove X + image
- [ ] Prove LinkedIn

**Checkpoint:** Queued X and LinkedIn posts go live at `scheduled_at`.

---

## Phase 3 — Agent

- [ ] `POST /api/agent/run`
- [ ] Restricted session = connected apps only
- [ ] Gemini tool loop via InsForge
- [ ] Queue-only first (Pro+)
- [ ] Agent panel on Schedule
- [ ] Post-now later (Business, Phase 6)

**Checkpoint:** “Plan 5 posts for next week” inserts queued rows only.

---

## Phase 4 — Remaining publish apps

- [ ] Instagram container + poll + publish (JPEG, public URL)
- [ ] Facebook Page
- [ ] YouTube
- [ ] Threads
- [ ] Bluesky / TikTok if toolkit works
- [ ] Composer: one draft → per-channel variants

**Checkpoint:** Scheduled Instagram image publishes. Unknown toolkits return a clear error.

---

## Phase 5 — Inbox, auto-reply, file-in-DM

- [ ] SQL: inbound events, rules, runs, assets
- [ ] `/api/webhooks/meta`
- [ ] Poll cron backup
- [ ] `/dashboard/inbox`
- [ ] `/dashboard/automations` + asset picker
- [ ] Public reply → private text → `WAIT_FOR_REPLY`
- [ ] YES → file DM
- [ ] Safety: no self-reply, one private reply, cooldown, kill switch

**Checkpoint:** Comment “PDF” → public + private CTA → YES → file. No double send.

---

## Phase 6 — Stripe (InsForge)

- [ ] Products: Skein Pro, Skein Business
- [ ] Prices: $29 / $290 and $79 / $790
- [ ] Price IDs in env
- [ ] `/api/billing/checkout` + portal
- [ ] Replace Clerk PricingTable
- [ ] Landing pricing already matches (verify after checkout)
- [ ] `user_entitlements` + webhook trigger
- [ ] `getEntitlements()` on AI, agent, caps, rules, file-DM

**Checkpoint:** Test upgrade Studio → Pro unlocks AI. File-DM stays Business.

---

## Do not start yet

- Team seats / org billing
- Live Stripe
- Custom compose UI for all 1000+ apps
- Auto-reply on Facebook / X / YouTube
- Unofficial bots
