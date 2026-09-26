import { POST_STATUS } from "@/constants/post"
import { inngest } from "@/inngest/client"

type QueueablePost = {
  id: string
  status?: string | null
  scheduled_at?: string | null
}

export async function enqueueQueuedPosts(posts: QueueablePost[]) {
  const events = posts.flatMap((post) => {
    if (!post.id || post.status !== POST_STATUS.QUEUE) return []
    const scheduledAt = post.scheduled_at ? new Date(post.scheduled_at) : new Date()
    const dueSoon = scheduledAt.getTime() <= Date.now() + 5000
    if (dueSoon) {
      return [{ name: "post/publish.requested" as const, data: { postId: post.id } }]
    }
    return [{
      name: "post/publish.scheduled" as const,
      data: { postId: post.id, scheduledAt: scheduledAt.toISOString() },
    }]
  })

  if (events.length === 0) return { queued: 0 }
  await inngest.send(events)
  return { queued: events.length }
}
