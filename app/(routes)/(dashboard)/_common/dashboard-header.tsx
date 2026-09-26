"use client"

import { useEffect, useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { BRAND_NAME } from "@/constants/brand"

export function DashboardHeader() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    return <div className="h-11 md:hidden" aria-hidden />
  }

  return (
    <div className="flex items-center gap-2 border-b border-border px-1 py-2 md:hidden">
      <SidebarTrigger className="md:hidden" />
      <span className="text-sm font-semibold tracking-tight">{BRAND_NAME}</span>
    </div>
  )
}
