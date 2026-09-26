"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { AppAuthKind } from "@/lib/composio/types"

type AppCardProps = {
  slug: string
  name: string
  logo?: string | null
  description?: string | null
  authKind: AppAuthKind
  toolsCount?: number
  status?: string
  handle?: string | null
  connectDisabledReason?: string | null
  pending?: boolean
  onConnect: (slug: string) => void
  onDisconnect?: (slug: string) => void
  onReconnect?: (slug: string) => void
}

const AUTH_LABEL: Record<AppAuthKind, string> = {
  oauth: "OAuth",
  api_key: "API key",
  no_auth: "No auth",
}

export function AppCard({
  slug,
  name,
  logo,
  description,
  authKind,
  toolsCount,
  status = "disconnected",
  handle,
  connectDisabledReason,
  pending,
  onConnect,
  onDisconnect,
  onReconnect,
}: AppCardProps) {
  const connected = status === "connected"
  const needsReauth = status === "needs_reauth"

  return (
    <article className="flex h-full flex-col rounded-[22px] border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <AppLogo name={name} logo={logo} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-medium">{name}</h3>
            <Badge variant="outline">{AUTH_LABEL[authKind]}</Badge>
          </div>
          {handle ? (
            <p className="truncate text-xs text-muted-foreground">@{handle}</p>
          ) : null}
        </div>
      </div>
      <p className="mt-3 line-clamp-2 min-h-10 text-sm text-muted-foreground">
        {description || "Connect this app to use it in Skein."}
      </p>
      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-xs text-muted-foreground">
          {typeof toolsCount === "number" ? `${toolsCount} tools` : ""}
        </span>
        <div className="flex items-center gap-2">
          {needsReauth ? (
            <Button size="sm" variant="outline" disabled={pending} onClick={() => onReconnect?.(slug)}>
              {pending ? <Spinner className="size-4" /> : null}
              Reconnect
            </Button>
          ) : connected ? (
            <Button size="sm" variant="destructive" disabled={pending} onClick={() => onDisconnect?.(slug)}>
              {pending ? <Spinner className="size-4" /> : null}
              Disconnect
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={pending || Boolean(connectDisabledReason)}
              title={connectDisabledReason || undefined}
              onClick={() => onConnect(slug)}
            >
              {pending ? <Spinner className="size-4" /> : null}
              Connect
            </Button>
          )}
        </div>
      </div>
      {connectDisabledReason ? (
        <p className="mt-2 text-xs text-muted-foreground">{connectDisabledReason}</p>
      ) : null}
      {needsReauth ? (
        <p className={cn("mt-2 text-xs text-destructive")}>Needs re-authorization</p>
      ) : null}
    </article>
  )
}

export function AppLogo({ name, logo, size = "md" }: { name: string; logo?: string | null; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "size-7" : "size-10"
  if (logo) {
    return (
      <img
        src={logo}
        alt=""
        className={cn(dim, "shrink-0 rounded-xl border border-border bg-background object-contain p-1")}
      />
    )
  }
  return (
    <div className={cn(dim, "flex shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-semibold")}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}
