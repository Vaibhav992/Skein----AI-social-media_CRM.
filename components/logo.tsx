"use client"

import Link from "next/link"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { BRAND_NAME, BRAND_POWERED_BY } from "@/constants/brand"

interface LogoProps {
  name?: string
  className?: string
  hideName?: boolean
  href?: string
  onInk?: boolean
  showPoweredBy?: boolean
}

const Logo = ({
  name = BRAND_NAME,
  className,
  hideName = false,
  href = "/",
  onInk = true,
  showPoweredBy = true,
}: LogoProps) => {
  const mark = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-lime text-ink transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-6 group-hover:scale-105">
        <Zap className="size-[18px]" strokeWidth={2.5} />
      </div>
      {!hideName && (
        <span className="flex min-w-0 flex-col leading-none">
          <span
            className={cn(
              "font-heading text-sm font-bold tracking-tight",
              onInk ? "text-white" : "text-foreground"
            )}
          >
            {name}
          </span>
          {showPoweredBy ? (
            <span
              className={cn(
                "mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em]",
                onInk ? "text-white/45" : "text-muted-foreground"
              )}
            >
              Powered by {BRAND_POWERED_BY}
            </span>
          ) : null}
        </span>
      )}
    </div>
  )

  if (!href) return mark

  return (
    <Link href={href} className="group inline-flex" aria-label={`${name}, powered by ${BRAND_POWERED_BY}`}>
      {mark}
    </Link>
  )
}

export default Logo
