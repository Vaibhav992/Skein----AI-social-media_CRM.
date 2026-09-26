export type AppAuthKind = "oauth" | "api_key" | "no_auth"

export type ConnectedAppStatus =
  | "connected"
  | "needs_reauth"
  | "failed"
  | "disconnected"

export type CatalogCategory = {
  id: string
  name: string
  sortOrder: number
}

export type CatalogToolkit = {
  slug: string
  name: string
  logo: string | null
  description: string | null
  categoryIds: string[]
  categories: { id: string; name: string }[]
  authSchemes: string[]
  authKind: AppAuthKind
  noAuth: boolean
  toolsCount: number
  deprecated: boolean
  authGuideUrl: string | null
  sortRank: number
}

export type AuthField = {
  name: string
  displayName: string
  description: string
  type: string
  required: boolean
}

export type ConnectedApp = {
  id: string
  slug: string
  name: string
  logo: string | null
  description: string | null
  categoryIds: string[]
  authScheme: string | null
  composioConnectedAccountId: string | null
  handle: string | null
  profileImage: string | null
  status: ConnectedAppStatus
  lastHealthAt: string | null
  lastError: string | null
}

export type ConnectedAppGroup = {
  categoryId: string
  categoryName: string
  apps: ConnectedApp[]
}
