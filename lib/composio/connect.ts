import { AuthConfigTypes, AuthScheme, AuthSchemeTypes } from "@composio/core"
import { resolveAppUrl } from "@/lib/apps/url"
import { createUserSession, getComposio, resolveTwitterAuthConfigId } from "@/lib/composio/client"
import { authKindFromSchemes, getCachedToolkit } from "@/lib/composio/catalog"
import { getPlanCaps } from "@/lib/composio/entitlements"
import { finalizeConnection } from "@/lib/composio/health"
import { countUserApps, getUserConnectedApp, persistConnectedApp } from "@/lib/composio/persist"
import { isSocialSlug } from "@/lib/composio/social"
import { createConnectState } from "@/lib/composio/state"
import type { AuthField } from "@/lib/composio/types"
import type { NextRequest } from "next/server"

const SECRET_SCHEMES = ["API_KEY", "BEARER_TOKEN", "BASIC", "BASIC_WITH_JWT"] as const

function connectionRedirectUrl(request: ConnectionLike) {
  return request.redirectUrl || request.redirectURL || null
}

type ConnectionLike = {
  redirectUrl?: string | null
  redirectURL?: string | null
  id?: string
}

export async function assertCanConnect(userId: string, slug: string) {
  const existing = await getUserConnectedApp(userId, slug)
  if (existing && (existing.status === "connected" || existing.status === "needs_reauth")) {
    return existing
  }

  const caps = getPlanCaps()
  const counts = await countUserApps(userId)
  const social = isSocialSlug(slug)
  if (social && caps.publish !== null && counts.publish >= caps.publish) {
    throw new ConnectError(
      `Studio includes ${caps.publish} publish channels. Disconnect one or upgrade to connect ${slug}.`,
      403
    )
  }
  if (!social && caps.apps !== null && counts.other >= caps.apps) {
    throw new ConnectError(
      `Studio includes ${caps.apps} marketplace apps. Disconnect one or upgrade to connect ${slug}.`,
      403
    )
  }
  return null
}

export class ConnectError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export async function startConnect(input: {
  userId: string
  slug: string
  request?: NextRequest
  redirectTo?: string
}) {
  const slug = input.slug.trim().toLowerCase()
  if (!slug) throw new ConnectError("App slug is required")

  if (slug === "twitter" && !(await resolveTwitterAuthConfigId())) {
    throw new ConnectError(
      "Twitter needs a Composio auth config. Create one for the Twitter toolkit in Composio, then refresh.",
      400
    )
  }

  const existing = await assertCanConnect(input.userId, slug)
  const toolkit = await getCachedToolkit(slug)
  const authKind = toolkit
    ? toolkit.authKind
    : authKindFromSchemes([], false)

  if (authKind === "no_auth" || toolkit?.noAuth) {
    const app = await persistConnectedApp({
      userId: input.userId,
      slug,
      status: "connected",
      authScheme: "NO_AUTH",
    })
    return { kind: "connected" as const, app }
  }

  if (authKind === "api_key") {
    const fields = await getApiKeyFields(slug)
    return {
      kind: "api_key" as const,
      needsApiKey: true,
      slug,
      name: toolkit?.name || slug,
      authGuideUrl: toolkit?.authGuideUrl,
      fields,
    }
  }

  const appUrl = resolveAppUrl(input.request)
  const redirectTo = input.redirectTo || "/apps?tab=connected"
  const state = createConnectState({
    userId: input.userId,
    slug,
    redirectTo,
  })
  const callbackUrl = `${appUrl}/api/apps/callback?state=${encodeURIComponent(state)}`
  const session = await createUserSession(input.userId)
  const connection = await session.authorize(slug, { callbackUrl })
  const url = connectionRedirectUrl(connection)
  if (!url) {
    throw new ConnectError("Composio did not return an authorization URL")
  }

  return {
    kind: "oauth" as const,
    url,
    alreadyConnected: Boolean(existing),
  }
}

export async function getApiKeyFields(slug: string): Promise<AuthField[]> {
  const composio = getComposio()
  const toolkit = await getCachedToolkit(slug)
  const scheme = (toolkit?.authSchemes.find((item) =>
    SECRET_SCHEMES.includes(item as (typeof SECRET_SCHEMES)[number])
  ) || "API_KEY") as (typeof AuthSchemeTypes)[keyof typeof AuthSchemeTypes]

  const fields = await composio.toolkits.getConnectedAccountInitiationFields(slug, scheme, {
    requiredOnly: false,
  })
  return (fields || []).map((field) => ({
    name: field.name,
    displayName: field.displayName,
    description: field.description,
    type: field.type,
    required: Boolean(field.required),
  }))
}

async function resolveAuthConfigId(slug: string, scheme: string) {
  const composio = getComposio()
  if (slug === "twitter") {
    const twitter = await resolveTwitterAuthConfigId()
    if (twitter) return twitter
  }

  const listed = await composio.authConfigs.list({ toolkit: slug })
  const match = listed.items.find((item) => item.authScheme === scheme && item.status === "ENABLED")
  if (match) return match.id

  const created = await composio.authConfigs.create(slug, {
    type: AuthConfigTypes.COMPOSIO_MANAGED,
    name: `${slug} ${scheme}`,
  })
  return created.id
}

function secretConfig(scheme: string, secrets: Record<string, string>) {
  if (scheme === "BEARER_TOKEN") {
    return AuthScheme.BearerToken({ token: secrets.token || secrets.bearer_token || Object.values(secrets)[0] })
  }
  if (scheme === "BASIC" || scheme === "BASIC_WITH_JWT") {
    return AuthScheme.Basic({
      username: secrets.username || secrets.user || "",
      password: secrets.password || secrets.pass || "",
    })
  }
  return AuthScheme.APIKey({
    api_key: secrets.api_key || secrets.generic_api_key || Object.values(secrets)[0],
    generic_api_key: secrets.generic_api_key,
  })
}

export async function connectWithApiKey(input: {
  userId: string
  slug: string
  secrets: Record<string, string>
}) {
  const slug = input.slug.trim().toLowerCase()
  if (!slug) throw new ConnectError("App slug is required")
  if (!input.secrets || Object.keys(input.secrets).length === 0) {
    throw new ConnectError("Enter the required credentials")
  }

  await assertCanConnect(input.userId, slug)
  const toolkit = await getCachedToolkit(slug)
  const scheme = toolkit?.authSchemes.find((item) =>
    SECRET_SCHEMES.includes(item as (typeof SECRET_SCHEMES)[number])
  ) || "API_KEY"

  const authConfigId = await resolveAuthConfigId(slug, scheme)
  const composio = getComposio()
  const request = await composio.connectedAccounts.initiate(input.userId, authConfigId, {
    config: secretConfig(scheme, input.secrets),
  })

  const connectedAccountId = request.id
  if (!connectedAccountId) {
    throw new ConnectError("Composio did not create a connected account")
  }

  return finalizeConnection({
    userId: input.userId,
    slug,
    connectedAccountId,
    authScheme: scheme,
  })
}

export async function disconnectApp(input: { userId: string; slug: string }) {
  const existing = await getUserConnectedApp(input.userId, input.slug)
  if (!existing) {
    throw new ConnectError("App is not connected", 404)
  }

  if (existing.composioConnectedAccountId) {
    const composio = getComposio()
    try {
      await composio.connectedAccounts.delete(existing.composioConnectedAccountId)
    } catch (error) {
      console.error("Composio delete failed", error)
    }
  }

  return persistConnectedApp({
    userId: input.userId,
    slug: input.slug,
    status: "disconnected",
    composioConnectedAccountId: null,
    handle: existing.handle,
    lastError: null,
  })
}

export async function findLatestAccount(userId: string, slug: string) {
  const composio = getComposio()
  const listed = await composio.connectedAccounts.list({
    userIds: [userId],
    toolkitSlugs: [slug],
    statuses: ["ACTIVE"],
    orderBy: "updated_at",
    limit: 5,
  })
  return listed.items[0] || null
}
