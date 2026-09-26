import { createHmac, timingSafeEqual } from "crypto"

type ConnectStatePayload = {
  userId: string
  slug: string
  redirectTo: string
  exp: number
}

function secret() {
  const value =
    process.env.CHANNEL_OAUTH_STATE_SECRET ||
    process.env.COMPOSIO_CONNECT_STATE_SECRET
  if (!value) {
    throw new Error("CHANNEL_OAUTH_STATE_SECRET is not defined")
  }
  return value
}

export function createConnectState(
  payload: Omit<ConnectStatePayload, "exp"> & { expiresInMs?: number }
) {
  const statePayload: ConnectStatePayload = {
    userId: payload.userId,
    slug: payload.slug,
    redirectTo: payload.redirectTo,
    exp: Date.now() + (payload.expiresInMs ?? 15 * 60 * 1000),
  }
  const encoded = Buffer.from(JSON.stringify(statePayload)).toString("base64url")
  const signature = createHmac("sha256", secret()).update(encoded).digest("base64url")
  return `${encoded}.${signature}`
}

export function verifyConnectState(state: string): ConnectStatePayload {
  const [encoded, signature] = state.split(".")
  if (!encoded || !signature) {
    throw new Error("Invalid connect state")
  }
  const expected = createHmac("sha256", secret()).update(encoded).digest("base64url")
  if (
    expected.length !== signature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    throw new Error("Invalid connect state signature")
  }
  const payload = JSON.parse(
    Buffer.from(encoded, "base64url").toString("utf8")
  ) as ConnectStatePayload
  if (!payload.exp || payload.exp < Date.now()) {
    throw new Error("Connect state expired")
  }
  return payload
}
