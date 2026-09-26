import { Composio } from "@composio/core"

let composio: Composio | null = null
let twitterAuthConfigCache: { id: string | null; at: number } | null = null
const TWITTER_AUTH_CONFIG_TTL_MS = 5 * 60 * 1000

export function getComposioApiKey() {
  const key = process.env.COMPOSIO_API_KEY
  if (!key) {
    throw new Error("Missing COMPOSIO_API_KEY")
  }
  return key
}

export function getComposio() {
  if (!composio) {
    composio = new Composio({ apiKey: getComposioApiKey() })
  }
  return composio
}

export function getTwitterAuthConfigId() {
  return process.env.COMPOSIO_TWITTER_AUTH_CONFIG_ID || null
}

const OAUTH_SCHEMES = new Set(["OAUTH2", "OAUTH1", "OAUTH2_CC"])

export async function resolveTwitterAuthConfigId() {
  const fromEnv = getTwitterAuthConfigId()
  if (fromEnv) return fromEnv

  if (
    twitterAuthConfigCache &&
    Date.now() - twitterAuthConfigCache.at < TWITTER_AUTH_CONFIG_TTL_MS
  ) {
    return twitterAuthConfigCache.id
  }

  try {
    const listed = await getComposio().authConfigs.list({
      toolkit: "twitter",
      limit: 20,
    })
    const match = listed.items.find(
      (item) => item.status === "ENABLED" && (!item.authScheme || OAUTH_SCHEMES.has(item.authScheme))
    )
    twitterAuthConfigCache = { id: match?.id || null, at: Date.now() }
  } catch (error) {
    console.error("Failed to list Twitter auth configs", error)
    twitterAuthConfigCache = { id: null, at: Date.now() }
  }

  return twitterAuthConfigCache.id
}

export async function sessionAuthConfigs() {
  const twitter = await resolveTwitterAuthConfigId()
  if (!twitter) return undefined
  return { twitter }
}

export async function createUserSession(userId: string) {
  const composioClient = getComposio()
  const authConfigs = await sessionAuthConfigs()
  return composioClient.create(userId, authConfigs ? { authConfigs } : undefined)
}
