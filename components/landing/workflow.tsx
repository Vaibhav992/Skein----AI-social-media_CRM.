import { SectionHeading } from "@/components/landing/section-heading"
import { Atmosphere } from "@/components/landing/atmosphere"
import { BRAND_NAME } from "@/constants/brand"

const steps = [
  { n: "01", title: "Capture", body: "Drop ideas onto the board the moment they show up." },
  { n: "02", title: "Draft", body: `Write once in ${BRAND_NAME}, then let AI tighten the voice.` },
  { n: "03", title: "Tune", body: "Adapt length, media, and tone for each connected channel." },
  { n: "04", title: "Ship", body: `Schedule on the calendar. ${BRAND_NAME} publishes on time.` },
]

export function Workflow() {
  return (
    <section id="workflow" className="relative mt-24 overflow-hidden bg-ink py-20 text-white sm:py-24">
      <Atmosphere />
      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-8">
        <SectionHeading
          surface="ink"
          eyebrow={`${BRAND_NAME} workflow`}
          title="Four steps. One loop."
          description="The posting stack is linear on purpose. Capture, draft, tune, ship — then start again."
        />

        <div className="relative mt-14 grid gap-5 md:grid-cols-4">
          <div className="pointer-events-none absolute left-[8%] right-[8%] top-8 hidden h-px bg-linear-to-r from-accent via-accent-violet to-lime md:block" />
          {steps.map((step) => (
            <article
              key={step.n}
              className="relative rounded-[28px] border border-white/10 bg-white/5 p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime font-mono text-xs font-semibold text-ink">
                {step.n}
              </div>
              <h3 className="mt-5 text-xl font-bold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
