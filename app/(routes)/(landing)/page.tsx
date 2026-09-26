import { Channels } from "@/components/landing/channels"
import { CtaBand } from "@/components/landing/cta-band"
import { Features } from "@/components/landing/features"
import { Hero } from "@/components/landing/hero"
import { Pricing } from "@/components/landing/pricing"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { Workflow } from "@/components/landing/workflow"
import { BRAND_NAME } from "@/constants/brand"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#features" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-lime focus:px-3 focus:py-2 focus:text-ink">
        Skip to {BRAND_NAME} content
      </a>
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <Workflow />
        <Channels />
        <Pricing />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  )
}
