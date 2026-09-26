import { inngest } from "@/inngest/client"
import { refreshCatalogCache } from "@/lib/composio/catalog"

export const refreshComposioCatalog = inngest.createFunction(
  {
    id: "composio-refresh-catalog",
    name: "Refresh Composio catalog cache",
    triggers: [
      { cron: "0 */6 * * *" },
      { event: "composio/refresh-catalog" },
    ],
  },
  async ({ logger }) => {
    const result = await refreshCatalogCache()
    logger.info("Composio catalog refreshed", result)
    return result
  }
)
