import { CalendarDays, Layers3, Lightbulb, Sparkles } from "lucide-react"
import { SectionHeading } from "@/components/landing/section-heading"
import { BRAND_NAME } from "@/constants/brand"

const features = [
  {
    title: "The cleanest way to plan the week",
    description: `See ideas, drafts, and scheduled posts in one ${BRAND_NAME} calendar — no tabs, no spreadsheets.`,
    icon: CalendarDays,
  },
  {
    title: "Customize once, publish everywhere",
    description: "Start with a global draft, then tune copy and media so every channel still sounds like you.",
    icon: Layers3,
  },
  {
    title: "Ideas that do not get lost",
    description: `Park sparks on the ${BRAND_NAME} board, then promote the ones that are ready to ship.`,
    icon: Lightbulb,
  },
  {
    title: "AI that stays in the loop",
    description: "Generate, shorten, expand, or rephrase without leaving the post you are already writing.",
    icon: Sparkles,
  },
]

export function Features() {
  return (
    <section id="features" className="bg-background">
      <div className="mx-auto max-w-[1240px] px-4 pt-24 sm:px-8">
        <SectionHeading
          eyebrow={`${BRAND_NAME} product`}
          title="A studio for the whole posting loop"
          description={`Planning, drafting, and publishing share one surface. That is the ${BRAND_NAME} difference.`}
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-[28px] border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-accent/10 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-lime">
                <feature.icon className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {feature.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
