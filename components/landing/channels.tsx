import { HugeiconsIcon } from "@hugeicons/react"
import { Check } from "lucide-react"
import { SectionHeading } from "@/components/landing/section-heading"
import { ChannelTypeEnum, getChannelIcon } from "@/constants/channels"
import { BRAND_NAME } from "@/constants/brand"

const channels = [
  { type: ChannelTypeEnum.TWITTER, name: "X", color: "#000000" },
  { type: ChannelTypeEnum.LINKEDIN, name: "LinkedIn", color: "#2867b2" },
  { type: ChannelTypeEnum.INSTAGRAM, name: "Instagram", color: "#E4405F" },
  { type: ChannelTypeEnum.THREADS, name: "Threads", color: "#000000" },
  { type: ChannelTypeEnum.FACEBOOK, name: "Facebook", color: "#1877F2" },
  { type: ChannelTypeEnum.YOUTUBE, name: "YouTube", color: "#FF0000" },
  { type: ChannelTypeEnum.BLUESKY, name: "Bluesky", color: "#1285fe" },
  { type: ChannelTypeEnum.TIKTOK, name: "TikTok", color: "#111111" },
]

const proofs = [
  { value: "8", label: "social platforms supported" },
  { value: "1", label: `${BRAND_NAME} workspace` },
  { value: "AI", label: "built into drafting and publishing" },
]

export function Channels() {
  return (
    <section id="channels" className="bg-background">
      <div className="mx-auto max-w-[1240px] px-4 pt-24 sm:px-8">
        <SectionHeading
          eyebrow={`${BRAND_NAME} channels`}
          title={`Every network. One ${BRAND_NAME} queue.`}
          description="Connect accounts, preview in the native chrome, and keep the week honest."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((channel) => {
            const icon = getChannelIcon(channel.type)
            return (
              <div
                key={channel.type}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl"
              >
                <div
                  className="flex size-12 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: channel.color }}
                >
                  {icon ? (
                    <HugeiconsIcon icon={icon} color="currentColor" className="size-5" />
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold tracking-tight">{channel.name}</h3>
                  <span className="rounded-full bg-lime px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground">
                    Live
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Native preview and scheduling inside {BRAND_NAME}.
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {proofs.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[28px] border border-border bg-card px-6 py-8 text-center shadow-sm"
            >
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{stat.value}</div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] border border-accent/20 bg-accent/[0.05] p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-4 w-4 text-accent" strokeWidth={2.5} />
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {BRAND_NAME} keeps one source of truth for copy, media, and timing. Channel-specific edits stay attached to the same post.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
