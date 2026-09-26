"use client"

import { Check } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ChannelTypeEnum, getChannelIcon } from "@/constants/channels"

type ChannelAvatarProps = {
  type: ChannelTypeEnum
  color: string
  profileImage?: string | null
  name?: string | null
  size?: "sm" | "md"
  className?: string
  selected?: boolean
}

const ChannelAvatar = ({
  type,
  color,
  profileImage,
  name,
  size = "md",
  className = "inline-flex items-center gap-2",
  selected = false,
}: ChannelAvatarProps) => {
  const icon = getChannelIcon(type)
  const hasPhoto = Boolean(profileImage)
  const box = size === "sm" ? "size-8" : "size-10"

  return (
    <div className={cn(className)}>
      <Avatar className={cn(box, "rounded-xl border border-white/80 shadow-sm after:hidden")}>
        {hasPhoto ? (
          <>
            <AvatarImage src={profileImage || undefined} className="rounded-xl object-cover" />
            <AvatarFallback className="rounded-xl bg-muted text-xs font-semibold text-foreground">
              {name?.slice(0, 2).toUpperCase() || type.slice(0, 2)}
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback
            className="rounded-xl text-white"
            style={{ backgroundColor: color || "#111827" }}
          >
            {icon ? (
              <HugeiconsIcon icon={icon} className="size-5 text-white" />
            ) : (
              <span className="text-[10px] font-semibold">{type.slice(0, 2)}</span>
            )}
          </AvatarFallback>
        )}
        {hasPhoto && icon ? (
          <div
            className={cn(
              "absolute z-10 inline-flex items-center justify-center rounded-sm bg-white p-px",
              "right-[-3px] bottom-[-3px]",
              size === "sm" ? "size-[15px]" : "size-5"
            )}
          >
            <span
              className="flex size-full items-center justify-center rounded-sm"
              style={{ backgroundColor: color }}
            >
              <HugeiconsIcon icon={icon} className="size-2.5 text-white" />
            </span>
          </div>
        ) : null}
        {selected ? (
          <span className="absolute -top-1 -right-1 z-20 flex size-4 items-center justify-center rounded-full bg-foreground text-background ring-2 ring-popover">
            <Check className="size-2.5" />
          </span>
        ) : null}
      </Avatar>

      {name ? (
        <span className="truncate text-[14px] font-medium text-foreground">{name}</span>
      ) : null}
    </div>
  )
}

export default ChannelAvatar
