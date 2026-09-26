import { ChannelTypeEnum } from "@/constants/channels"
import { createUserSession } from "@/lib/composio/client"
import { channelTypeToSlug } from "@/lib/composio/social"
import { getInsforgeAdminClient } from "@/lib/insforge-server"
import type { ImageObject } from "@/types/post.type"

export const PUBLISH_TOOLS = {
  twitter: {
    create: "TWITTER_CREATION_OF_A_POST",
    upload: "TWITTER_UPLOAD_MEDIA",
  },
  linkedin: {
    create: "LINKEDIN_CREATE_LINKED_IN_POST",
    me: "LINKEDIN_GET_MY_INFO",
  },
} as const

type PublishChannel = {
  id: string
  user_id?: string | null
  handle?: string | null
  provider_account_id?: string | null
  composio_connected_account_id?: string | null
  composio_toolkit_slug?: string | null
  channel_types?: { type?: ChannelTypeEnum | string | null } | null
}

type ExecuteResult = {
  data: Record<string, unknown>
  error: string | null
  logId?: string
}

export class PublishError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PublishError"
  }
}

export async function publishPostViaComposio(input: {
  userId: string
  providerType: string
  content: string
  images?: ImageObject[]
  handle?: string | null
  channel: PublishChannel
}) {
  const slug = channelTypeToSlug(input.providerType)
  if (!slug) {
    throw new PublishError(`Unsupported provider type: ${input.providerType}`)
  }

  const accountId = input.channel.composio_connected_account_id
  if (!accountId) {
    throw new PublishError(
      `Connect ${slug} in Apps first. This channel has no Composio account.`
    )
  }

  const session = await createUserSession(input.userId)
  const account = { account: accountId }

  if (slug === "twitter") {
    return publishTwitter(session, account, input)
  }
  if (slug === "linkedin") {
    return publishLinkedIn(session, account, input)
  }

  throw new PublishError(
    `Publishing ${slug} through Composio is not wired yet. Phase 4 covers Instagram, Facebook, YouTube, Threads, Bluesky, and TikTok.`
  )
}

async function publishTwitter(
  session: { execute: ExecuteFn },
  account: { account: string },
  input: { content: string; images?: ImageObject[]; handle?: string | null }
) {
  const mediaIds: string[] = []
  for (const image of input.images || []) {
    const uploaded = await runTool(session, PUBLISH_TOOLS.twitter.upload, {
      media: fileArgument(image),
      media_category: "tweet_image",
      media_type: guessMime(image),
    }, account)
    const mediaId = firstString(
      uploaded,
      ["data.id", "data.media_id", "data.data.id", "id", "media_id"]
    )
    if (!mediaId) {
      throw new PublishError("X media upload did not return a media id.")
    }
    mediaIds.push(mediaId)
  }

  const created = await runTool(session, PUBLISH_TOOLS.twitter.create, {
    text: input.content,
    ...(mediaIds.length ? { media_media_ids: mediaIds } : {}),
  }, account)

  const postId = firstString(created, ["data.id", "data.data.id", "id"])
  if (!postId) {
    throw new PublishError("X create post did not return a tweet id.")
  }
  return input.handle ? `https://x.com/${input.handle}/status/${postId}` : `https://x.com/i/web/status/${postId}`
}

async function publishLinkedIn(
  session: { execute: ExecuteFn },
  account: { account: string },
  input: { content: string; images?: ImageObject[]; channel: PublishChannel }
) {
  const author = await resolveLinkedInAuthor(session, account, input.channel)
  const images = (input.images || []).map((image) => fileArgument(image))
  const created = await runTool(session, PUBLISH_TOOLS.linkedin.create, {
    author,
    commentary: input.content.slice(0, 3000),
    visibility: "PUBLIC",
    lifecycleState: "PUBLISHED",
    ...(images.length ? { images } : {}),
  }, account)

  const restliId = firstString(created, ["id", "data.id", "data.data.id"])
  return restliId
    ? `https://www.linkedin.com/feed/update/${encodeURIComponent(restliId)}`
    : null
}

async function resolveLinkedInAuthor(
  session: { execute: ExecuteFn },
  account: { account: string },
  channel: PublishChannel
) {
  const stored = channel.provider_account_id?.trim()
  if (stored) {
    return stored.startsWith("urn:") ? stored : `urn:li:person:${stored}`
  }

  const me = await runTool(session, PUBLISH_TOOLS.linkedin.me, {}, account)
  const personId = firstString(me, [
    "id",
    "sub",
    "vanityName",
    "data.id",
    "data.sub",
    "data.vanityName",
  ])
  if (!personId) {
    throw new PublishError("Could not resolve the LinkedIn author. Reconnect LinkedIn and try again.")
  }

  const admin = getInsforgeAdminClient()
  await admin.database
    .from("user_channels")
    .update({ provider_account_id: personId, updated_at: new Date().toISOString() })
    .eq("id", channel.id)

  return personId.startsWith("urn:") ? personId : `urn:li:person:${personId}`
}

type ExecuteFn = (
  toolSlug: string,
  arguments_?: Record<string, unknown>,
  options?: { account?: string }
) => Promise<ExecuteResult>

async function runTool(
  session: { execute: ExecuteFn },
  tool: string,
  args: Record<string, unknown>,
  options: { account: string }
) {
  const result = await session.execute(tool, args, options)
  if (result.error) {
    throw new PublishError(`${tool}: ${result.error}`)
  }
  if (result.data.successful === false) {
    const nestedError = firstString(result.data, ["error", "data.error"])
    throw new PublishError(`${tool}: ${nestedError || "Tool failed"}`)
  }
  return result.data
}

function fileArgument(image: ImageObject) {
  return {
    name: fileName(image),
    mimetype: guessMime(image),
    url: image.url,
  }
}

function fileName(image: ImageObject) {
  try {
    const path = new URL(image.url).pathname
    const name = path.split("/").filter(Boolean).pop()
    if (name) return decodeURIComponent(name)
  } catch {
    // fall through
  }
  return image.key || "image.jpg"
}

function guessMime(image: ImageObject) {
  const name = fileName(image).toLowerCase()
  if (name.endsWith(".png")) return "image/png"
  if (name.endsWith(".webp")) return "image/webp"
  if (name.endsWith(".gif")) return "image/gif"
  return "image/jpeg"
}

function firstString(value: unknown, paths: string[]): string | null {
  for (const path of paths) {
    let current: unknown = value
    for (const key of path.split(".")) {
      if (!current || typeof current !== "object") {
        current = undefined
        break
      }
      current = (current as Record<string, unknown>)[key]
    }
    if (typeof current === "string" && current.trim()) return current.trim()
    if (typeof current === "number") return String(current)
  }
  return null
}
