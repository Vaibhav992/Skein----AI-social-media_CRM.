import { getInsforgeAdminClient } from "@/lib/insforge-server"
import { inngest } from "@/inngest/client"
import { finalizeConnection } from "@/lib/composio/health"

export const healthCheckConnectedApps = inngest.createFunction(
  {
    id: "composio-health-check",
    name: "Health-check connected apps",
    triggers: [{ cron: "0 6 * * *" }],
  },
  async ({ logger }) => {
    const admin = getInsforgeAdminClient()
    const { data, error } = await admin.database
      .from("user_connected_apps")
      .select("user_id, slug, composio_connected_account_id, auth_scheme")
      .in("status", ["connected", "needs_reauth"])

    if (error) throw error

    let checked = 0
    let flipped = 0
    for (const row of data || []) {
      if (!row.composio_connected_account_id) continue
      const app = await finalizeConnection({
        userId: row.user_id,
        slug: row.slug,
        connectedAccountId: row.composio_connected_account_id,
        authScheme: row.auth_scheme,
      })
      checked += 1
      if (app.status !== "connected") flipped += 1
    }

    logger.info("Connected app health check finished", { checked, flipped })
    return { checked, flipped }
  }
)
