import { SignIn, SignUp } from "@clerk/nextjs"
import { BRAND_NAME, isClerkConfigured } from "@/constants/brand"

type ClerkSignPanelProps = {
  mode: "sign-in" | "sign-up"
}

export function ClerkSignPanel({ mode }: ClerkSignPanelProps) {
  if (!isClerkConfigured) {
    return (
      <div className="w-full rounded-[28px] border border-white/10 bg-white p-6 text-ink shadow-xl sm:p-8">
        <h2 className="text-xl font-bold tracking-tight">
          {mode === "sign-in" ? `Sign in to ${BRAND_NAME}` : `Create your ${BRAND_NAME} account`}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Clerk keys are missing, so the floating &quot;Configure your application&quot; dock appears
          and login cannot finish. Add these to <code className="font-mono text-xs">.env</code> from
          the Clerk dashboard, then restart the dev server:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-ink p-4 font-mono text-[11px] leading-relaxed text-lime">
{`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...`}
        </pre>
        <p className="mt-4 text-sm text-muted-foreground">
          Dashboard:{" "}
          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            dashboard.clerk.com
          </a>
        </p>
      </div>
    )
  }

  if (mode === "sign-in") {
    return <SignIn path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/" />
  }

  return <SignUp path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/" />
}
