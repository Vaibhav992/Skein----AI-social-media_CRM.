import { NextRequest, NextResponse } from "next/server"
import { getInsforgeServerClient } from "@/lib/insforge-server"
import { ConnectError, connectWithApiKey } from "@/lib/composio/connect"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getInsforgeServerClient()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const slug = String(body.slug || "")
    const secrets = (body.secrets || {}) as Record<string, string>
    const sanitized: Record<string, string> = {}
    for (const [key, value] of Object.entries(secrets)) {
      if (typeof value === "string" && value.trim()) sanitized[key] = value.trim()
    }

    const app = await connectWithApiKey({ userId, slug, secrets: sanitized })
    return NextResponse.json({ app })
  } catch (error) {
    if (error instanceof ConnectError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("POST /api/apps/connect/api-key", error)
    return NextResponse.json({ error: "Failed to connect with API key" }, { status: 500 })
  }
}
