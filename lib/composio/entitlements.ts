export type PlanCaps = {
  plan: "studio" | "pro" | "business"
  publish: number | null
  apps: number | null
}

export function getPlanCaps(): PlanCaps {
  return {
    plan: "studio",
    publish: 3,
    apps: 5,
  }
}

export function isUnlimited(limit: number | null): limit is null {
  return limit === null
}
