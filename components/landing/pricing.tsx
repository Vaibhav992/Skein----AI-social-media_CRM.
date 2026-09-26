import Link from "next/link"
import { Check } from "lucide-react"
import { SectionHeading } from "@/components/landing/section-heading"
import { BRAND_NAME, BRAND_POWERED_BY } from "@/constants/brand"

const plans = [
  {
    name: "Studio",
    price: "Free",
    detail: "Start the loop",
    featured: false,
    points: [
      "3 publish channels + 5 other apps",
      "Ideas board, calendar, list",
      "30 scheduled posts / month",
      "Read-only inbox",
    ],
  },
  {
    name: `${BRAND_NAME} Pro`,
    price: "$29",
    detail: "When the calendar fills up",
    featured: true,
    points: [
      "10 publish channels + 25 apps",
      "AI generate, rephrase, expand",
      "300 posts / month + agent queue",
      "5 auto-reply rules (text / link)",
    ],
  },
  {
    name: `${BRAND_NAME} Business`,
    price: "$79",
    detail: "Automations and volume",
    featured: false,
    points: [
      "Unlimited channels and posts",
      "Agent post-now",
      "Comment → YES → file in DM",
      "Run log + kill switch",
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="bg-background pb-8">
      <div className="mx-auto max-w-[1240px] px-4 pt-24 sm:px-8">
        <SectionHeading
          align="center"
          eyebrow={`${BRAND_NAME} pricing`}
          title="Start free. Scale when the queue is real."
          description={`Open a ${BRAND_NAME} workspace, connect apps, and upgrade when publishing volume asks for it.`}
        />

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={
                plan.featured
                  ? "rounded-[28px] bg-ink p-6 text-white sm:p-8"
                  : "rounded-[28px] border border-border bg-card p-6 shadow-sm sm:p-8"
              }
            >
              <span
                className={
                  plan.featured
                    ? "rounded-full bg-lime px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground"
                    : "rounded-full bg-muted px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                }
              >
                {plan.featured ? "Recommended" : "Included"}
              </span>
              <h3 className="mt-5 text-2xl font-bold tracking-tight">{plan.name}</h3>
              <p className={`mt-1 text-sm ${plan.featured ? "text-white/65" : "text-muted-foreground"}`}>
                {plan.detail}
              </p>
              <div className="mt-6 text-4xl font-extrabold tracking-tight">
                {plan.price}
                {plan.price.startsWith("$") ? (
                  <span className={`text-base font-semibold ${plan.featured ? "text-white/55" : "text-muted-foreground"}`}>
                    /mo
                  </span>
                ) : null}
              </div>
              <ul className="mt-6 space-y-3">
                {plan.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm">
                    {plan.featured ? (
                      <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-lime/15 text-lime">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                    ) : (
                      <Check className="mt-0.5 h-4 w-4 text-accent" strokeWidth={2.5} />
                    )}
                    <span className={plan.featured ? "text-white/80" : "text-muted-foreground"}>{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className={
                  plan.featured
                    ? "mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-lime px-5 py-3.5 text-sm font-bold text-ink shadow-[0_0_40px_-10px_#d9f99d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-strong"
                    : "mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-ink px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-14px_rgba(7,8,13,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink-soft"
                }
              >
                Open {BRAND_NAME}
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Powered by {BRAND_POWERED_BY}
        </p>
      </div>
    </section>
  )
}
