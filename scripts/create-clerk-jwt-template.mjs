import { readFileSync } from "node:fs"

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=")
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
    })
)

const clerkKey = env.CLERK_SECRET_KEY
const signingKey = process.env.INSFORGE_JWT_SECRET
if (!clerkKey?.startsWith("sk_")) {
  console.error("Missing CLERK_SECRET_KEY")
  process.exit(1)
}
if (!signingKey) {
  console.error("Missing INSFORGE_JWT_SECRET")
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${clerkKey}`,
  "Content-Type": "application/json",
}

const listRes = await fetch("https://api.clerk.com/v1/jwt_templates", { headers })
const templates = await listRes.json()
if (!listRes.ok) {
  console.error("Could not list Clerk JWT templates", listRes.status)
  process.exit(1)
}

const existing = (Array.isArray(templates) ? templates : templates.data || []).find(
  (item) => item.name === "insforge"
)

const body = {
  name: "insforge",
  claims: {
    role: "authenticated",
    aud: "insforge-api",
  },
  lifetime: 60,
  allowed_clock_skew: 5,
  custom_signing_key: true,
  signing_algorithm: "HS256",
  signing_key: signingKey,
}

const url = existing
  ? `https://api.clerk.com/v1/jwt_templates/${existing.id}`
  : "https://api.clerk.com/v1/jwt_templates"

const res = await fetch(url, {
  method: existing ? "PATCH" : "POST",
  headers,
  body: JSON.stringify(body),
})

const data = await res.json()
if (!res.ok) {
  console.error("Clerk JWT template failed", res.status, data?.errors || data)
  process.exit(1)
}

console.log(existing ? "Updated Clerk JWT template insforge" : "Created Clerk JWT template insforge")
