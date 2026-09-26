"use client"
import * as React from "react"
import { parse, set } from "date-fns"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
    Wand2,
    ScanEye,
    Lightbulb,
} from "lucide-react"
import { ScheduleDatePicker } from "./schedule-date-picker"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChannelType } from "@/types/channel.type"
import { ButtonGroup } from "../ui/button-group"
import { Spinner } from "../ui/spinner"
import { ImageObject } from "@/types/post.type"
import { POST_STATUS, PostStatus } from "@/constants/post"
import { getChannelIcon } from "@/constants/channels"
import ContentTextarea from "../content-textarea"
import IdeasList from "./ideas-list"
import PreviewPanel from "./preview"
import { AIAssistant } from "./ai-assitant"

interface EditPostDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    post: {
        id: string
        content: string
        images: ImageObject[]
        userChannelId: string
        scheduledDate: string
        channel?: ChannelType | null
    } | null
}

type ActionTabType = "ideas" | "ai" | "preview"

const rightTabs = [
    { id: "ideas" as ActionTabType, label: "Ideas", icon: Lightbulb },
    { id: "ai" as ActionTabType, label: "AI Assistant", icon: Wand2 },
    { id: "preview" as ActionTabType, label: "Preview", icon: ScanEye },
]

export function EditPostDialog({
    open,
    onOpenChange,
    post
}: EditPostDialogProps) {


    const queryClient = useQueryClient();

    const updatePostMutation = useMutation({
        mutationFn: async ({ postId, content, images, scheduledAt, status }: {
            postId: string,
            content: string,
            images: ImageObject[],
            scheduledAt: string,
            status?: PostStatus,
            userChannelId: string
        }) => {
            const response = await fetch(`/api/post/${postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content,
                    images,
                    scheduledAt,
                    status
                })
            });
            if (!response.ok) throw new Error("Failed to update post");
            return response.json();
        },
        onSuccess: (data, variables) => {
            toast.success(`Post ${variables.status === POST_STATUS.DRAFT ? "saved to drafts" : "rescheduled"} successfully!`);
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            onOpenChange(false);
        },
        onError: (error: any) => {
            console.error("Update error:", error);
            toast.error(error.message);
        }
    });

    const [content, setContent] = React.useState("")
    const [images, setImages] = React.useState<ImageObject[]>([])
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [time, setTime] = React.useState<string>("")
    const [selectedRightTab, setSeletedRightTab] = React.useState<ActionTabType | null>(null)

    // Sync state when post changes
        React.useEffect(() => {
            if (post) {
                setContent(post.content)
                setImages(post.images ?? [])
                const date = new Date(post.scheduledDate)
                setDate(date)
                // Extract time from scheduledDate
                const hours = date.getHours()
                const minutes = date.getMinutes()
                const ampm = hours >= 12 ? "PM" : "AM"
                const h = hours % 12 || 12
                const m = minutes.toString().padStart(2, "0")
                setTime(`${h}:${m} ${ampm}`)
            }
        }, [post])

    const channel = post?.channel
    const icon = channel ? getChannelIcon(channel.type) : null

    const handleUpdate = (status?: PostStatus) => {
        if (!post) return
        const parsedTime = parse(time, "h:mm a", new Date())
        const finalDate = set(date || new Date(), {
            hours: parsedTime.getHours(),
            minutes: parsedTime.getMinutes(),
            seconds: 0,
            milliseconds: 0
        })

        updatePostMutation.mutate({
            postId: post.id,
            content,
            images,
            scheduledAt: finalDate.toISOString(),
            status: status,
            userChannelId: post.userChannelId
        });
    }

    const handleAddIdea = (idea: any) => {
        setContent(idea.description || "")
        setImages(idea.images || [])
    }

    const handleSelectRightTab = (tab: ActionTabType) => {
        setSeletedRightTab((prev) => (prev === tab ? null : tab))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
              "flex max-h-[min(90vh,840px)] w-full flex-col gap-0 overflow-hidden p-0 sm:min-w-[min(640px,calc(100vw-2rem))] sm:max-w-[760px]",
                selectedRightTab && "sm:max-w-[950px]"
            )}>
                    <DialogHeader className="shrink-0 border-b border-border px-6 py-3 pr-12">
                        <div className="flex items-center justify-between gap-3">
                            <DialogTitle className="text-lg font-semibold">Edit Post</DialogTitle>
                            <DialogDescription className="sr-only">
                              Update this scheduled post and save your changes.
                            </DialogDescription>
                            <div className="flex items-center gap-px">
                                {rightTabs.map((tab) => (
                                    <Button
                                        key={tab.id}
                                        variant={selectedRightTab === tab.id ? "default" : "ghost"}
                                        className={cn(!selectedRightTab && "size-8")}
                                        onClick={() => handleSelectRightTab(tab.id)}
                                    >
                                        <tab.icon className="h-4 w-4" />
                                        <span className={cn("hidden sm:inline", !selectedRightTab && "sm:hidden")}>{tab.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex min-h-[min(480px,62vh)] w-full flex-1 flex-col overflow-hidden md:flex-row">

                        <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto px-6 py-4">
                            <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-background p-4 shadow-sm">
                                <div className="relative flex-1">
                                        {icon && (
                                            <div className="absolute top-0 left-0">
                                                <HugeiconsIcon
                                                    icon={icon}
                                                    style={{ background: channel?.color }}
                                                    className="size-5 text-white! p-1 rounded-sm"
                                                />
                                            </div>
                                        )}
                                        <div className={cn(icon && "pl-8")}>
                                            <ContentTextarea
                                                value={content}
                                                images={images}
                                                placeholder="Start writing or get inspired by AI..."
                                                minHeight={240}
                                                contentClass="text-[15px] pt-0!"
                                                showAIAssistant={true}
                                                onAIAssistantClick={() => handleSelectRightTab("ai")}
                                                onChange={setContent}
                                                onImagesChange={setImages}
                                                renderToolbarRight={
                                                    <div className="flex items-center gap-3">
                                                        <span className={cn(
                                                            "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                                            channel && content.length >= Number(channel.character_limit) * 0.9
                                                                ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
                                                                : "bg-muted text-muted-foreground"
                                                        )}>
                                                            {content.length} / {channel?.character_limit || 280}
                                                        </span>
                                                    </div>
                                                }
                                            />
                                        </div>
                                </div>
                            </div>
                        </div>

                        {selectedRightTab && (
                            <aside className="flex max-h-[42vh] w-full shrink-0 flex-col overflow-y-auto border-t border-border bg-muted/30 md:h-full md:max-h-none md:w-[min(350px,42vw)] md:border-t-0 md:border-l">
                                <div className="flex h-full min-h-0 flex-1 flex-col py-4">
                                    {selectedRightTab === "ai" && (
                                        <div className="px-5">
                                            <AIAssistant
                                                content={content}
                                                channelId={post?.channel?.id}
                                                onGenerate={(generatedText) => {
                                                    setContent(generatedText)
                                                }}
                                            />
                                        </div>
                                    )}
                                    {selectedRightTab === "ideas" && (
                                        <IdeasList
                                            onSelect={handleAddIdea}
                                        />
                                    )}

                                    {selectedRightTab === "preview" && (
                                        <PreviewPanel
                                            channel={channel || null}
                                            content={{ text: content, images }}
                                        />
                                    )}
                                </div>
                            </aside>
                        )}
                    </div>

                <DialogFooter className="mx-0 mb-0 mt-0 shrink-0 flex-row items-center justify-between sm:justify-between rounded-none border-t border-border bg-muted/40 px-6 py-3">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => onOpenChange(false)}
                        disabled={updatePostMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => handleUpdate(POST_STATUS.DRAFT)}
                            disabled={updatePostMutation.isPending}
                        >
                            {updatePostMutation.isPending && updatePostMutation.variables?.status === POST_STATUS.DRAFT && <Spinner />}
                            Save Draft
                        </Button>
                        <ButtonGroup className="p-0!">
                            <ScheduleDatePicker
                                date={date} setDate={setDate} time={time} setTime={setTime}
                                renderButton={(isDatePassed, isTimeNotAvailable) => <Button
                                    size="lg"
                                    className="border py-4.5 px-4"
                                    onClick={() => {
                                        if (isDatePassed || isTimeNotAvailable) {
                                            toast.error("Please select a valid time")
                                            return;
                                        }
                                        handleUpdate()
                                    }}
                                    disabled={updatePostMutation.isPending || !date || !time || isTimeNotAvailable || isDatePassed}
                                >
                                    {updatePostMutation.isPending && updatePostMutation.variables?.status === undefined && <Spinner />}
                                    Schedule Post
                                </Button>}
                            />
                        </ButtonGroup>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
