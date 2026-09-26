"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import type { AuthField } from "@/lib/composio/types"

type ApiKeyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
  name: string
  authGuideUrl?: string | null
  fields: AuthField[]
  pending?: boolean
  onSubmit: (secrets: Record<string, string>) => void
}

export function ApiKeyDialog({
  open,
  onOpenChange,
  name,
  authGuideUrl,
  fields,
  pending,
  onSubmit,
}: ApiKeyDialogProps) {
  const [values, setValues] = useState<Record<string, string>>({})

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect {name}</DialogTitle>
          <DialogDescription>
            Enter the credentials for this app. Skein never stores the raw key.
            {authGuideUrl ? (
              <>
                {" "}
                <a href={authGuideUrl} target="_blank" rel="noreferrer">
                  Auth guide
                </a>
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit(values)
          }}
        >
          {(fields.length ? fields : [{
            name: "api_key",
            displayName: "API key",
            description: "",
            type: "password",
            required: true,
          }]).map((field) => (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={field.name}>{field.displayName}</Label>
              <Input
                id={field.name}
                type={field.type === "string" ? "text" : field.type || "password"}
                required={field.required}
                autoComplete="off"
                value={values[field.name] || ""}
                onChange={(event) =>
                  setValues((current) => ({ ...current, [field.name]: event.target.value }))
                }
              />
              {field.description ? (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              ) : null}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner className="size-4" /> : null}
              Connect
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
