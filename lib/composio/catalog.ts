import { getInsforgeAdminClient } from "@/lib/insforge-server"
import { getComposioApiKey } from "@/lib/composio/client"
import type { AppAuthKind, CatalogCategory, CatalogToolkit } from "@/lib/composio/types"

const COMPOSIO_API = "https://backend.composio.dev/api/v3.1"
const CACHE_TTL_MS = 8 * 60 * 60 * 1000
const PAGE_SIZE = 40

const PINNED_CATEGORY_PATTERNS: { match: RegExp; order: number }[] = [
  { match: /social|marketing & social/i, order: 1 },
  { match: /collaboration|communication/i, order: 2 },
  { match: /document|file management/i, order: 3 },
  { match: /productivity|project management/i, order: 4 },
  { match: /crm|sales|customer support/i, order: 5 },
  { match: /analytics|data/i, order: 6 },
  { match: /e-?commerce/i, order: 7 },
  { match: /finance|accounting/i, order: 8 },
  { match: /advertising/i, order: 9 },
  { match: /scheduling|booking/i, order: 10 },
  { match: /design|creative/i, order: 11 },
  { match: /ai &|machine learning/i, order: 12 },
  { match: /developer|devops/i, order: 13 },
  { match: /hr|recruit/i, order: 14 },
  { match: /education|lms/i, order: 15 },
  { match: /entertainment|media/i, order: 16 },
  { match: /workflow/i, order: 17 },
]

type RestToolkit = {
  slug: string
  name: string
  auth_schemes?: string[]
  no_auth?: boolean
  auth_guide_url?: string | null
  deprecated?: unknown
  meta?: {
    description?: string
    logo?: string
    categories?: { id?: string; slug?: string; name?: string }[]
    tools_count?: number
  }
}

type RestToolkitsResponse = {
  items?: RestToolkit[]
  next_cursor?: string | null
  total_items?: number
}

function categorySortOrder(id: string, name: string) {
  const haystack = `${id} ${name}`
  const pinned = PINNED_CATEGORY_PATTERNS.find((item) => item.match.test(haystack))
  return pinned?.order ?? 100
}

export function authKindFromSchemes(schemes: string[], noAuth: boolean): AppAuthKind {
  if (noAuth || schemes.includes("NO_AUTH")) return "no_auth"
  if (
    schemes.some((scheme) =>
      ["API_KEY", "BEARER_TOKEN", "BASIC", "BASIC_WITH_JWT"].includes(scheme)
    ) &&
    !schemes.some((scheme) =>
      ["OAUTH2", "OAUTH1", "DCR_OAUTH", "S2S_OAUTH2"].includes(scheme)
    )
  ) {
    return "api_key"
  }
  if (schemes.some((scheme) => ["OAUTH2", "OAUTH1", "DCR_OAUTH", "S2S_OAUTH2"].includes(scheme))) {
    return "oauth"
  }
  if (schemes.some((scheme) => ["API_KEY", "BEARER_TOKEN", "BASIC", "BASIC_WITH_JWT"].includes(scheme))) {
    return "api_key"
  }
  return "oauth"
}

function isDeprecated(value: unknown) {
  if (value === true) return true
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>
  if (record.isDeprecated === true || record.deprecated === true) return true
  if (typeof record.reason === "string" && record.reason.trim()) return true
  return false
}

function titleCategoryName(name: string) {
  if (/[A-Z &]/.test(name) && name !== name.toLowerCase()) return name
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function uniqueCategories(items: { id: string; name: string }[]): CatalogCategory[] {
  const seen = new Map<string, CatalogCategory>()
  for (const item of items) {
    if (!item.id || seen.has(item.id)) continue
    seen.set(item.id, {
      id: item.id,
      name: titleCategoryName(item.name || item.id),
      sortOrder: categorySortOrder(item.id, item.name || item.id),
    })
  }
  return [...seen.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
}

function mapRestToolkit(item: RestToolkit, rank: number): CatalogToolkit {
  const categories = (item.meta?.categories || []).map((category) => ({
    id: category.id || category.slug || "",
    name: category.name || category.id || category.slug || "Other",
  })).filter((category) => category.id)

  return {
    slug: item.slug,
    name: item.name,
    logo: item.meta?.logo || null,
    description: item.meta?.description || null,
    categoryIds: categories.map((category) => category.id),
    categories,
    authSchemes: item.auth_schemes || [],
    authKind: authKindFromSchemes(item.auth_schemes || [], Boolean(item.no_auth)),
    noAuth: Boolean(item.no_auth),
    toolsCount: item.meta?.tools_count || 0,
    deprecated: isDeprecated(item.deprecated),
    authGuideUrl: item.auth_guide_url || null,
    sortRank: rank,
  }
}

function rowToToolkit(row: Record<string, unknown>): CatalogToolkit {
  const categories = Array.isArray(row.categories)
    ? (row.categories as { id: string; name: string }[])
    : []
  const authSchemes = (row.auth_schemes as string[]) || []
  const noAuth = Boolean(row.no_auth)
  return {
    slug: String(row.slug),
    name: String(row.name),
    logo: (row.logo as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    categoryIds: (row.category_ids as string[]) || [],
    categories,
    authSchemes,
    authKind: authKindFromSchemes(authSchemes, noAuth),
    noAuth,
    toolsCount: Number(row.tools_count || 0),
    deprecated: Boolean(row.deprecated),
    authGuideUrl: (row.auth_guide_url as string | null) ?? null,
    sortRank: Number(row.sort_rank || 0),
  }
}

async function composioFetch<T>(path: string, search?: Record<string, string | undefined>) {
  const url = new URL(`${COMPOSIO_API}${path}`)
  Object.entries(search || {}).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })
  const response = await fetch(url, {
    headers: { "x-api-key": getComposioApiKey() },
    cache: "no-store",
  })
  if (!response.ok) {
    const text = await response.text()
    const err = new Error(`Composio ${path} failed (${response.status}): ${text.slice(0, 240)}`)
    ;(err as Error & { status?: number }).status = response.status
    throw err
  }
  return response.json() as Promise<T>
}

export async function fetchLiveCategories(maxPages = 2): Promise<CatalogCategory[]> {
  const collected: { id: string; name: string }[] = []
  let cursor: string | undefined
  let pages = 0
  do {
    const page = await fetchLiveToolkitsPage({ cursor, limit: 200 })
    for (const toolkit of page.items) {
      collected.push(...toolkit.categories)
    }
    cursor = page.nextCursor || undefined
    pages += 1
  } while (cursor && pages < maxPages)
  return uniqueCategories(collected)
}

export async function fetchLiveToolkitsPage(options: {
  category?: string
  search?: string
  cursor?: string
  limit?: number
}) {
  const limit = Math.min(options.limit ?? PAGE_SIZE, 100)
  const data = await composioFetch<RestToolkitsResponse>("/toolkits", {
    category: options.category,
    search: options.search,
    sort_by: "usage",
    include_deprecated: "false",
    limit: String(limit),
    cursor: options.cursor,
  })
  const items = (data.items || []).map((item, index) => mapRestToolkit(item, index))
  return {
    items: items.filter((item) => !item.deprecated),
    nextCursor: data.next_cursor || null,
    total: data.total_items ?? items.length,
  }
}

async function upsertChunks(
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string
) {
  const admin = getInsforgeAdminClient()
  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50)
    const { error } = await admin.database.from(table).upsert(chunk, { onConflict })
    if (error) throw error
  }
}

export async function refreshCatalogCache() {
  const admin = getInsforgeAdminClient()
  const toolkits: CatalogToolkit[] = []
  const categoryItems: { id: string; name: string }[] = []
  let cursor: string | undefined
  let rank = 0
  do {
    const page = await fetchLiveToolkitsPage({ cursor, limit: 200 })
    for (const toolkit of page.items) {
      toolkits.push({ ...toolkit, sortRank: rank++ })
      categoryItems.push(...toolkit.categories)
    }
    cursor = page.nextCursor || undefined
  } while (cursor)

  const categories = uniqueCategories(categoryItems)
  await upsertChunks(
    "composio_category_cache",
    categories.map((category) => ({
      id: category.id,
      name: category.name,
      sort_order: category.sortOrder,
      refreshed_at: new Date().toISOString(),
    })),
    "id"
  )

  await upsertChunks(
    "composio_toolkit_cache",
    toolkits.map((toolkit) => ({
      slug: toolkit.slug,
      name: toolkit.name,
      logo: toolkit.logo,
      description: toolkit.description,
      category_ids: toolkit.categoryIds,
      categories: toolkit.categories,
      auth_schemes: toolkit.authSchemes,
      no_auth: toolkit.noAuth,
      tools_count: toolkit.toolsCount,
      deprecated: toolkit.deprecated,
      auth_guide_url: toolkit.authGuideUrl,
      sort_rank: toolkit.sortRank,
      meta: {},
      refreshed_at: new Date().toISOString(),
    })),
    "slug"
  )

  const now = new Date().toISOString()
  const { error } = await admin.database.from("composio_catalog_meta").upsert(
    [{
      id: "default",
      categories_refreshed_at: now,
      toolkits_refreshed_at: now,
      toolkit_count: toolkits.length,
    }],
    { onConflict: "id" }
  )
  if (error) throw error

  return { categories: categories.length, toolkits: toolkits.length }
}

async function catalogMeta() {
  const admin = getInsforgeAdminClient()
  const { data } = await admin.database
    .from("composio_catalog_meta")
    .select("*")
    .eq("id", "default")
    .maybeSingle()
  return data
}

export async function isCatalogFresh() {
  const meta = await catalogMeta()
  if (!meta?.toolkits_refreshed_at || !meta.toolkit_count) return false
  return Date.now() - new Date(meta.toolkits_refreshed_at).getTime() < CACHE_TTL_MS
}

export async function listCachedCategories(): Promise<CatalogCategory[]> {
  const admin = getInsforgeAdminClient()
  const { data, error } = await admin.database
    .from("composio_category_cache")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true })
  if (error) throw error
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
  }))
}

export async function cacheToolkitPage(toolkits: CatalogToolkit[], startRank = 0) {
  if (toolkits.length === 0) return
  await upsertChunks(
    "composio_toolkit_cache",
    toolkits.map((toolkit, index) => ({
      slug: toolkit.slug,
      name: toolkit.name,
      logo: toolkit.logo,
      description: toolkit.description,
      category_ids: toolkit.categoryIds,
      categories: toolkit.categories,
      auth_schemes: toolkit.authSchemes,
      no_auth: toolkit.noAuth,
      tools_count: toolkit.toolsCount,
      deprecated: toolkit.deprecated,
      auth_guide_url: toolkit.authGuideUrl,
      sort_rank: toolkit.sortRank || startRank + index,
      meta: {},
      refreshed_at: new Date().toISOString(),
    })),
    "slug"
  )
}

export async function listCachedToolkits(options: {
  category?: string
  search?: string
  cursor?: string
  limit?: number
}) {
  const admin = getInsforgeAdminClient()
  const limit = Math.min(options.limit ?? PAGE_SIZE, 80)
  const offset = options.cursor ? Number.parseInt(options.cursor, 10) || 0 : 0

  let query = admin.database
    .from("composio_toolkit_cache")
    .select("slug, name, logo, description, category_ids, categories, auth_schemes, no_auth, tools_count, deprecated, auth_guide_url, sort_rank", { count: "exact" })
    .eq("deprecated", false)
    .order("sort_rank", { ascending: true })
    .range(offset, offset + limit - 1)

  if (options.category) {
    query = query.contains("category_ids", [options.category])
  }
  if (options.search) {
    const q = options.search.replace(/[%(),]/g, "").trim()
    if (q) {
      query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%,description.ilike.%${q}%`)
    }
  }

  const { data, error, count } = await query
  if (error) throw error
  const items = (data || []).map((row) => rowToToolkit(row))
  const nextOffset = offset + items.length
  return {
    items,
    nextCursor: count != null && nextOffset < count ? String(nextOffset) : null,
    total: count ?? items.length,
  }
}

export async function getCachedToolkit(slug: string) {
  const admin = getInsforgeAdminClient()
  const { data, error } = await admin.database
    .from("composio_toolkit_cache")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
  if (error) throw error
  return data ? rowToToolkit(data) : null
}

export async function ensureCatalogAvailable() {
  if (await isCatalogFresh()) return { source: "cache" as const }
  return { source: "stale" as const }
}
