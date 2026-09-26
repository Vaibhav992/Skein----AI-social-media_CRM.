import { NextRequest, NextResponse } from "next/server"
import { getInsforgeServerClient } from "@/lib/insforge-server"
import { ConnectError, startConnect } from "@/lib/composio/connect"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getInsforgeServerClient()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const slug = String(body.slug || "")
    const result = await startConnect({
      userId,
      slug,
      request,
      redirectTo: typeof body.redirectTo === "string" ? body.redirectTo : "/apps?tab=connected",
    })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ConnectError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("POST /api/apps/reconnect", error)
    return NextResponse.json({ error: "Failed to reconnect app" }, { status: 500 })
  }
}
