export const COMPOSIO_SEARCH_MIN = 3

export function normalizeCatalogSearch(value?: string) {
  return value?.trim() || ""
}

export function composioSearchQuery(value?: string) {
  const query = normalizeCatalogSearch(value)
  return query.length >= COMPOSIO_SEARCH_MIN ? query : undefined
}

export function matchesCatalogSearch(
  item: { name?: string | null; slug?: string | null; description?: string | null },
  value?: string
) {
  const query = normalizeCatalogSearch(value).toLowerCase()
  if (!query) return true
  const haystack = [item.name, item.slug, item.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(query)
}
