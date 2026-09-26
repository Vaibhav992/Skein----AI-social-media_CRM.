import { NextRequest } from "next/server"

export function resolveAppUrl(request?: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
  const origin = request
    ? request.headers.get("origin") || request.nextUrl.origin
    : null

  if (origin?.includes("localhost") || origin?.includes("127.0.0.1")) {
    return origin.replace(/\/$/, "")
  }

  if (configured) return configured
  if (origin) return origin.replace(/\/$/, "")
  return "http://localhost:3000"
}
