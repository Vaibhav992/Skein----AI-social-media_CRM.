import Link from "next/link"
import { ArrowRight, Calendar } from "lucide-react"
import { Atmosphere } from "@/components/landing/atmosphere"
import { BRAND_NAME } from "@/constants/brand"

export function CtaBand() {
  return (
    <section className="mt-28">
      <div className="relative overflow-hidden bg-ink py-20 text-white sm:py-24">
        <Atmosphere centered />
        <div className="relative mx-auto max-w-[1240px] px-4 text-center sm:px-8">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-6 bg-lime" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-lime">
              {BRAND_NAME}
            </span>
            <span className="h-px w-6 bg-lime" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[44px]">
            Get the week on a loop.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/65 sm:text-lg">
            Open a {BRAND_NAME} workspace, connect a channel, and ship the next post from one calendar.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-lime px-6 py-4 text-sm font-bold text-ink shadow-[0_0_40px_-10px_#d9f99d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-strong sm:text-base"
            >
              <Calendar className="h-4 w-4" strokeWidth={2.5} />
              Start free with {BRAND_NAME}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold text-white hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
