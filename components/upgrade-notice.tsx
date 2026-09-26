import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type UpgradeNoticeProps = {
  title?: string
  description?: string
  href?: string
  className?: string
}

export function UpgradeNotice({
  title = "AI idea generation requires an upgrade",
  description = "Unlock drafting and idea generation on Pro or Business.",
  href = "/billing",
  className,
}: UpgradeNoticeProps) {
  return (
    <div
      className={cn("banner-warning px-4 py-3", className)}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-amber-900 dark:text-amber-100/90">{description}</p>
      <Button
        asChild
        size="sm"
        variant="outline"
        className="mt-3 border-amber-800 bg-amber-950 text-amber-50 hover:bg-amber-900 hover:text-amber-50 dark:border-amber-300 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-100 dark:hover:text-amber-950"
      >
        <Link href={href}>Upgrade</Link>
      </Button>
    </div>
  )
}
