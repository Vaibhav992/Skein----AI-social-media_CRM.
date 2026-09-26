import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: "left" | "center"
  surface?: "paper" | "ink"
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  surface = "paper",
  className,
}: SectionHeadingProps) {
  const onInk = surface === "ink"

  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <div
        className={cn(
          "mb-4 flex items-center gap-3",
          align === "center" && "justify-center"
        )}
      >
        <span className={cn("h-px w-6", onInk ? "bg-lime" : "bg-accent")} />
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.2em]",
            onInk ? "text-lime" : "text-accent"
          )}
        >
          {eyebrow}
        </span>
        {align === "center" ? (
          <span className={cn("h-px w-6", onInk ? "bg-lime" : "bg-accent")} />
        ) : null}
      </div>
      <h2
        className={cn(
          "text-3xl font-bold tracking-tight sm:text-4xl lg:text-[44px] lg:leading-[1.1]",
          onInk ? "text-white" : "text-foreground"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 max-w-2xl text-base leading-relaxed sm:text-lg",
            align === "center" && "mx-auto",
            onInk ? "text-white/65" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
