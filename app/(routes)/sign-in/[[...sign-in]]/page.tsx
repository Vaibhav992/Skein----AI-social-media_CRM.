import Logo from "@/components/logo"
import { Atmosphere } from "@/components/landing/atmosphere"
import { ClerkSignPanel } from "@/components/auth/clerk-sign-panel"
import { BRAND_TAGLINE } from "@/constants/brand"

const SignInPage = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-16 text-white">
      <Atmosphere />
      <div className="relative flex w-full max-w-md flex-col items-center gap-8">
        <div className="text-center">
          <Logo name={undefined} onInk />
          <p className="mt-4 text-sm text-white/65">{BRAND_TAGLINE}</p>
        </div>
        <ClerkSignPanel mode="sign-in" />
      </div>
    </div>
  )
}

export default SignInPage
