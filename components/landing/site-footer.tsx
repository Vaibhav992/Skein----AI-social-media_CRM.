import Link from "next/link"
import Logo from "@/components/logo"
import { BRAND_LEGAL_NAME, BRAND_NAME, BRAND_POWERED_BY, BRAND_WORDMARK } from "@/constants/brand"

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Workflow", href: "#workflow" },
      { label: "Channels", href: "#channels" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Workspace",
    links: [
      { label: "Ideas", href: "/ideas" },
      { label: "Schedule", href: "/schedule" },
      { label: "Settings", href: "/settings" },
      { label: "Billing", href: "/billing" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/sign-in" },
      { label: "Sign up", href: "/sign-up" },
    ],
  },
]

export function SiteFooter() {
  const letters = BRAND_WORDMARK.split("")

  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo name={BRAND_NAME} onInk />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              {BRAND_NAME} is the social studio for planning, drafting, and publishing without the usual mess.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-lime">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-lime"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden border-t border-white/10 px-2 pb-6 pt-8">
        <p
          className="flex justify-center font-headings font-extrabold leading-none tracking-tighter select-none"
          style={{ fontSize: "19.5vw" }}
          aria-label={BRAND_WORDMARK}
        >
          {letters.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="wordmark-letter"
              style={{ "--d": `${index * 120}ms` } as React.CSSProperties}
            >
              {letter}
            </span>
          ))}
        </p>
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
          © {new Date().getFullYear()} {BRAND_NAME}. Powered by {BRAND_POWERED_BY}. {BRAND_LEGAL_NAME} studio.
        </p>
      </div>
    </footer>
  )
}
