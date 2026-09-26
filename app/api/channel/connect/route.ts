import { NextRequest, NextResponse } from "next/server"
import { getInsforgeServerClient } from "@/lib/insforge-server"
import { channelTypeToSlug } from "@/lib/composio/social"
import { ConnectError, startConnect } from "@/lib/composio/connect"

export async function POST(request: NextRequest) {
  try {
    const { insforge, userId } = await getInsforgeServerClient()
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 401 })

    const { channelTypeId, redirectTo } = await request.json()
    if (!channelTypeId) {
      return NextResponse.json({ error: "Channel type ID is required" }, { status: 400 })
    }

    const { data: channelType, error } = await insforge.database
      .from("channel_types")
      .select("id, type")
      .eq("id", channelTypeId)
      .single()

    if (error || !channelType) {
      return NextResponse.json({ error: "Channel type not found" }, { status: 404 })
    }

    const slug = channelTypeToSlug(channelType.type)
    if (!slug) {
      return NextResponse.json({ error: "This channel is not in the marketplace yet" }, { status: 400 })
    }

    const result = await startConnect({
      userId,
      slug,
      request,
      redirectTo: typeof redirectTo === "string" ? redirectTo : "/settings?tab=channels",
    })
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ConnectError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Error connecting channel:", error)
    return NextResponse.json({ error: "Failed to connect channel" }, { status: 500 })
  }
}
