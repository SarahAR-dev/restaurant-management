"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AddDishModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (dish: {
    name: string
    description: string
    price: number
    category: string
    image: string
  }) => void
}

export function AddDishModal({ isOpen, onClose, onAdd }: AddDishModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Plats",
    image: "/placeholder.svg",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.description && formData.price) {
      onAdd({
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        image: formData.image,
      })
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "Plats",
        image: "/placeholder.svg",
      })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un plat</DialogTitle>
          <DialogDescription>Remplissez les informations du nouveau plat</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du plat</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ex: Burger Classique"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Ex: Burger avec fromage, laitue et tomate"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Prix</Label>
            <Input
              id="price"
              type="number"
              placeholder="Ex: 12.99"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option>Plats</option>
              <option>Boissons</option>
              <option>Accompagnements</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              Ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
