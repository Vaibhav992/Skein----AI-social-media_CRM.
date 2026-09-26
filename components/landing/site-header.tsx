"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth, UserButton } from "@clerk/nextjs"
import { ArrowRight, Calendar, Menu, X } from "lucide-react"
import Logo from "@/components/logo"
import { BRAND_NAME } from "@/constants/brand"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Channels", href: "#channels" },
  { label: "Pricing", href: "#pricing" },
]

export function SiteHeader() {
  const { isSignedIn } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-ink/85 text-white backdrop-blur-xl transition-shadow duration-300",
        scrolled && "border-b border-white/10 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]"
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-4 sm:px-8">
        <Logo name={BRAND_NAME} onInk />

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] font-medium text-white/65 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <>
              <Link
                href="/sign-in"
                className="hidden text-[13px] font-medium text-white/65 transition-colors hover:text-white sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime px-5 py-3.5 text-sm font-bold text-ink shadow-[0_0_40px_-10px_#d9f99d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                <Calendar className="h-4 w-4" strokeWidth={2.5} />
                Start free
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/schedule"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime px-5 py-3.5 text-sm font-bold text-ink shadow-[0_0_40px_-10px_#d9f99d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-strong"
              >
                Open workspace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            </>
          )}

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-ink-soft/85 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            {!isSignedIn ? (
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
              >
                Log in
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
