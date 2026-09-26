import Link from "next/link"
import { Check } from "lucide-react"
import { BRAND_NAME, BRAND_POWERED_BY } from "@/constants/brand"

const plans = [
  {
    name: "Studio",
    price: "Free",
    points: ["3 publish channels + 5 apps", "Ideas, calendar, list", "30 posts / month"],
  },
  {
    name: `${BRAND_NAME} Pro`,
    price: "$29/mo",
    featured: true,
    points: ["10 channels + 25 apps", "AI drafting + agent queue", "5 auto-reply rules"],
  },
  {
    name: `${BRAND_NAME} Business`,
    price: "$79/mo",
    points: ["Unlimited channels", "File-in-DM automations", "Agent post-now"],
  },
]

export default function BillingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-6">
      <p className="mb-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        <span className="h-px w-6 bg-accent" />
        {BRAND_NAME}
      </p>
      <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your {BRAND_NAME} plan. Checkout through InsForge Stripe lands in the next build step.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={
              plan.featured
                ? "rounded-[28px] bg-ink p-6 text-white"
                : "rounded-[28px] border border-border bg-card p-6"
            }
          >
            <h2 className="text-xl font-bold tracking-tight">{plan.name}</h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight">{plan.price}</p>
            <ul className="mt-5 space-y-2.5">
              {plan.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm">
                  <Check className={`mt-0.5 size-4 ${plan.featured ? "text-lime" : "text-accent"}`} />
                  <span className={plan.featured ? "text-white/80" : "text-muted-foreground"}>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <p className="mt-6 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Powered by {BRAND_POWERED_BY}
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Need a paid plan now?{" "}
        <Link href="/#pricing" className="font-semibold text-accent underline-offset-4 hover:underline">
          See public pricing
        </Link>
        .
      </p>
    </div>
  )
}
