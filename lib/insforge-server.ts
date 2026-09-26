import { auth } from "@clerk/nextjs/server"
import { createClient, type InsForgeClient } from "@insforge/sdk"

const BASE_URL = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY
const PROJECT_API_KEY = process.env.INSFORGE_PROJECT_API_KEY
const SERVER_TOKEN_TEMPLATE =
  process.env.CLERK_INSFORGE_TEMPLATE ||
  process.env.NEXT_PUBLIC_CLERK_INSFORGE_TEMPLATE ||
  "insforge"

function requireBaseConfig() {
  if (!BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_INSFORGE_BASE_URL")
  }
  if (!ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_INSFORGE_ANON_KEY")
  }
}

export async function getInsforgeServerClient(): Promise<{
  insforge: InsForgeClient
  userId: string | null
}> {
  requireBaseConfig()

  const session = await auth()
  const userId = session.userId

  const insforge = createClient({
    baseUrl: BASE_URL,
    anonKey: ANON_KEY,
    isServerMode: true,
  })

  if (userId) {
    try {
      const token = await session.getToken({ template: SERVER_TOKEN_TEMPLATE })
      if (token) {
        insforge.getHttpClient().setAuthToken(token)
      } else {
        console.error("No Clerk InsForge JWT received. Create a JWT template named insforge.")
      }
    } catch (error) {
      console.error("Failed to get Clerk InsForge JWT", error)
    }
  }

  return { insforge, userId }
}

export function getInsforgeAdminClient(): InsForgeClient {
  requireBaseConfig()
  if (!PROJECT_API_KEY) {
    throw new Error("Missing INSFORGE_PROJECT_API_KEY")
  }

  return createClient({
    baseUrl: BASE_URL,
    anonKey: PROJECT_API_KEY,
    isServerMode: true,
  })
}

export const getInsforgeUploadClient = getInsforgeAdminClient
