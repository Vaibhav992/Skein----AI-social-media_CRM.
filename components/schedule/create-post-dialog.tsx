"use client"
import React, { useEffect, useMemo, useState } from "react";
import { format, parse, set } from "date-fns"
import { getChannelIcon } from "@/constants/channels";
import { ChannelType } from "@/types/channel.type";
import { ImageObject } from "@/types/post.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { cn } from "@/lib/utils";
import { AlertTriangle, Lightbulb, ScanEye, Wand2 } from "lucide-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { toast } from "sonner";
import { toggleVariants } from "../ui/toggle";
import ChannelAvatar from "../channel-avatar";
import ContentTextarea from "../content-textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { HugeiconsIcon } from "@hugeicons/react";
import IdeasList from "./ideas-list";
import PreviewPanel from "./preview";
import { ButtonGroup } from "../ui/button-group";
import { POST_STATUS, PostStatus } from "@/constants/post";
import { ScheduleDatePicker } from "./schedule-date-picker";
import Link from "next/link";
import { Spinner } from "../ui/spinner";
import { AIAssistant } from "./ai-assitant";

type PropsType = {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedDate?: Date | null
}

type ChannelContent = {
    text: string
    images: ImageObject[]
}

type ActionTabType = "ideas" | "ai" | "preview"

const rightTabs = [
    { id: "ideas" as ActionTabType, label: "Ideas", icon: Lightbulb },
    { id: "ai" as ActionTabType, label: "AI Assistant", icon: Wand2 },
    { id: "preview" as ActionTabType, label: "Preview", icon: ScanEye },
]


const CreatePostDialog = ({ open, onOpenChange, selectedDate }: PropsType) => {

    const queryClient = useQueryClient();
    const [globalContent, setGlobalContent] = useState<ChannelContent>({ text: "", images: [] })
    const [channelContent, setChannelContent] = useState<Record<string, ChannelContent>>({})
    const [selectedChannels, setSelectedChannels] = useState<string[]>([])
    const [selectedRightTab, setSelectedRightTab] = useState<ActionTabType | null>(null)
    const [activePreview, setActivePreview] = useState<string>("")
    const [activeAccordion, setActiveAccordion] = useState<string>("")
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [timeSlot, setTimeSlot] = useState<string>("")

    const { data, isPending } = useQuery({
        queryKey: ["channels"],
        queryFn: async () => {
            const res = await fetch("/api/channel");
            const data = await res.json();
            return data
        },
    });

    const channelsData = data?.channels
    const hasConnectedChannel = data?.connectedCount > 0

    const channels = useMemo(() => {
        if (isPending) {
            return []
        }
        return (channelsData || []).map((channel: any) => ({
            ...channel,
            icon: getChannelIcon(channel.type)
        })) as ChannelType[]
    }, [isPending, channelsData])

     useEffect(() => {
       if(selectedDate){
        setDate(selectedDate)
       }
    }, [selectedDate])

   
    useEffect(() => {
        if (channels.length > 0 && Object.keys(channelContent).length === 0) {
            const initialContent: Record<string, ChannelContent> = {}
            channels.forEach(channel => {
                initialContent[channel.id] = { text: "", images: [] }
            })
            setChannelContent(initialContent)
        }
    }, [channels])

    const connectedChannels = channels.filter(channel => channel.connected);
    const selectedChannelsList = channels.filter((channel) => selectedChannels.includes(channel.id))
    const previewChannel = channels.find((c) => c.id === activePreview) ?? null;
    const previewContent = channelContent?.[activePreview] ?? { text: "", images: [] }

    const createPostMutation = useMutation({
        mutationFn: async ({ posts, scheduledAt, status }:
            { posts: any[], scheduledAt: string, status?: PostStatus, immediate?: boolean }) => {
            const response = await fetch("/api/post", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    posts,
                    scheduledAt,
                    status
                })
            });
            if (!response.ok) {
                throw new Error("Failed to create posts");
            }
            return response.json();
        },
        onSuccess: (data, variables) => {
            const outcome = variables.status === POST_STATUS.DRAFT
                ? "saved to draft"
                : variables.immediate
                    ? "queued to publish now"
                    : "scheduled"
            toast.success(`${data.posts.length} post(s) ${outcome} successfully`);
            queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === "posts",
            });
            handleOpenChange(false)
        },
        onError: (error: any) => {
            console.log("failed to create post", error)
            toast.error("Failed to save post")
        }
    })

    const handleSelectRightTab = (tab: ActionTabType) => {
        setSelectedRightTab((prev) => (prev === tab ? null : tab));
    }

    const handleSelectAll = () => {
        setSelectedChannels((prev) => {
            if (prev.length === connectedChannels.length) {
                setActivePreview("")
                return []
            }

            setChannelContent((prev) => {
                const update = { ...prev }
                connectedChannels.forEach((channel) => {
                    if (!update[channel.id]?.text && globalContent.text) {
                        const limit = Number(channel.character_limit);

                        update[channel.id] = {
                            text: globalContent.text.slice(0, limit),
                            images: [...globalContent.images]
                        }
                    } else if (!update[channel.id]) {
                        update[channel.id] = { text: "", images: [] }
                    }
                })
                return update;
            })
            return connectedChannels.map(channel => channel.id)
        })
    }

    const handleGlobalContentChange = (text: string, images?: ImageObject[]) => {
        setGlobalContent((prev) => ({
            ...prev,
            text,
            images: images || prev.images
        }))
    }

    const handleAccordionChange = (value: string) => {
        setActiveAccordion(value)
        setActivePreview(value)
    }

    const handleTextChange = (
        channelId: string,
        text: string,
        character_limit: number
    ) => {
        const limit = Number(character_limit);
        if (text.length <= limit) {
            setChannelContent((prev) => ({
                ...prev,
                [channelId]: {
                    ...prev[channelId],
                    text
                }
            }))
        }
    }

    const toggleChannel = (channelId: string, character_limit: number) => {
        setSelectedChannels((prev) => {
            if (prev.includes(channelId) && activePreview === channelId) setActivePreview("")
            const isSelected = prev.includes(channelId);

            const newChannels = isSelected ? prev.filter((id) => id != channelId) : [...prev, channelId];

            if (!isSelected) {
                if (globalContent.text && !channelContent[channelId]?.text) {
                    const limit = Number(character_limit);
                    setChannelContent((prev) => ({
                        ...prev,
                        [channelId]: {
                            ...prev[channelId],
                            text: globalContent.text.slice(0, limit),
                            images: [...globalContent.images]
                        }
                    }))
                }
            } else {
                setChannelContent((prev) => ({
                    ...prev,
                    [channelId]: { text: "", images: [] }
                }))
            }
            return newChannels;
        })

        if (!selectedChannels.includes(channelId)) {
            setActiveAccordion(channelId)
            setActivePreview(channelId)
        }
    }

    const handleIdeaSelect = (idea: any) => {
        if (!hasConnectedChannel) {
            toast.error("Connect at least one channel to add idea")
            return
        }
        if (selectedChannels.length === 0) {
            setGlobalContent({
                text: idea.title + "\n\n" + idea.description,
                images: idea.images || []
            })
            return
        }
        setChannelContent((prev) => {
            return ({
                ...prev,
                [activeAccordion]: {
                    text: idea.title + "\n\n" + idea.description,
                    images: idea.images || []
                }
            })
        })
    }

    const handleCreatePost = (status?: PostStatus, immediate = false) => {
        if (selectedChannels.length === 0) {
            toast.error("Select at least one channel")
            return;
        }
        const postToCreate = selectedChannelsList.map((channel) => {
            const content = channelContent[channel.id] ?? { text: "", images: [] }
            return {
                channelTypeId: channel.id,
                content: content.text,
                images: content.images
            }
        })
        if (postToCreate.some((post) => !post.content)) {
            toast.error("Each selected channel must have content")
            return
        }

        if (immediate) {
            createPostMutation.mutate({
                posts: postToCreate,
                scheduledAt: new Date().toISOString(),
                status: POST_STATUS.QUEUE,
                immediate: true,
            })
            return
        }

        const parsedTime = parse(timeSlot, "h:mm a", new Date());
        const scheduleAt = set(date || new Date(), {
            hours: parsedTime.getHours(),
            minutes: parsedTime.getMinutes(),
            seconds: 0,
            milliseconds: 0
        })

        createPostMutation.mutate({
            posts: postToCreate,
            scheduledAt: scheduleAt.toISOString(),
            status
        })
    }


    const handleOpenChange = (open: boolean) => {
        onOpenChange(open);
        setGlobalContent({ text: "", images: [] });
        setChannelContent({});
        setActiveAccordion("")
        setActivePreview("")
        setSelectedRightTab(null)
        setDate(new Date())
        setTimeSlot("")
        setSelectedChannels([])
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className={cn(
                "flex max-h-[min(90vh,840px)] w-full flex-col gap-0 overflow-hidden p-0 sm:min-w-[min(640px,calc(100vw-2rem))] sm:max-w-[760px]",
                selectedRightTab && "sm:max-w-[950px]"
            )}>
                    <DialogHeader className="shrink-0 border-b border-border px-6 py-3 pr-12">
                        <div className="flex items-center justify-between gap-3">
                            <DialogTitle className="font-semibold">Create Post</DialogTitle>
                            <DialogDescription className="sr-only">
                              Write a post, pick channels, then post now, schedule it, or save a draft.
                            </DialogDescription>
                            <div className="flex items-center gap-px">
                                {rightTabs.map((tab) => (
                                    <Button
                                        key={tab.id}
                                        variant={selectedRightTab === tab.id ? "default" : "ghost"}
                                        className={cn(!selectedRightTab && "size-8")}
                                        onClick={() => handleSelectRightTab(tab.id)}
                                    >
                                        <tab.icon className="size-4" />
                                        <span className={cn("hidden sm:inline", !selectedRightTab && "sm:hidden")}> {tab.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </DialogHeader>


                    <div className="flex min-h-[min(480px,62vh)] w-full flex-1 flex-col overflow-hidden md:min-h-[min(520px,65vh)] md:flex-row">

                        {/* Left — channel list */}
                        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
                            <div className="channel--selector shrink-0 px-6 py-4">
                                {connectedChannels.length > 0 && !isPending && (
                                    <button
                                        className="mb-4 text-[13px] font-medium cursor-pointer"
                                        onClick={handleSelectAll}
                                    >
                                        {selectedChannels.length === connectedChannels.length ? "Unselect all" : "Select all"}
                                    </button>
                                )}
                                <div className="flex flex-wrap gap-4">
                                    {isPending ? (
                                        Array.from({ length: 6 }).map((_, index) => (
                                            <Skeleton key={index} className="size-[50px] rounded-xl" />
                                        ))
                                    ) : (
                                        channels?.map((channel) => {
                                            const selected = selectedChannels.includes(channel.id)
                                            const isConnected = channel.connected
                                            return (
                                                <Tooltip key={channel.id}>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            style={{ "--channel-color": channel.color } as React.CSSProperties}
                                                            className={cn(
                                                                "relative shrink-0 rounded-xl p-0.5 transition-all",
                                                                !isConnected ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:opacity-100",
                                                                selected
                                                                  ? "opacity-100 ring-2 ring-offset-2 ring-offset-popover ring-[var(--channel-color)]"
                                                                  : isConnected && "opacity-70 hover:ring-2 hover:ring-border"
                                                            )}
                                                            onClick={() => {
                                                                if (!isConnected) {
                                                                    toast.error("Please connect the channel first");
                                                                    return;
                                                                }

                                                                toggleChannel(
                                                                    channel.id,
                                                                    channel.character_limit
                                                                )
                                                            }}>

                                                            <ChannelAvatar
                                                                className=""
                                                                type={channel.type}
                                                                color={channel.color}
                                                                profileImage={channel.profile_image}
                                                                selected={selected}
                                                            />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Preview {channel.name}
                                                        {!isConnected && <span className="text-primary"> → Connect Channel</span>}
                                                    </TooltipContent>
                                                </Tooltip>
                                            )
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="channel--content relative flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-4">
                                {selectedChannels.length === 0 ? (
                                    <div className="rounded-xl border border-border p-4">
                                        <ContentTextarea
                                            value={globalContent?.text || ""}
                                            images={globalContent?.images || []}
                                            placeholder="Write your main content here. It will be copied to channels when you select them."
                                            minHeight={220}
                                            showAIAssistant={true}
                                            disabled={!hasConnectedChannel}
                                            contentClass="text-sm pt-0!"
                                            onChange={(text) => handleGlobalContentChange(text)}
                                            onImagesChange={(images) =>
                                                handleGlobalContentChange(globalContent.text, images)
                                            }
                                        />
                                    </div>
                                ) : (
                                    <Accordion
                                        type="single"
                                        collapsible
                                        value={activeAccordion}
                                        className="w-full space-y-3"
                                        onValueChange={(val) => {
                                            handleAccordionChange(val)
                                        }}
                                    >
                                        {selectedChannelsList?.map((channel) => {
                                            const content = channelContent[channel.id] || { text: "", images: [] };
                                            const isExpanded = activeAccordion === channel.id;
                                            const icon = getChannelIcon(channel.type);
                                            return (
                                                <AccordionItem
                                                    key={channel.id}
                                                    value={channel.id}
                                                    className="border rounded-xl"
                                                >
                                                    {!isExpanded && (
                                                        <AccordionTrigger
                                                            className="w-full px-3 cursor-pointer [&>svg]:hidden! hover:bg-muted
hover:no-underline! justify-start gap-3 
"
                                                        >
                                                            <span>
                                                                <HugeiconsIcon
                                                                    icon={icon}
                                                                    className={cn(
                                                                        "shrink-0 text-white! size-5! p-[3px] rounded-sm",
                                                                    )}
                                                                    style={{ background: channel.color }}
                                                                />
                                                            </span>
                                                            {content.text ? (
                                                                <p className="text-sm text-muted-foreground/80 
truncate flex-1 text-left max-w-[400px]">
                                                                    {content.text}
                                                                </p>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">What would you like to share</p>
                                                            )}
                                                        </AccordionTrigger>
                                                    )}

                                                    <AccordionContent className="overflow-visible">
                                                        <div className="flex pt-3 px-3 gap-3">
                                                            {isExpanded && (
                                                                <span>
                                                                    <HugeiconsIcon
                                                                        icon={icon}
                                                                        className={cn(
                                                                            "shrink-0 text-white! size-5! p-[3px] rounded-sm",
                                                                        )}
                                                                        style={{ background: channel.color }}
                                                                    />
                                                                </span>
                                                            )}

                                                            <div className="flex-1">
                                                                {!content?.text && (
                                                                    <div className="mb-2 flex w-full items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
                                                                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                                                        <p>Please include at least some text or an attachment.</p>
                                                                    </div>
                                                                )}

                                                                <ContentTextarea
                                                                    value={content?.text || ""}
                                                                    images={content?.images || []}
                                                                    placeholder="Start writing or get inspired by AI"
                                                                    minHeight={260}
                                                                    contentClass="text-sm pt-0"
                                                                    showAIAssistant={true}
                                                                    disabled={!channel.connected}
                                                                    onAIAssistantClick={() => {
                                                                        setSelectedRightTab("ai")
                                                                    }}
                                                                    onChange={(text) => handleTextChange(
                                                                        channel.id, text, channel.character_limit
                                                                    )}
                                                                    onImagesChange={(images) => {
                                                                        setChannelContent((prev) => (
                                                                            {
                                                                                ...prev,
                                                                                [channel.id]: {
                                                                                    ...content,
                                                                                    images,
                                                                                }
                                                                            }
                                                                        ))
                                                                    }}

                                                                    renderToolbarRight={
                                                                        <div className="flex items-center gap-3">
                                                                            <span className={cn(
                                                                                "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                                                                (content?.text?.length || 0) >= Number(channel.character_limit) * 0.9
                                                                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
                                                                                    : "bg-muted text-muted-foreground"
                                                                            )}>
                                                                                {content?.text?.length || 0} / {channel.character_limit}
                                                                            </span>
                                                                        </div>
                                                                    }

                                                                />
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            )
                                        })}
                                    </Accordion>
                                )}

                            </div>
                        </div>


                        {/* Right — channel preview */}
                        {selectedRightTab && (
                            <div className="flex max-h-[42vh] min-h-0 w-full shrink-0 flex-col overflow-y-auto border-t border-border bg-muted/30 md:h-full md:max-h-none md:w-[min(350px,42vw)] md:border-t-0 md:border-l">
                                <div className="flex h-full min-h-0 flex-1 flex-col py-4">
                                    {selectedRightTab === "ai" && (
                                        <div className="px-5">
                                            <AIAssistant 
                            content={channelContent[activeAccordion]?.text || 
                                globalContent?.text || ""
                            }
                            channelId={activeAccordion}
                            onGenerate={(content:any) => {
                                if(globalContent?.text){
                                    setGlobalContent((prev) => ({
                                        ...prev,
                                        text: content,
                                    }))
                                }
                                setChannelContent((prev) => ({
                                ...prev,
                                [activeAccordion]: {
                                    ...prev[activeAccordion],
                                    text: content,
                                }
                                }))
                            }}
                        />
                                        </div>
                                    )}

                                    {selectedRightTab === "ideas" && (
                                        <IdeasList
                                            onSelect={handleIdeaSelect}
                                        />
                                    )}

                                    {selectedRightTab === "preview" && (
                                        <PreviewPanel
                                            channel={previewChannel}
                                            content={previewContent}
                                        />
                                    )}
                                </div>
                            </div>

                        )}

                    </div>

                <DialogFooter className="mx-0 mb-0 mt-0 shrink-0 flex-row items-center justify-between sm:justify-between rounded-none border-t border-border bg-muted/40 px-6 py-3">
                    {hasConnectedChannel ? (
                        <div className="flex w-full items-center justify-between gap-2">
                            <Button
                                size="lg"
                                variant="outline"
                                disabled={createPostMutation.isPending}
                                onClick={() => handleOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                                size="lg"
                                variant="ghost"
                                disabled={createPostMutation.isPending}
                                onClick={() => handleCreatePost(POST_STATUS.DRAFT)}
                            >
                                {createPostMutation.isPending && createPostMutation.variables.status === POST_STATUS.DRAFT && <Spinner />}
                                Save Draft
                            </Button>
                            <Button
                                size="lg"
                                disabled={createPostMutation.isPending}
                                onClick={() => handleCreatePost(POST_STATUS.QUEUE, true)}
                            >
                                {createPostMutation.isPending && createPostMutation.variables.immediate && <Spinner />}
                                Post now
                            </Button>
                            <ButtonGroup className="p-0!">
                                <ScheduleDatePicker
                                    date={date}
                                    setDate={setDate}
                                    time={timeSlot}
                                    setTime={setTimeSlot}
                                    renderButton={(isDatePassed, isTimeNotAvailable) => <Button
                                        size="lg"
                                        className="border py-4.5 px-4"
                                        disabled={createPostMutation.isPending || !date || !timeSlot || isDatePassed || isTimeNotAvailable}
                                        onClick={() => {
                                            if (isDatePassed || isTimeNotAvailable) {
                                                toast.error("Please select a valid date and time")
                                                return;
                                            }
                                            handleCreatePost()
                                        }}
                                    >
                                        {createPostMutation.isPending && !createPostMutation.variables.immediate && createPostMutation.variables.status === undefined && <Spinner />}
                                        Schedule Post
                                    </Button>}

                                />
                            </ButtonGroup>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Button size="lg" variant="outline" onClick={() => handleOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button size="lg" asChild>
                                <Link href="/settings">Connect Channel to Post</Link>
                            </Button>
                        </>
                    )}
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}

export default CreatePostDialog
