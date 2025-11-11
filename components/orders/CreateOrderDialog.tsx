"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CreateOrderDialogProps {
  onOrderCreated: () => void
}

export function CreateOrderDialog({ onOrderCreated }: CreateOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger >
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle commande
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        {/* Pour l'instant on garde votre formulaire dans page.tsx */}
        <p>Formulaire de création (on va le déplacer ici après)</p>
      </DialogContent>
    </Dialog>
  )
}