import { NextResponse } from "next/server"
import { getInsforgeServerClient } from "@/lib/insforge-server"
import { listCachedCategories } from "@/lib/composio/catalog"
import { listUserConnectedApps } from "@/lib/composio/persist"
import { getPlanCaps } from "@/lib/composio/entitlements"
import { isSocialSlug } from "@/lib/composio/social"

export async function GET() {
  try {
    const { userId } = await getInsforgeServerClient()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [apps, categories] = await Promise.all([
      listUserConnectedApps(userId),
      listCachedCategories(),
    ])
    const categoryNames = new Map(categories.map((category) => [category.id, category.name]))
    const visible = apps.filter((app) => app.status !== "disconnected")
    const groups = new Map<string, typeof visible>()

    for (const app of visible) {
      const categoryId = app.categoryIds[0] || "other"
      const list = groups.get(categoryId) || []
      list.push(app)
      groups.set(categoryId, list)
    }

    const grouped = Array.from(groups.entries()).map(([categoryId, categoryApps]) => ({
      categoryId,
      categoryName: categoryNames.get(categoryId) || (categoryId === "other" ? "Other" : categoryId),
      apps: categoryApps,
    }))

    grouped.sort((a, b) => {
      const aOrder = categories.find((category) => category.id === a.categoryId)?.sortOrder ?? 100
      const bOrder = categories.find((category) => category.id === b.categoryId)?.sortOrder ?? 100
      return aOrder - bOrder || a.categoryName.localeCompare(b.categoryName)
    })

    const caps = getPlanCaps()
    const publish = visible.filter((app) => isSocialSlug(app.slug) && app.status === "connected").length
    const other = visible.filter((app) => !isSocialSlug(app.slug) && app.status === "connected").length

    return NextResponse.json({
      groups: grouped,
      apps: visible,
      usage: { publish, other, caps },
    })
  } catch (error) {
    console.error("GET /api/apps/connected", error)
    return NextResponse.json({ error: "Failed to load connected apps" }, { status: 500 })
  }
}
