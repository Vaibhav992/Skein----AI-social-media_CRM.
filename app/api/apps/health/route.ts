import { NextRequest, NextResponse } from "next/server"
import { getInsforgeServerClient } from "@/lib/insforge-server"
import { finalizeConnection } from "@/lib/composio/health"
import { getUserConnectedApp } from "@/lib/composio/persist"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getInsforgeServerClient()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const slug = String(body.slug || "")
    const existing = await getUserConnectedApp(userId, slug)
    if (!existing?.composioConnectedAccountId) {
      return NextResponse.json({ error: "App is not connected" }, { status: 404 })
    }

    const app = await finalizeConnection({
      userId,
      slug,
      connectedAccountId: existing.composioConnectedAccountId,
      authScheme: existing.authScheme,
    })
    return NextResponse.json({ app })
  } catch (error) {
    console.error("POST /api/apps/health", error)
    return NextResponse.json({ error: "Failed to run health check" }, { status: 500 })
  }
}
