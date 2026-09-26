"use client"

import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { ArrowRight, Calendar, Check } from "lucide-react"
import { Atmosphere } from "@/components/landing/atmosphere"
import { BRAND_NAME } from "@/constants/brand"

export function Hero() {
  const { isSignedIn } = useAuth()

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <Atmosphere />

      <div className="relative mx-auto flex min-h-[760px] max-w-[1240px] flex-col justify-center px-4 pb-24 pt-20 sm:px-8">
        <div className="hero-in mx-auto max-w-4xl text-center" style={{ "--d": "40ms" } as React.CSSProperties}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-lime shadow-[0_0_14px_#d9f99d]" />
            </span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-lime">
              {BRAND_NAME} workspace
            </span>
          </div>

          <h1 className="font-heading text-[38px] font-extrabold leading-[1.15] sm:text-6xl lg:text-[64px]">
            <span className="block">Plan once.</span>
            <span className="block">Publish everywhere</span>
            <span className="text-shimmer">on {BRAND_NAME}.</span>
          </h1>

          <p
            className="hero-in mx-auto mt-6 max-w-2xl text-base text-white/65 sm:text-lg"
            style={{ "--d": "280ms" } as React.CSSProperties}
          >
            Draft faster, tune every channel, and keep the week on a single calendar.
            {` ${BRAND_NAME} is the studio for ideas, posts, and publishing.`}
          </p>

          <div
            className="hero-in mt-10 flex flex-wrap items-center justify-center gap-3"
            style={{ "--d": "380ms" } as React.CSSProperties}
          >
            {!isSignedIn ? (
              <>
                <Link
                  href="/sign-up"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-lime px-6 py-4 text-sm font-bold text-ink shadow-[0_0_40px_-10px_#d9f99d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-strong sm:text-base"
                >
                  <Calendar className="h-4 w-4" strokeWidth={2.5} />
                  Start with {BRAND_NAME}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 sm:text-base"
                >
                  Log in
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/schedule"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-lime px-6 py-4 text-sm font-bold text-ink shadow-[0_0_40px_-10px_#d9f99d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-strong sm:text-base"
                >
                  Open {BRAND_NAME}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                </Link>
                <Link
                  href="/ideas"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 sm:text-base"
                >
                  View ideas
                </Link>
              </>
            )}
          </div>

          <div
            className="hero-in mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/55"
            style={{ "--d": "480ms" } as React.CSSProperties}
          >
            {["Eight channels", "One calendar", "AI drafts"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-lime" strokeWidth={2.5} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
