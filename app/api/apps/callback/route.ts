import { NextRequest, NextResponse } from "next/server"
import { resolveAppUrl } from "@/lib/apps/url"
import { findLatestAccount } from "@/lib/composio/connect"
import { finalizeConnection } from "@/lib/composio/health"
import { verifyConnectState } from "@/lib/composio/state"

function redirectWith(appUrl: string, path: string, params: Record<string, string>) {
  const url = new URL(path, appUrl)
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const appUrl = resolveAppUrl(request)
  const params = request.nextUrl.searchParams
  const stateValue = params.get("state")
  const providerError = params.get("error") || params.get("error_description")

  if (!stateValue) {
    return redirectWith(appUrl, "/apps", { connected: "false", error: "missing_state" })
  }

  try {
    const state = verifyConnectState(stateValue)
    const redirectTo = state.redirectTo || "/apps?tab=connected"

    if (providerError) {
      return redirectWith(appUrl, redirectTo, {
        connected: "false",
        slug: state.slug,
        error: providerError,
      })
    }

    const accountId =
      params.get("connected_account_id") ||
      params.get("connectedAccountId") ||
      params.get("connectedAccount")

    const account = accountId
      ? { id: accountId, authScheme: null as string | null }
      : await findLatestAccount(state.userId, state.slug)

    if (!account?.id) {
      return redirectWith(appUrl, redirectTo, {
        connected: "false",
        slug: state.slug,
        error: "missing_account",
      })
    }

    const app = await finalizeConnection({
      userId: state.userId,
      slug: state.slug,
      connectedAccountId: account.id,
      authScheme: "authScheme" in account ? account.authScheme : null,
    })

    return redirectWith(appUrl, redirectTo, {
      connected: app.status === "connected" ? "true" : "false",
      slug: state.slug,
      status: app.status,
      ...(app.status !== "connected" ? { error: app.lastError || app.status } : {}),
    })
  } catch (error) {
    console.error("GET /api/apps/callback", error)
    return redirectWith(appUrl, "/apps", {
      connected: "false",
      error: "callback_failed",
    })
  }
}
