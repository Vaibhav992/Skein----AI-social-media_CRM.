import { Composio } from "@composio/core"

let composio: Composio | null = null

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

export function sessionAuthConfigs() {
  const twitter = getTwitterAuthConfigId()
  if (!twitter) return undefined
  return { twitter }
}

export async function createUserSession(userId: string) {
  const composioClient = getComposio()
  const authConfigs = sessionAuthConfigs()
  return composioClient.create(userId, authConfigs ? { authConfigs } : undefined)
}
