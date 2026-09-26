import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { publishScheduledPost, publishScheduledPostsCron, waitThenPublishScheduledPost } from "@/inngest/functions/publish-scheduled-posts";
import { refreshComposioCatalog } from "@/inngest/functions/composio-catalog";
import { healthCheckConnectedApps } from "@/inngest/functions/composio-health";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    publishScheduledPostsCron,
    waitThenPublishScheduledPost,
    publishScheduledPost,
    refreshComposioCatalog,
    healthCheckConnectedApps,
  ],
});