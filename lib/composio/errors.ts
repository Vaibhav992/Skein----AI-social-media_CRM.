export function composioPublicError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  if (/401|Invalid API key|APIKey_InvalidAPIKey|Missing COMPOSIO_API_KEY/i.test(message)) {
    return {
      status: 503,
      error: "Composio API key is missing or invalid. Add a live COMPOSIO_API_KEY from app.composio.dev, then reload Apps.",
    }
  }
  return {
    status: 500,
    error: "Failed to load the marketplace",
  }
}
