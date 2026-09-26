import { NextRequest, NextResponse } from "next/server"
import { getInsforgeServerClient } from "@/lib/insforge-server"
import { cacheToolkitPage, ensureCatalogAvailable, fetchLiveToolkitsPage, listCachedToolkits } from "@/lib/composio/catalog"
import { listUserConnectedApps } from "@/lib/composio/persist"
import { inngest } from "@/inngest/client"
import { resolveTwitterAuthConfigId } from "@/lib/composio/client"
import { composioPublicError } from "@/lib/composio/errors"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getInsforgeServerClient()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const category = request.nextUrl.searchParams.get("category") || undefined
    const search = request.nextUrl.searchParams.get("q") || request.nextUrl.searchParams.get("search") || undefined
    const cursor = request.nextUrl.searchParams.get("cursor") || undefined

    const availability = await ensureCatalogAvailable()
    const cacheFresh = availability.source === "cache"
    if (!cacheFresh) {
      await inngest.send({ name: "composio/refresh-catalog" }).catch(() => undefined)
    }

    let page = cacheFresh
      ? await listCachedToolkits({ category, search, cursor })
      : { items: [] as Awaited<ReturnType<typeof fetchLiveToolkitsPage>>["items"], nextCursor: null as string | null, total: 0 }

    if (!cacheFresh) {
      try {
        const live = await fetchLiveToolkitsPage({ category, search, cursor, limit: 40 })
        page = {
          items: live.items,
          nextCursor: live.nextCursor,
          total: live.total,
        }
        await cacheToolkitPage(live.items).catch((error) => {
          console.error("Failed to cache toolkit page", error)
        })
      } catch (error) {
        const fallback = await listCachedToolkits({ category, search, cursor }).catch(() => page)
        if (fallback.items.length === 0) throw error
        page = fallback
        console.error("Live Composio catalog failed; using cache", error)
      }
    }

    const connected = await listUserConnectedApps(userId)
    const connectedBySlug = new Map(connected.map((app) => [app.slug, app]))
    const twitterReady = Boolean(await resolveTwitterAuthConfigId())

    return NextResponse.json({
      items: page.items.map((toolkit) => {
        const app = connectedBySlug.get(toolkit.slug)
        const blockedTwitter = toolkit.slug === "twitter" && !twitterReady
        return {
          ...toolkit,
          status: app?.status || "disconnected",
          handle: app?.handle || null,
          connectDisabledReason: blockedTwitter
            ? "Create a Twitter auth config in Composio, then refresh"
            : null,
        }
      }),
      nextCursor: page.nextCursor,
      total: page.total,
    })
  } catch (error) {
    console.error("GET /api/apps", error)
    const mapped = composioPublicError(error)
    return NextResponse.json({ error: mapped.error }, { status: mapped.status })
  }
}
