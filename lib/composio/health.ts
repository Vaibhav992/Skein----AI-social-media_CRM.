import { createUserSession, getComposio } from "@/lib/composio/client"
import { persistConnectedApp } from "@/lib/composio/persist"

function isAuthFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /401|403|190|expired|revoked|unauthorized|invalid.?token|reauth/i.test(message)
}

function pickHandle(value: unknown): string | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  const candidates = [
    record.handle,
    record.username,
    record.userName,
    record.screen_name,
    record.login,
    record.email,
    record.name,
  ]
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate
  }
  if (record.data && typeof record.data === "object") {
    return pickHandle(record.data)
  }
  return null
}

export async function runHealthCheck(input: {
  userId: string
  slug: string
  connectedAccountId: string
}) {
  const composio = getComposio()
  try {
    const account = await composio.connectedAccounts.get(input.connectedAccountId)
    if (account.status !== "ACTIVE" || account.isDisabled) {
      return {
        ok: false,
        status: account.status === "EXPIRED" || account.status === "REVOKED"
          ? "needs_reauth" as const
          : "failed" as const,
        handle: pickHandle(account.data),
        error: account.statusReason || account.status,
      }
    }

    try {
      const session = await createUserSession(input.userId)
      const state = await session.toolkits({ toolkits: [input.slug] })
      const item = state.items.find((entry) => entry.slug === input.slug)
      if (item?.connection?.connectedAccount?.status && item.connection.connectedAccount.status !== "ACTIVE") {
        return {
          ok: false,
          status: "needs_reauth" as const,
          handle: pickHandle(account.data),
          error: item.connection.connectedAccount.status,
        }
      }
    } catch (error) {
      if (isAuthFailure(error)) {
        return {
          ok: false,
          status: "needs_reauth" as const,
          handle: pickHandle(account.data),
          error: error instanceof Error ? error.message : "Health check failed",
        }
      }
    }

    return {
      ok: true,
      status: "connected" as const,
      handle: pickHandle(account.data),
      error: null,
    }
  } catch (error) {
    return {
      ok: false,
      status: isAuthFailure(error) ? "needs_reauth" as const : "failed" as const,
      handle: null,
      error: error instanceof Error ? error.message : "Health check failed",
    }
  }
}

export async function finalizeConnection(input: {
  userId: string
  slug: string
  connectedAccountId: string
  authScheme?: string | null
}) {
  const health = await runHealthCheck(input)
  return persistConnectedApp({
    userId: input.userId,
    slug: input.slug,
    status: health.status,
    composioConnectedAccountId: input.connectedAccountId,
    handle: health.handle,
    authScheme: input.authScheme,
    lastError: health.error,
  })
}
