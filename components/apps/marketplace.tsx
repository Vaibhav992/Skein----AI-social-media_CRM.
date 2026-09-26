"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { BRAND_NAME } from "@/constants/brand"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppCard, AppLogo } from "@/components/apps/app-card"
import { ApiKeyDialog } from "@/components/apps/api-key-dialog"
import { useConnectApp, type ConnectStartResult } from "@/lib/composio/use-connect-app"
import type { AuthField, CatalogCategory, CatalogToolkit, ConnectedApp } from "@/lib/composio/types"

type MarketplaceItem = CatalogToolkit & {
  status?: string
  handle?: string | null
  connectDisabledReason?: string | null
}

type ConnectedResponse = {
  groups: { categoryId: string; categoryName: string; apps: ConnectedApp[] }[]
  usage?: { publish: number; other: number; caps: { publish: number | null; apps: number | null } }
}

function MarketplaceContent() {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState(searchParams.get("tab") === "connected" ? "connected" : "marketplace")
  const [category, setCategory] = useState(searchParams.get("category") || "")
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [extraItems, setExtraItems] = useState<MarketplaceItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [apiKey, setApiKey] = useState<{ slug: string; name: string; authGuideUrl?: string | null; fields: AuthField[] } | null>(null)
  const connect = useConnectApp({ redirectTo: "/apps?tab=connected" })
  const invalidate = connect.invalidate

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const connected = searchParams.get("connected")
    const error = searchParams.get("error")
    const slug = searchParams.get("slug")
    if (!connected && !error) return
    invalidate()
    if (connected === "true") toast.success(`Connected ${slug || "app"}`)
    if (connected === "false" || error) toast.error(error || `Failed to connect ${slug || "app"}`)
  }, [searchParams, invalidate])

  const categoriesQuery = useQuery({
    queryKey: ["apps-categories"],
    queryFn: async () => {
      const res = await fetch("/api/apps/categories")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load categories")
      return data.categories as CatalogCategory[]
    },
  })

  const appsQuery = useQuery({
    queryKey: ["apps", category, debouncedQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (category) params.set("category", category)
      if (debouncedQuery) params.set("q", debouncedQuery)
      const res = await fetch(`/api/apps?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load apps")
      return data as { items: MarketplaceItem[]; nextCursor: string | null; total: number }
    },
    enabled: tab === "marketplace",
  })

  useEffect(() => {
    setExtraItems([])
    setNextCursor(appsQuery.data?.nextCursor || null)
  }, [appsQuery.data])

  const connectedQuery = useQuery({
    queryKey: ["apps-connected"],
    queryFn: async () => {
      const res = await fetch("/api/apps/connected")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load connected apps")
      return data as ConnectedResponse
    },
  })

  const pendingSlug = connect.connect.variables || connect.disconnect.variables || connect.connectApiKey.variables?.slug

  async function handleConnect(slug: string) {
    const result = await connect.connect.mutateAsync(slug) as ConnectStartResult
    if (result.kind === "api_key") {
      setApiKey({
        slug: result.slug,
        name: result.name,
        authGuideUrl: result.authGuideUrl,
        fields: result.fields,
      })
    }
  }

  const usage = connectedQuery.data?.usage
  const categories = categoriesQuery.data || []
  const pinnedCategories = categories.filter((item) => item.sortOrder < 100)
  const moreCategories = categories.filter((item) => item.sortOrder >= 100)

  if (!mounted) {
    return <div className="px-1 py-4 text-sm text-muted-foreground">Loading apps…</div>
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-1 py-4">
      <p className="mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        <span className="h-px w-6 bg-accent" />
        {BRAND_NAME}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Apps</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse the Composio marketplace by category. Connect an app to use it in Skein.
          </p>
        </div>
        {usage ? (
          <p className="text-xs text-muted-foreground">
            {usage.publish}/{usage.caps.publish ?? "∞"} publish · {usage.other}/{usage.caps.apps ?? "∞"} other apps
          </p>
        ) : null}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList variant="line">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="connected">My apps</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "marketplace" ? (
        <>
          <div className="mt-5 flex flex-col gap-3">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Gmail, Slack, Notion…"
                className="pl-8"
              />
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              <CategoryChip
                active={!category}
                onClick={() => setCategory("")}
                label="All"
              />
              {categoriesQuery.isPending
                ? Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-8 w-28 shrink-0 rounded-full" />
                  ))
                : (
                    <>
                      {pinnedCategories.map((item) => (
                        <CategoryChip
                          key={item.id}
                          active={category === item.id}
                          onClick={() => setCategory(item.id)}
                          label={item.name}
                        />
                      ))}
                      {moreCategories.length > 0 ? (
                        <Select
                          value={moreCategories.some((item) => item.id === category) ? category : ""}
                          onValueChange={(value) => setCategory(value === "all" ? "" : value)}
                        >
                          <SelectTrigger size="sm" className="w-44 shrink-0 rounded-full">
                            <SelectValue placeholder="More categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All apps</SelectItem>
                            {moreCategories.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                    </>
                  )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {appsQuery.isPending
              ? Array.from({ length: 9 }).map((_, index) => (
                  <Skeleton key={index} className="h-44 rounded-[22px]" />
                ))
              : [...(appsQuery.data?.items || []), ...extraItems].map((app) => (
                  <AppCard
                    key={app.slug}
                    slug={app.slug}
                    name={app.name}
                    logo={app.logo}
                    description={app.description}
                    authKind={app.authKind}
                    toolsCount={app.toolsCount}
                    status={app.status}
                    handle={app.handle}
                    connectDisabledReason={app.connectDisabledReason}
                    pending={pendingSlug === app.slug}
                    onConnect={handleConnect}
                    onDisconnect={(slug) => connect.disconnect.mutate(slug)}
                    onReconnect={handleConnect}
                  />
                ))}
          </div>
          {appsQuery.isError || categoriesQuery.isError ? (
            <p className="mt-10 text-center text-sm text-destructive">
              {(appsQuery.error as Error)?.message || (categoriesQuery.error as Error)?.message || "Failed to load the marketplace"}
            </p>
          ) : !appsQuery.isPending && appsQuery.data?.items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              No apps match that filter. Try another category or search.
            </p>
          ) : null}
          {nextCursor ? (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                disabled={loadingMore}
                onClick={async () => {
                  setLoadingMore(true)
                  try {
                    const params = new URLSearchParams()
                    if (category) params.set("category", category)
                    if (debouncedQuery) params.set("q", debouncedQuery)
                    params.set("cursor", nextCursor)
                    const res = await fetch(`/api/apps?${params.toString()}`)
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || "Failed to load more")
                    setExtraItems((current) => [...current, ...(data.items || [])])
                    setNextCursor(data.nextCursor || null)
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Failed to load more")
                  } finally {
                    setLoadingMore(false)
                  }
                }}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
          {appsQuery.data?.total ? (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Showing {(appsQuery.data.items.length + extraItems.length)} of {appsQuery.data.total}
            </p>
          ) : null}
        </>
      ) : (
        <ConnectedApps
          groups={connectedQuery.data?.groups || []}
          pending={connectedQuery.isPending}
          pendingSlug={pendingSlug}
          onDisconnect={(slug) => connect.disconnect.mutate(slug)}
          onReconnect={handleConnect}
        />
      )}

      <ApiKeyDialog
        open={Boolean(apiKey)}
        onOpenChange={(open) => {
          if (!open) setApiKey(null)
        }}
        slug={apiKey?.slug || ""}
        name={apiKey?.name || ""}
        authGuideUrl={apiKey?.authGuideUrl}
        fields={apiKey?.fields || []}
        pending={connect.connectApiKey.isPending}
        onSubmit={(secrets) => {
          if (!apiKey) return
          connect.connectApiKey.mutate(
            { slug: apiKey.slug, secrets },
            { onSuccess: () => setApiKey(null) }
          )
        }}
      />
    </div>
  )
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      className="shrink-0 rounded-full"
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

function ConnectedApps({
  groups,
  pending,
  pendingSlug,
  onDisconnect,
  onReconnect,
}: {
  groups: ConnectedResponse["groups"]
  pending: boolean
  pendingSlug?: string
  onDisconnect: (slug: string) => void
  onReconnect: (slug: string) => void
}) {
  const empty = useMemo(() => !pending && groups.length === 0, [pending, groups.length])

  if (pending) {
    return (
      <div className="mt-6 space-y-4">
        <Skeleton className="h-24 rounded-[22px]" />
        <Skeleton className="h-24 rounded-[22px]" />
      </div>
    )
  }

  if (empty) {
    return (
      <p className="mt-10 text-center text-sm text-muted-foreground">
        No connected apps yet. Open Marketplace and connect one.
      </p>
    )
  }

  return (
    <div className="mt-6 space-y-8">
      {groups.map((group) => (
        <section key={group.categoryId}>
          <h2 className="mb-3 text-sm font-semibold tracking-tight">{group.categoryName}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.apps.map((app) => (
              <div key={app.id} className="flex items-center justify-between rounded-[22px] border border-border p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <AppLogo name={app.name} logo={app.logo} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{app.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {app.status === "needs_reauth" ? "Needs re-authorization" : app.handle || app.slug}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {app.status === "needs_reauth" ? (
                    <Button size="sm" variant="outline" disabled={pendingSlug === app.slug} onClick={() => onReconnect(app.slug)}>
                      Reconnect
                    </Button>
                  ) : null}
                  <Button size="sm" variant="destructive" disabled={pendingSlug === app.slug} onClick={() => onDisconnect(app.slug)}>
                    Disconnect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default function Marketplace() {
  return (
    <Suspense fallback={<div className="px-1 py-4 text-sm text-muted-foreground">Loading apps…</div>}>
      <MarketplaceContent />
    </Suspense>
  )
}
