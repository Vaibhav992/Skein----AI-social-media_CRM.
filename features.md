# Skein features and steps from here

Last updated: 2026-09-26.

**Skein** is the product. **Northloop** is the studio. Every surface says “Powered by Northloop”.

This file is the working list of **what exists**, **what we are building**, and **the order we will do it**. Track checkbox status in [steps-track.md](steps-track.md). [STEPS.md](STEPS.md) stays as platform research. Decisions here override STEPS.md where they conflict.

**Decided:**

- Every connection goes through **Composio**. Custom OAuth in `lib/social-oauth` is replaced, not kept as a hybrid.
- Skein shows the **full Composio marketplace** (~1000+ toolkits, 1558 listed in their catalog as of 2026-09-26), not only the 8 social networks.
- Browse, search, and connect are **category-wise**. Connected apps appear in Northloop **grouped by those same categories**.
- Clerk stays for **login only**.
- InsForge Stripe is the **only** subscription catalog (not Clerk Billing).
- Skein owns **schedule, inbox ingest, rules, entitlements, and the marketplace UI**. Composio owns **the catalog, OAuth, and outbound API calls**. Composio is not a scheduler and not an LLM.

```text
Creator
  → Clerk (who you are)
  → Skein marketplace (categories + search)
  → Composio authorize / API key
  → user_connected_apps (by category)
  → social subset also syncs to user_channels (calendar + publish)
  → Inngest + agent use session.execute
```

---

## 1. Built now (16)

These already exist in the repo.

| # | Feature | Notes |
|---|---|---|
| 1 | Clerk sign-in / sign-up | Working |
| 2 | Skein marketing site | Landing; pricing now matches Studio / Pro / Business |
| 3 | Dashboard + New Post | Sidebar |
| 4 | Ideas Kanban | Create, edit, drag columns |
| 5 | AI idea generation | InsForge Gemini |
| 6 | Calendar view | `/schedule` |
| 7 | List view | `/schedule` |
| 8 | Compose and schedule a post | Create / edit dialogs |
| 9 | Publish now | Queues the post immediately |
| 10 | AI draft: generate, rephrase, shorten, expand | Gated on Clerk `pro` / `premium` today |
| 11 | Image upload | Posts only, not a DM asset library |
| 12 | Native-looking previews | 7 channel previews |
| 13 | Connect channel UI | Still custom OAuth, not Composio |
| 14 | Disconnect channel | Settings |
| 15 | Scheduled auto-publish | Inngest every 10 minutes; **X and LinkedIn only** |
| 16 | Billing page | Clerk `PricingTable`; not InsForge Stripe yet |

**Channel truth today:** the UI lists 8 networks. Publish works for **X** and **LinkedIn**. Instagram, Facebook, Threads, YouTube, TikTok, and Bluesky throw `Unsupported provider type`.

**Not built:** Composio marketplace, category-wise connected apps, inbox, automation rules, private reply, file-in-DM, asset library, Composio connect, AI agent, InsForge Stripe entitlements, team seats.

---

## 2. Features we are building

### 2.1 App marketplace (1000+ Composio apps, category-wise)

Composio is the catalog. Skein is the storefront. Users must be able to **find an app by category, connect it, prove it works, and see it under that category** in the product.

Public catalog today ([Composio toolkits](https://docs.composio.dev/toolkits), [list toolkits](https://docs.composio.dev/reference/api-reference/toolkits/getToolkits), [list categories](https://docs.composio.dev/reference/api-reference/toolkits/getToolkitsCategories)):

- `GET https://backend.composio.dev/api/v3.1/toolkits/categories` → `{ id, name }`
- `GET https://backend.composio.dev/api/v3.1/toolkits?category=&search=&sort_by=usage&limit=1000` → slug, name, logo, description, `auth_schemes`, `no_auth`, `tools_count`, `categories[]`

Do **not** hardcode 1000 app names. Cache the catalog in InsForge (`composio_toolkit_cache`, refresh every 6–12 hours) so the marketplace stays fast and we still pick up new apps.

**Northloop UI**

| Surface | What it shows |
|---|---|
| `/apps` (sidebar: **Apps**) | Marketplace: category nav + search + app cards |
| `/apps?tab=connected` | This user’s apps, **grouped by category** |
| Settings → Channels | Shortcut into **Marketing & Social Media** only (the 8 publish networks) |
| Sidebar “Connected” | Category sections (Social, Productivity, CRM, …) with connected logos |

Marketplace card: logo, name, short description, auth badge (`OAuth` / `API key` / `No auth`), tool count, **Connect** or **Connected**.

**Categories (live from Composio, display order we pin)**

Use Composio’s `id` for filters. Pin this order in the UI so Social is first. Hide empty categories.

1. Marketing & Social Media / Social Media (X, Instagram, LinkedIn, YouTube, …)
2. Collaboration & Communication (Gmail, Slack, Teams, Discord, …)
3. Document & File Management (Google Drive, Dropbox, Notion, …)
4. Productivity & Project Management (Linear, Jira, Asana, Trello, …)
5. CRM / Sales & Customer Support (HubSpot, Salesforce, …)
6. Analytics & Data
7. E-commerce
8. Finance & Accounting
9. Advertising & Marketing
10. Scheduling & Booking
11. Design & Creative Tools
12. AI & Machine Learning
13. Developer Tools & DevOps
14. HR & Recruiting
15. Education & LMS
16. Entertainment & Media
17. Workflow Automation
18. Everything else Composio returns

**Connect (must actually work)**

Clerk `userId` = Composio `user_id`. One identity.

1. User clicks Connect on a card.
2. Server creates `composio.create(clerkUserId)` (optional `authConfigs` for X and later branded Meta).
3. Auth path by toolkit:
   - **OAuth (managed or custom):** `session.authorize(slug)` → redirect → callback.
   - **API key:** Northloop modal (fields from toolkit auth schema / `auth_guide_url`) → create connected account. Never log the key.
   - **No auth:** mark enabled; no OAuth. These are utilities (search, etc.), not “my Slack”.
4. Callback lists that user’s `connected_accounts` for the slug, stores `composio_connected_account_id`.
5. **Health check** before we show Connected: run one cheap read tool (profile / `who_am_i` / list-1). If it fails, status = `needs_reauth` and we do **not** pretend it works.
6. Disconnect: revoke on Composio, then set `status = disconnected`.

**Where connected apps live in Northloop**

Two tables, one product:

| Table | Purpose |
|---|---|
| `user_connected_apps` | Every marketplace connect: slug, name, logo, **category ids**, account id, handle, `status` (`connected` / `needs_reauth` / `failed`), `last_health_at` |
| `user_channels` | Only the **publish** subset (the 8 social networks). Filled automatically when that toolkit connects, so calendar / compose / Inngest keep working |

A connected Gmail appears under **Collaboration & Communication**, not in the post composer. A connected Instagram appears under **Social** *and* as a schedule channel.

**Workable rules (do not skip)**

- After every successful OAuth, run the health check in the callback (or Inngest `apps/health-check`).
- Daily job: re-check all `connected` apps; flip to `needs_reauth` on 401/190.
- Sidebar and `/apps?tab=connected` only show `connected`. `needs_reauth` shows a Reconnect badge.
- Agent sessions only include toolkits with `status = connected`.
- Hide deprecated toolkits. Prefer `sort_by=usage`. Paginate; do not dump 1500 cards on first paint (category + search first).
- API-key apps must complete the form; a Connect button that 404s is a bug.
- X still needs our custom auth config. If that env is missing, the X card says “Ask the workspace admin to add X credentials”, not a dead redirect.

**Plan caps (marketplace vs publish channels)**

- Studio: 3 **publish channels** + 5 **other apps**
- Pro: 10 publish channels + 25 other apps
- Business: unlimited both

Connecting Notion does not eat an Instagram slot.

**Honest limits**

- Listing 1000+ apps ≠ a custom UI for each one. Marketplace + connect + health + agent/tools is the product. First-class compose/preview stays on the 8 social networks.
- Composio does **not** skip Meta / Google / TikTok app review.
- Instagram comment tools often fail on managed auth until your Meta app has the comment/message scopes.
- Most social toolkits have **0 inbound triggers**. Auto-reply ingest stays ours.
- Managed OAuth consent may say “Composio wants access” until we add custom auth configs.

### 2.2 Social publish map (subset of the marketplace)

These eight stay first-class for calendar, previews, and Inngest. They are also marketplace cards under Social.

| Northloop channel | Composio toolkit | Auth | First publish tool (confirm in catalog) |
|---|---|---|---|
| X | `twitter` | **Custom auth config required** (managed Twitter OAuth gone Feb 2026) | `TWITTER_CREATION_OF_A_POST` |
| LinkedIn | `linkedin` | Managed OK to start; custom for production brand | `LINKEDIN_CREATE_LINKED_IN_POST` |
| Instagram | `instagram` | Managed exists; **own Meta app** for comment/DM permissions | create media → poll status → publish |
| Facebook | `facebook` | Custom Meta app recommended | Page post tools |
| Threads | `threads` | Same Meta family | create + publish thread |
| YouTube | `youtube` | Google OAuth via Composio | upload (may stay private until audit) |
| Bluesky | `bluesky` (if toolkit is real) | App password / toolkit auth | post tool |
| TikTok | `tiktok` (if toolkit is useful) | Platform audit still applies | inbox/upload tool |

### 2.3 Deterministic publish (connected social apps)

Inngest keeps the clock. The cron / `sleepUntil` job calls **fixed** Composio tools (`session.execute`). The LLM does not invent a tweet at publish time.

Order we wire publish:

1. X text, then X + image
2. LinkedIn
3. Instagram (JPEG, public HTTPS URL, container + poll + publish)
4. Facebook, YouTube, Threads
5. Bluesky / TikTok only if the toolkit is real

Also replace the 10-minute-only cron with **per-post `sleepUntil(scheduled_at)`**, keep cron as a safety net.

### 2.4 AI that writes and queues (not a free-for-all bot)

**Composer (exists, extend):** one brief → variants per selected channel → one `scheduled_posts` row per channel. Writing stays on InsForge Gemini. No Composio needed to write.

**Agent (new, `/api/agent/run`):** restricted Composio session (only `user_connected_apps` with `status = connected`, not the whole 1000-app catalog) plus Northloop tools (create idea, create/update scheduled post, list calendar, list channels).

- Default: **draft / queue**, human can edit.
- “Post now” is Business only.
- Cap tool calls per run (about 20).
- Log every `session.execute`.

### 2.5 Inbox, auto-reply, and send-file-in-DM

This is the ManyChat-style loop. **v1 is Instagram.** Same tables later for Facebook. Not X/LinkedIn DMs in v1.

Instagram rules we must obey:

- Private reply = **one text, once, within 7 days** of the comment. No file on that message.
- A file DM needs the person to message the account first (**24h window**).
- Composio cannot fire “new comment”. Northloop owns ingest. Composio only **sends** the reply / DM.

```text
Comment "PDF"
  → public reply ("Check your DMs")
  → private reply ("Reply YES and I will send the file")
  → they DM YES
  → send the PDF / image / video
```

**Inbox features**

| Feature | What it does | Plan |
|---|---|---|
| Unified inbox | Comments + DMs in `/dashboard/inbox` | Studio: read-only. Pro+: reply |
| Manual public reply | Human replies from the inbox | Pro+ |
| Deduped ingest | Same comment from webhook + poll = one row | All |
| Kill switch | Stop all automations | Business (log on Business) |

**Auto-reply features**

| Feature | What it does | Plan |
|---|---|---|
| Automation rules | Keyword match (`any` / `all`), per channel, enable/disable | Pro: 5 rules. Business: unlimited |
| Public auto-reply | Reply on the comment thread | Pro+ |
| Private auto-reply | One text DM to the commenter, must include a CTA | Pro+ (text or link only) |
| Link-in-DM | Put the asset URL in the private reply (always works) | Pro+ |
| Wait for reply | After private reply, sit in `WAIT_FOR_REPLY` | Business (needed for file) |
| YES / OK / SEND match | Next DM from that person triggers the file step | Business |
| Expire | No second private reply; expire after 7 days if they never reply | Built-in safety |

**Send-file-in-DM features**

| Feature | What it does | Plan |
|---|---|---|
| Asset library | Upload PDF / image / video to the `northloop` bucket; pick on a rule | Business |
| DM attachment | Send the file only after YES, inside 24h | Business |
| Size checks | Reject over platform limits (IG file 25 MB) at upload | All uploads |
| Run log | Each action: public / private / waiting / file sent / failed | Business |

**How the event fires**

1. Meta webhook `GET/POST /api/webhooks/meta` (`comments`, `messages`). Verify `X-Hub-Signature-256`. Public route in `proxy.ts`.
2. Fallback Inngest poll every 2–5 min (`INSTAGRAM_GET_COMMENTS` / `INSTAGRAM_GET_CONVERSATIONS` via Composio, or direct Graph if polling through Composio is too expensive).
3. Insert `inbound_events` with unique `(platform, external_id)`.
4. Match first enabled rule → Inngest `automation/run`.
5. Public reply tool → private reply text tool → `WAIT_FOR_REPLY`.
6. Later inbound DM with YES → Inngest `automation/dm-file` → attachment tool.

**Safety (not user-editable)**

- Never reply to our own account.
- One run per `(rule, contact)` per cooldown.
- Never send a second private reply for the same comment.
- No file on the first private reply.
- Random delay 10–90s between actions.
- Per-channel rate cap well below Instagram limits.

**v1 out of scope for auto-reply**

- Facebook / X / LinkedIn / YouTube auto-reply (same tables later)
- Story automations as a separate product (story replies already arrive as DMs)
- Unofficial bots / password login
- `HUMAN_AGENT` 7-day tag

### 2.6 Stripe plans (InsForge)

Keys are already in InsForge. Test mode until you say go live.

| Plan | Price | Who it is for |
|---|---|---|
| **Studio** | Free (no Stripe product) | Start the loop |
| **Skein Pro** | $29/mo or $290/yr | Calendar + AI + text auto-reply |
| **Skein Business** | $79/mo or $790/yr | Volume + file-in-DM + agent post-now |

Yearly = 2 months free.

**Studio**

- 1 user, 3 publish channels, 5 other marketplace apps
- Ideas, calendar, list
- Manual compose / schedule
- 30 scheduled posts / month
- Read-only inbox
- No AI, no agent, no auto-rules, no file-in-DM

**Pro**

- Everything in Studio
- 10 publish channels, 25 other marketplace apps
- 300 scheduled posts / month
- AI generate / rephrase / shorten / expand
- Agent “queue a week” with approval (no post-now)
- Inbox + public replies
- 5 rules: keyword → public reply + private **text/link**
- 2 GB media
- Email support

**Business**

- Everything in Pro
- Unlimited publish channels, marketplace apps, and posts
- Agent including post-now
- Unlimited rules
- Full comment → wait YES → **file in DM**
- Run log + kill switch
- 20 GB media
- Priority publish
- Priority support

Enforcement: channel count, monthly post count, AI routes, agent `post_now`, rule `asset_id`. Helper `getEntitlements(userId)` replaces `has({ plan: "pro" })`.

---

## 3. Steps from here

Do these in order. Do not start Phase 5 inbox until X and LinkedIn publish through Composio. Do not start Phase 6 Stripe catalog until checkout can read InsForge.

### Phase 0 — Prep

1. Add `COMPOSIO_API_KEY` (server only).
2. Create an X developer app and a Composio **custom auth config**. Put `COMPOSIO_TWITTER_AUTH_CONFIG_ID` in env.
3. Apply InsForge SQL: existing scheduling tables + `user_channels` Composio columns + unique `(user_id, channel_type_id, provider_account_id)` + `user_connected_apps` + `composio_toolkit_cache`.
4. Fix `lib/insforge-server.ts` to a **per-request** client (no shared `cachedUserId`).
5. Create the `northloop` storage bucket.
6. Add `/api/webhooks/(.*)` to public routes in `proxy.ts` (needed before Meta webhooks).
7. `npx -y @insforge/cli payments stripe status` and `webhooks configure --environment test`.
8. Clerk keys so you can sign in and test connect.

**Checkpoint:** InsForge tables exist, Stripe status is healthy, Composio key works.

### Phase 1 — Marketplace + connect (category-wise, must work)

1. Add `lib/composio/client.ts`. Catalog helpers: categories, list toolkits (`sort_by=usage`, paginate, search, `category=`).
2. Nightly/6h job: refresh `composio_toolkit_cache` from Composio v3.1 (do not call the full catalog on every page view).
3. Routes:
   - `GET /api/apps/categories`
   - `GET /api/apps?category=&q=&cursor=`
   - `GET /api/apps/connected` (grouped by category)
   - `POST /api/apps/connect` `{ slug }` → authorize URL or `{ needsApiKey: true, fields }`
   - `POST /api/apps/connect/api-key` `{ slug, secrets }`
   - `GET /api/apps/callback` → connected account + **health check** + upsert `user_connected_apps`
   - `POST /api/apps/disconnect`
   - `POST /api/apps/reconnect` / health-check
4. If the slug is one of the 8 publish networks, also upsert `user_channels` (old `/api/channel/connect` becomes a thin wrapper).
5. UI: `/apps` marketplace (category rail, search, cards) + **My apps** grouped by category. Sidebar **Apps** + connected logos by category. Settings → Channels stays the Social shortcut.
6. Manual test matrix (must pass before calling it done):
   - OAuth: Gmail or Slack + LinkedIn
   - Custom auth: X
   - API key: one key-based toolkit
   - Health check fail → `needs_reauth`, Reconnect works
   - Connected list is category-wise; Instagram also appears in Schedule channels
   - Disconnect removes it from Northloop and Composio

**Checkpoint:** User can browse Social vs Productivity, connect two different auth types, see them under the right category, and a failed token does not show as Connected.

### Phase 2 — Publish through Composio

1. `lib/composio/publish.ts` with a **fixed** tool map.
2. Rewrite `inngest/functions/publish-scheduled-posts.ts` to `session.execute`. No `publishToTwitter` / LinkedIn HTTP.
3. Per-post `sleepUntil(scheduled_at)` + cron safety net.
4. Prove: X text → X + image → LinkedIn.

**Checkpoint:** A queued X post and a LinkedIn post go live at `scheduled_at`.

### Phase 3 — Agent

1. `POST /api/agent/run` with restricted session + Northloop custom tools.
2. Gemini tool loop via InsForge.
3. Queue-only first. Gate on Pro+.
4. Agent panel on Schedule: prompt, channels, Draft / Queue / Post now.
5. Unlock post-now later (Business, Phase 6 entitlements).

**Checkpoint:** “Plan 5 posts for next week” inserts queued rows. Nothing publishes unless Inngest runs or the user said post-now.

### Phase 4 — Remaining publish apps

1. Instagram: public JPEG URL, container, poll `FINISHED`, publish. Convert uploads to JPEG.
2. Facebook Page, YouTube, Threads.
3. Bluesky / TikTok only if the toolkit works.
4. Composer: one draft → per-channel variants → one row per channel.

**Checkpoint:** Scheduled image (and IG Reel if tools allow) publishes on Instagram. Unsupported toolkits still return a clear error.

### Phase 5 — Inbox, auto-reply, file-in-DM

1. SQL: `inbound_events`, `automation_rules`, `automation_runs`, `automation_assets` (+ contacts / cooldown if needed). RLS: `requesting_user_id() = user_id`.
2. `/api/webhooks/meta`: verify token on GET, HMAC on POST, `inngest.send`, return 200.
3. Poll cron as backup. Dedup on `external_id`.
4. `/dashboard/inbox` and `/dashboard/automations` + asset picker.
5. Inngest `automation/run`: match rule → public reply → private reply text → `WAIT_FOR_REPLY`.
6. Inngest `automation/dm-file`: YES → attachment. Expire after 7 days.
7. Safety: no self-reply, one private reply, cooldown, kill switch.

**Checkpoint:** A non-tester comments “PDF”, gets a public reply + DM with a CTA, replies YES, receives the file. Duplicate ingest does not double-send.

### Phase 6 — Stripe catalog and entitlements

1. Create products **Skein Pro** and **Skein Business**.
2. Prices: Pro $29 / $290, Business $79 / $790 (USD).
3. Put `price_…` IDs in env. Do not hardcode.
4. `POST /api/billing/checkout` and `POST /api/billing/portal` via InsForge Stripe SDK. Subject `{ type: 'user', id: clerkUserId }`.
5. Replace Clerk `PricingTable`. Rewrite landing pricing to the three plans in §2.6.
6. `user_entitlements` + trigger on `payments.webhook_events` (`invoice.paid`, subscription updated/deleted/paused/resumed). Never grant from the success URL.
7. `getEntitlements(userId)` on AI, agent, connect caps, post caps, rules, and `asset_id`.

**Checkpoint:** Test checkout upgrades Studio → Pro. AI unlocks. Portal cancels back to Studio. File-in-DM stays locked until Business.

---

## 4. What we stop maintaining

- Per-platform `*_CLIENT_ID` token exchange in `lib/social-oauth` (X credentials live on the Composio auth config).
- Encrypting social tokens in the channel callback.
- `publishToTwitter` / `publishToLinkedIn` direct HTTP.
- Clerk Billing / `has({ plan: "pro" })` / `has({ plan: "premium" })`.

Keep `lib/encryption.ts` only if something else still needs it.

---

## 5. Out of scope until we say otherwise

- Team seats / org billing
- Live Stripe
- Razorpay
- A custom compose UI for every one of the 1000+ apps (marketplace + agent tools is enough)
- Auto-reply on Facebook, X, YouTube in v1
- Unofficial Instagram/X bots
- Replacing Meta App Review via Composio (impossible)
