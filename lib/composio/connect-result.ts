function displayAppName(slug?: string | null) {
  if (!slug) return "the app"
  if (slug === "twitter") return "X"
  return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function isUserCancel(code?: string | null) {
  return /cancel|access_denied|denied/i.test(code || "")
}

export function connectCallbackNotice(input: {
  connected?: string | null
  error?: string | null
  slug?: string | null
}) {
  const name = displayAppName(input.slug)

  if (input.connected === "true") {
    return { tone: "success" as const, message: `Connected ${name}.` }
  }

  if (isUserCancel(input.error)) {
    return { tone: "info" as const, message: `Connect cancelled. ${name} was not linked.` }
  }

  return {
    tone: "error" as const,
    message: `Could not connect ${name}. Try again.`,
  }
}
