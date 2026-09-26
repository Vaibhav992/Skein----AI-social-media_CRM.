"use client"

import { useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { AuthField, ConnectedApp } from "@/lib/composio/types"

export type ConnectStartResult =
  | { kind: "oauth"; url: string }
  | { kind: "api_key"; needsApiKey: true; slug: string; name: string; authGuideUrl: string | null; fields: AuthField[] }
  | { kind: "connected"; app: ConnectedApp }

async function parseError(res: Response) {
  const data = await res.json().catch(() => ({}))
  throw new Error(data.error || "Request failed")
}

export function useConnectApp(options?: { redirectTo?: string }) {
  const queryClient = useQueryClient()

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["apps"] })
    queryClient.invalidateQueries({ queryKey: ["apps-connected"] })
    queryClient.invalidateQueries({ queryKey: ["apps-categories"] })
    queryClient.invalidateQueries({ queryKey: ["channels"] })
  }, [queryClient])

  const connect = useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch("/api/apps/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, redirectTo: options?.redirectTo }),
      })
      if (!res.ok) await parseError(res)
      return res.json() as Promise<ConnectStartResult>
    },
    onSuccess: (result) => {
      if (result.kind === "oauth") {
        window.location.href = result.url
        return
      }
      if (result.kind === "connected") {
        toast.success(`Connected ${result.app.name}`)
        invalidate()
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start connection")
    },
  })

  const connectApiKey = useMutation({
    mutationFn: async (input: { slug: string; secrets: Record<string, string> }) => {
      const res = await fetch("/api/apps/connect/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (!res.ok) await parseError(res)
      return res.json()
    },
    onSuccess: () => {
      toast.success("App connected")
      invalidate()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to connect with API key")
    },
  })

  const disconnect = useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch("/api/apps/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
      if (!res.ok) await parseError(res)
      return res.json()
    },
    onSuccess: () => {
      toast.success("App disconnected")
      invalidate()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to disconnect")
    },
  })

  return { connect, connectApiKey, disconnect, invalidate }
}
