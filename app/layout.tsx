import type { Metadata, Viewport } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { Toaster } from "@/components/ui/sonner"
import {
  brand,
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_POWERED_BY,
  BRAND_TAGLINE,
  isClerkConfigured,
} from "@/constants/brand"

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} | Social Media Scheduling`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  keywords: [BRAND_NAME, "social media scheduling", "AI content", "content calendar"],
  authors: [{ name: BRAND_POWERED_BY }],
  openGraph: {
    title: `${BRAND_NAME} | ${BRAND_TAGLINE}`,
    description: BRAND_DESCRIPTION,
    siteName: BRAND_NAME,
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: brand.themeColor,
  colorScheme: "light dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col font-sans">
        <ClerkProvider
          disableKeyless={isClerkConfigured}
          localization={{
            signIn: {
              start: {
                title: `Sign in to ${BRAND_NAME}`,
                subtitle: BRAND_TAGLINE,
              },
            },
            signUp: {
              start: {
                title: `Create your ${BRAND_NAME} account`,
                subtitle: BRAND_TAGLINE,
              },
            },
          }}
          appearance={{
            variables: {
              colorPrimary: "#0d0d0d",
              colorBackground: "#faf9f5",
              borderRadius: "12px",
            },
          }}
        >
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                {children}
              </TooltipProvider>
              <Toaster richColors closeButton duration={4000} />
            </ThemeProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
