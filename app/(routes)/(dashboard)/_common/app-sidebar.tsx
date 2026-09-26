"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Calendar, CreditCard, LayoutGrid, Lightbulb, Plus, PlusCircleIcon, Settings } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import Logo from '@/components/logo';
import { BRAND_NAME } from '@/constants/brand';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { getChannelIcon, getChannelUrl } from '@/constants/channels';
import { ChannelType } from '@/types/channel.type';
import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { UserButton, useUser } from '@clerk/nextjs';
import ChannelAvatar from '@/components/channel-avatar';
import { toast } from 'sonner';
import { useState } from 'react';
import CreatePostDialog from '@/components/schedule/create-post-dialog';

const mainNav = [
  { name: "Ideas", href: "/ideas", icon: Lightbulb },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Apps", href: "/apps", icon: LayoutGrid },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { user } = useUser()
  const [isCreatePostOpen, setIsCreatePostOpen] = useState<boolean>(false)

   const connectMutation = useMutation({
    mutationFn: async (channelTypeId: string) => {
      const res = await fetch("/api/channel/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelTypeId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect channel")
      }
      return data as { url?: string; kind?: string; error?: string }
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
        return
      }
      if (data.kind === "connected") {
        toast.success("Channel connected")
        return
      }
      toast.error(data.error || "This channel needs extra credentials. Open Apps to finish.")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to connect channel")
    }
  })

  const {data:channelsData, isPending} = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const res = await fetch("/api/channel");
      const data = await res.json();
      return data
    }
  })

  const { data: connectedAppsData } = useQuery({
    queryKey: ["apps-connected"],
    queryFn: async () => {
      const res = await fetch("/api/apps/connected")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load apps")
      return data as {
        groups: { categoryId: string; categoryName: string; apps: { id: string; slug: string; name: string; logo: string | null; status: string }[] }[]
      }
    }
  })
  
  const channels = (channelsData?.channels || []) as ChannelType[]
  const unconnectedChannels = channels.filter((channel: ChannelType) => !channel.connected);
  const connectedChannels = channels.filter((channel: ChannelType) => channel.connected);

  const connectedCount = channelsData?.connectedCount || 0;
  const totalChannels = channelsData?.totalChannels || 0;
  const limitedChannels = unconnectedChannels.slice(0, 4);


  const handleConnect = (channelTypeId: string) => {
    if(connectMutation.isPending) return;
    connectMutation.mutate(channelTypeId);
  }
 

  return (
    <>
    <Sidebar collapsible="icon">
      <SidebarHeader className={cn("p-4", isCollapsed && "p-2")}>
        <div className='flex items-center justify-between'>
           <Logo hideName={isCollapsed} onInk name={BRAND_NAME} showPoweredBy={!isCollapsed} />
           <SidebarTrigger className="hidden md:flex -mx-8 mb-0" />
        </div>
        <Button
          className="mt-4 w-full rounded-2xl bg-lime text-ink shadow-[0_0_40px_-10px_#d9f99d] hover:bg-lime-strong"
          size={isCollapsed ? "icon": "lg"}
          onClick={() => setIsCreatePostOpen(true)}
        >
            <Plus className="size-4" />
           {!isCollapsed && <span>New Post</span>}
        </Button>
      </SidebarHeader>
      <SidebarContent className={cn(!isCollapsed && "px-2")}>
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {mainNav.map((item) => (
                        <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton asChild
                            isActive={pathname === item.href}
                    tooltip={item.name}
                            >
                                <Link href={item.href}>
                                    <item.icon className="size-4" />
                                    <span className='text-sm'>{item.name}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>

        {connectedAppsData?.groups?.length ? (
         <SidebarGroup className={cn(isCollapsed && "px-1")}>
          <SidebarGroupLabel className='text-sm'>Connected apps</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {connectedAppsData.groups.map((group) => (
                <SidebarMenuItem key={group.categoryId}>
                  <div className={cn("w-full", isCollapsed ? "flex justify-center" : "space-y-1.5 py-1")}>
                    {!isCollapsed && (
                      <p className="px-2 text-[11px] uppercase tracking-wide text-white/45">{group.categoryName}</p>
                    )}
                    <div className={cn("flex flex-wrap gap-1.5", isCollapsed ? "flex-col items-center" : "px-2")}>
                      {group.apps.filter((app) => app.status === "connected").map((app) => (
                        <Link key={app.id} href="/apps?tab=connected" title={app.name}>
                          {app.logo ? (
                            <img src={app.logo} alt={app.name} className="size-6 rounded-md bg-white object-contain p-0.5" />
                          ) : (
                            <span className="flex size-6 items-center justify-center rounded-md bg-white/10 text-[10px] text-white">
                              {app.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
         </SidebarGroup>
        ) : null}

        {/* {connected channels} */}
         {connectedChannels.length > 0 && (
         <SidebarGroup className={cn(isCollapsed && "px-1")}>
          <SidebarGroupLabel className='text-sm'>Channels</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
               {isPending ? (
                <div className='flex flex-col gap-2'>
                  <Skeleton className='h-8 w-full bg-secondary' />
                  <Skeleton className='h-8 w-full bg-secondary' />
                  <Skeleton className='h-8 w-full bg-secondary' />
                  <Skeleton className='h-8 w-full bg-secondary' />
                </div>
              ) : (
                connectedChannels?.map((channel: ChannelType) => {
                  const url = getChannelUrl(channel.type)
                  return (
                    <SidebarMenuItem key={channel.id}>
                      <SidebarMenuButton asChild>
                       <a
                         href={`${url}/${channel.handle}`}
                         target="_blank" rel="noreferrer"
                          className="w-full! relative block items-center gap-2"
                       >
                           <ChannelAvatar
                            size="sm"
                           className="w-full flex items-center gap-2"
                            type={channel.type}
                            color={channel.color}
                            profileImage={channel.profile_image}
                            name={!isCollapsed ? (channel.handle || channel.name) : ""}
                           />
                       </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
         </SidebarGroup>
         )}


        {/* {unconnected channels} */}
         <SidebarGroup className={cn(isCollapsed && "px-1")}>
          <SidebarGroupLabel className='text-sm'>Connect Channels</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isPending ? (
                <div className='flex flex-col gap-2'>
                  <Skeleton className='h-8 w-full bg-secondary' />
                  <Skeleton className='h-8 w-full bg-secondary' />
                  <Skeleton className='h-8 w-full bg-secondary' />
                  <Skeleton className='h-8 w-full bg-secondary' />
                </div>
              ) : (
                <>
                {limitedChannels.map((channel: ChannelType) => {
                  const icon = getChannelIcon(channel.type)
                  return (
                    <SidebarMenuItem key={channel.id}>
                      <SidebarMenuButton asChild
                       tooltip={`Connect ${channel.name}`}
                      >
                       <button
                        className='w-full flex items-center gap-2'
                        disabled={connectMutation.isPending}
                        onClick={() => handleConnect(channel.id)}
                       >
                          <span>
                             <div className='relative'>
                              {icon ? (
                                <HugeiconsIcon icon={icon} color='currentColor'
                                className=" text-white! size-6! p-1 rounded-sm"
                                  style={{ background: channel.color}}
                                />
                              ) : null}

                              <div className={`absolute -right-1 bottom-0 p-0.5
                                 bg-white dark:bg-background rounded-xs
                                `}>
                                  <HugeiconsIcon icon={PlusSignIcon} className="size-2!" />
                                </div>
                             </div>
                          </span>
                          <span className='truncate'>{channel.name}</span>
                       </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button asChild variant="ghost" className='w-full justify-start mt-1'>
                      <Link href="/apps" className='w-full flex items-center gap-2'>
                      <PlusCircleIcon className='size-4'  />
                      <span className='text-sm'>More apps</span>
                      </Link>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
         </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
         <div className="mb-3 text-xs text-white/55">
          <span>
            {connectedCount}/{totalChannels} {BRAND_NAME} channels
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UserButton
            showName={false}
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
          <span className="truncate text-sm text-white/80">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
     <CreatePostDialog
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
      />
    </>
  )
}

export default AppSidebar