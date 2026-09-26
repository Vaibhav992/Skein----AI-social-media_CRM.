import type { InsForgeClient } from "@insforge/sdk"
import { getInsforgeAdminClient } from "@/lib/insforge-server"
import { getCachedToolkit } from "@/lib/composio/catalog"
import { isSocialSlug, SLUG_TO_CHANNEL_TYPE } from "@/lib/composio/social"
import type { ConnectedApp, ConnectedAppStatus } from "@/lib/composio/types"

type PersistInput = {
  userId: string
  slug: string
  status: ConnectedAppStatus
  composioConnectedAccountId?: string | null
  handle?: string | null
  profileImage?: string | null
  authScheme?: string | null
  lastError?: string | null
  name?: string
  logo?: string | null
  description?: string | null
  categoryIds?: string[]
}

function mapRow(row: Record<string, unknown>): ConnectedApp {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    logo: (row.logo as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    categoryIds: (row.category_ids as string[]) || [],
    authScheme: (row.auth_scheme as string | null) ?? null,
    composioConnectedAccountId: (row.composio_connected_account_id as string | null) ?? null,
    handle: (row.handle as string | null) ?? null,
    profileImage: (row.profile_image as string | null) ?? null,
    status: row.status as ConnectedAppStatus,
    lastHealthAt: (row.last_health_at as string | null) ?? null,
    lastError: (row.last_error as string | null) ?? null,
  }
}

export async function persistConnectedApp(input: PersistInput, client?: InsForgeClient) {
  const insforge = client || getInsforgeAdminClient()
  const toolkit = await getCachedToolkit(input.slug)
  const now = new Date().toISOString()
  const payload = {
    user_id: input.userId,
    slug: input.slug,
    name: input.name || toolkit?.name || input.slug,
    logo: input.logo ?? toolkit?.logo ?? null,
    description: input.description ?? toolkit?.description ?? null,
    category_ids: input.categoryIds || toolkit?.categoryIds || [],
    auth_scheme: input.authScheme ?? toolkit?.authSchemes[0] ?? null,
    composio_connected_account_id: input.composioConnectedAccountId ?? null,
    handle: input.handle ?? null,
    profile_image: input.profileImage ?? null,
    status: input.status,
    last_health_at: input.status === "connected" || input.status === "needs_reauth" ? now : null,
    last_error: input.lastError ?? null,
    updated_at: now,
  }

  const { data, error } = await insforge.database
    .from("user_connected_apps")
    .upsert([payload], { onConflict: "user_id,slug" })
    .select("*")
    .single()

  if (error) throw error

  if (isSocialSlug(input.slug)) {
    await upsertSocialChannel({
      userId: input.userId,
      slug: input.slug,
      connected: input.status === "connected",
      handle: input.handle,
      profileImage: input.profileImage,
      composioConnectedAccountId: input.composioConnectedAccountId,
      client: insforge,
    })
  }

  return mapRow(data)
}

export async function upsertSocialChannel(input: {
  userId: string
  slug: string
  connected: boolean
  handle?: string | null
  profileImage?: string | null
  composioConnectedAccountId?: string | null
  client?: InsForgeClient
}) {
  if (!isSocialSlug(input.slug)) return
  const insforge = input.client || getInsforgeAdminClient()
  const channelType = SLUG_TO_CHANNEL_TYPE[input.slug]
  const { data: typeRow, error: typeError } = await insforge.database
    .from("channel_types")
    .select("id")
    .eq("type", channelType)
    .single()
  if (typeError || !typeRow) return

  const payload = {
    user_id: input.userId,
    channel_type_id: typeRow.id,
    composio_toolkit_slug: input.slug,
    composio_connected_account_id: input.composioConnectedAccountId ?? null,
    handle: input.handle ?? null,
    profile_image: input.profileImage ?? null,
    is_connected: input.connected,
    is_active: input.connected,
    updated_at: new Date().toISOString(),
  }

  const { error } = await insforge.database
    .from("user_channels")
    .upsert([payload], { onConflict: "user_id,channel_type_id" })
  if (error) throw error
}

export async function listUserConnectedApps(userId: string, client?: InsForgeClient) {
  const insforge = client || getInsforgeAdminClient()
  const { data, error } = await insforge.database
    .from("user_connected_apps")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
  if (error) throw error
  return (data || []).map((row) => mapRow(row))
}

export async function getUserConnectedApp(userId: string, slug: string, client?: InsForgeClient) {
  const insforge = client || getInsforgeAdminClient()
  const { data, error } = await insforge.database
    .from("user_connected_apps")
    .select("*")
    .eq("user_id", userId)
    .eq("slug", slug)
    .maybeSingle()
  if (error) throw error
  return data ? mapRow(data) : null
}

export async function countUserApps(userId: string, client?: InsForgeClient) {
  const apps = await listUserConnectedApps(userId, client)
  const active = apps.filter((app) => app.status === "connected" || app.status === "needs_reauth")
  const publish = active.filter((app) => isSocialSlug(app.slug)).length
  const other = active.filter((app) => !isSocialSlug(app.slug)).length
  return { publish, other, active }
}
