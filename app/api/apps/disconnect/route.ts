import { NextRequest, NextResponse } from "next/server"
import { getInsforgeServerClient } from "@/lib/insforge-server"
import { ConnectError, disconnectApp } from "@/lib/composio/connect"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getInsforgeServerClient()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const slug = String(body.slug || "")
    const app = await disconnectApp({ userId, slug })
    return NextResponse.json({ app })
  } catch (error) {
    if (error instanceof ConnectError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("POST /api/apps/disconnect", error)
    return NextResponse.json({ error: "Failed to disconnect app" }, { status: 500 })
  }
}
