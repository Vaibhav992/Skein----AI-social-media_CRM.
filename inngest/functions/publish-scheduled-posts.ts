import { getInsforgeAdminClient } from "@/lib/insforge-server"
import { inngest } from "../client"
import { publishPostViaComposio } from "@/lib/composio/publish"
import { POST_STATUS } from "@/constants/post"
import type { PostType } from "@/types/post.type"

type DuePost = {
  id: string
}

export const publishScheduledPostsCron = inngest.createFunction(
  {
    id: "publish-scheduled-posts-cron",
    name: "Publish Scheduled Posts",
    triggers: [{ cron: "*/10 * * * *" }],
  },
  async ({ step, logger }) => {
    const duePosts = await step.run("load-due-scheduled-posts", async () => {
      const insforge = getInsforgeAdminClient()
      const now = new Date().toISOString()
      const { data, error } = await insforge.database
        .from("scheduled_posts")
        .select("id, status, scheduled_at")
        .eq("status", POST_STATUS.QUEUE)
        .lte("scheduled_at", now)
        .order("scheduled_at", { ascending: true })

      if (error) {
        logger.error(error)
        throw error
      }
      return (data ?? []) as DuePost[]
    })

    if (duePosts.length === 0) {
      return { queued: 0 }
    }

    await step.sendEvent(
      "send-out-post-for-publish",
      duePosts.map((post) => ({
        name: "post/publish.requested",
        data: { postId: post.id },
      }))
    )

    return { message: "sent out posts for publishing", queued: duePosts.length }
  }
)

export const waitThenPublishScheduledPost = inngest.createFunction(
  {
    id: "wait-then-publish-scheduled-post",
    name: "Wait then publish scheduled post",
    concurrency: [{ limit: 1, key: "event.data.postId" }],
    triggers: { event: "post/publish.scheduled" },
  },
  async ({ event, step }) => {
    const scheduledAt = new Date(event.data.scheduledAt)
    if (Number.isNaN(scheduledAt.getTime())) {
      return { skipped: true, reason: "invalid_scheduled_at" }
    }
    if (scheduledAt.getTime() > Date.now()) {
      await step.sleepUntil("wait-until-scheduled", scheduledAt)
    }
    await step.sendEvent("request-publish", {
      name: "post/publish.requested",
      data: { postId: event.data.postId },
    })
    return { requested: true, postId: event.data.postId }
  }
)

export const publishScheduledPost = inngest.createFunction(
  {
    id: "publish-scheduled-post",
    name: "Publish Scheduled Post",
    concurrency: [{ limit: 1, key: "event.data.postId" }],
    triggers: { event: "post/publish.requested" },
  },
  async ({ event, step, logger }) => {
    const post = await step.run("load-post", async () => {
      const insforge = getInsforgeAdminClient()
      const { data, error } = await insforge.database
        .from("scheduled_posts")
        .select("*, user_channels(*, channel_types(id, type, name))")
        .eq("id", event.data.postId)
        .eq("status", POST_STATUS.QUEUE)
        .maybeSingle()

      if (error) {
        logger.error(error)
        throw error
      }
      return data as PostType | null
    })

    if (!post) {
      return { skipped: true, reason: "post_not_found_or_not_queued" }
    }

    if (new Date(post.scheduled_at).getTime() > Date.now() + 2000) {
      return { skipped: true, reason: "not_due_yet" }
    }

    const userChannel = post.user_channels
    if (!userChannel) return { skipped: true, reason: "user_channel_not_found" }

    const providerType = userChannel.channel_types?.type
    const userId = post.user_id
    if (!providerType || !userId) {
      return { skipped: true, reason: "missing_provider_or_user" }
    }

    try {
      const publishedUrl = await step.run("publish-via-composio", async () => {
        return publishPostViaComposio({
          userId,
          providerType,
          content: post.content,
          images: post.images || [],
          handle: userChannel.handle,
          channel: userChannel,
        })
      })

      await step.run("mark-post-published", async () => {
        await markPostPublished(post.id, publishedUrl)
      })

      return { published: true, provider: providerType, publishedUrl }
    } catch (error) {
      logger.error("Failed to publish post", { error })
      const message = error instanceof Error ? error.message : "Unknown error"
      await markPostFailed(post.id, message)
      throw error
    }
  }
)

async function markPostPublished(postId: string, published_url: string | null) {
  const insforge = getInsforgeAdminClient()
  const { error } = await insforge.database
    .from("scheduled_posts")
    .update({
      status: POST_STATUS.PUBLISHED,
      published_at: new Date().toISOString(),
      published_url,
      error_message: null,
    })
    .eq("id", postId)
  if (error) throw error
}

async function markPostFailed(postId: string, errorMessage: string) {
  const insforge = getInsforgeAdminClient()
  const { error } = await insforge.database
    .from("scheduled_posts")
    .update({
      status: POST_STATUS.FAILED,
      error_message: errorMessage,
    })
    .eq("id", postId)
  if (error) throw error
}
