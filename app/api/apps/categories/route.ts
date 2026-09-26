import { NextResponse } from "next/server"
import { getInsforgeServerClient } from "@/lib/insforge-server"
import { ensureCatalogAvailable, fetchLiveCategories, listCachedCategories } from "@/lib/composio/catalog"
import { composioPublicError } from "@/lib/composio/errors"
import { inngest } from "@/inngest/client"

export async function GET() {
  try {
    const { userId } = await getInsforgeServerClient()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const availability = await ensureCatalogAvailable()
    if (availability.source !== "cache") {
      await inngest.send({ name: "composio/refresh-catalog" }).catch(() => undefined)
    }

    let categories = await listCachedCategories()
    if (categories.length === 0) {
      categories = await fetchLiveCategories()
    }

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("GET /api/apps/categories", error)
    const mapped = composioPublicError(error)
    return NextResponse.json({ error: mapped.error }, { status: mapped.status })
  }
}
