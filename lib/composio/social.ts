import { ChannelTypeEnum } from "@/constants/channels"

export const SOCIAL_SLUGS = [
  "twitter",
  "linkedin",
  "instagram",
  "facebook",
  "threads",
  "youtube",
  "bluesky",
  "tiktok",
] as const

export type SocialSlug = (typeof SOCIAL_SLUGS)[number]

export const CHANNEL_TYPE_TO_SLUG: Record<ChannelTypeEnum, SocialSlug> = {
  [ChannelTypeEnum.TWITTER]: "twitter",
  [ChannelTypeEnum.LINKEDIN]: "linkedin",
  [ChannelTypeEnum.INSTAGRAM]: "instagram",
  [ChannelTypeEnum.FACEBOOK]: "facebook",
  [ChannelTypeEnum.THREADS]: "threads",
  [ChannelTypeEnum.YOUTUBE]: "youtube",
  [ChannelTypeEnum.BLUESKY]: "bluesky",
  [ChannelTypeEnum.TIKTOK]: "tiktok",
}

export const SLUG_TO_CHANNEL_TYPE: Record<SocialSlug, ChannelTypeEnum> = {
  twitter: ChannelTypeEnum.TWITTER,
  linkedin: ChannelTypeEnum.LINKEDIN,
  instagram: ChannelTypeEnum.INSTAGRAM,
  facebook: ChannelTypeEnum.FACEBOOK,
  threads: ChannelTypeEnum.THREADS,
  youtube: ChannelTypeEnum.YOUTUBE,
  bluesky: ChannelTypeEnum.BLUESKY,
  tiktok: ChannelTypeEnum.TIKTOK,
}

export function isSocialSlug(slug: string): slug is SocialSlug {
  return (SOCIAL_SLUGS as readonly string[]).includes(slug)
}

export function channelTypeToSlug(type: string): SocialSlug | null {
  return CHANNEL_TYPE_TO_SLUG[type as ChannelTypeEnum] ?? null
}
