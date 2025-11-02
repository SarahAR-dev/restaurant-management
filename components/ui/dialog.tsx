"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined)

function useDialog() {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("useDialog must be used within a Dialog")
  }
  return context
}

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(open)
  const isControlled = onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setOpen = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  return <DialogContext.Provider value={{ open: isOpen, setOpen }}>{children}</DialogContext.Provider>
}

interface DialogTriggerProps {
  children: React.ReactElement<any>
}

function DialogTrigger({ children }: DialogTriggerProps) {
  const { setOpen } = useDialog()
  
  return React.cloneElement(children, {
    onClick: () => {
      setOpen(true)
      if (typeof children.props?.onClick === 'function') {
        children.props.onClick()
      }
    }
  } as any)
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function DialogContent({ children, className, ...props }: DialogContentProps) {
  const { open, setOpen } = useDialog()

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)} />
      <div
        className={cn(
          "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-6 shadow-lg",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

function DialogClose({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDialog()
  return (
    <button
      onClick={() => setOpen(false)}
      className={cn("text-muted-foreground hover:text-foreground", className)}
      {...props}
    >
      ✕
    </button>
  )
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose }