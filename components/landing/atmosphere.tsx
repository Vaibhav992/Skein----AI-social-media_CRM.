import { cn } from "@/lib/utils"

type AtmosphereProps = {
  className?: string
  centered?: boolean
}

export function Atmosphere({ className, centered = false }: AtmosphereProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      <div className="bg-grid-dark absolute inset-0" />
      {centered ? (
        <div className="absolute left-1/2 top-1/2 h-[360px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/25 blur-[120px]" />
      ) : (
        <>
          <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-indigo-600/25 blur-[120px]" />
          <div className="absolute -right-32 top-40 h-[420px] w-[420px] rounded-full bg-lime/[0.07] blur-[120px]" />
        </>
      )}
    </div>
  )
}
