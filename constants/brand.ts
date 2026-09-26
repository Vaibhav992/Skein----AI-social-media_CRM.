import brandJson from "@/brand.json"

export const brand = brandJson

export const BRAND_NAME = brand.name
export const BRAND_WORDMARK = brand.wordmark
export const BRAND_HANDLE = brand.handle
export const BRAND_INITIALS = brand.fallbackInitials
export const BRAND_TAGLINE = brand.tagline
export const BRAND_DESCRIPTION = brand.description
export const BRAND_POWERED_BY = brand.poweredBy
export const BRAND_LEGAL_NAME = brand.legalName

export const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_")
)
