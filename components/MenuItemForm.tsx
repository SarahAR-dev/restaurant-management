"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface MenuItemFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  editingItem: any | null
  itemType: "dish" | "drink" | "side"
  categories?: { value: string; label: string }[]
}

export function MenuItemForm({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  itemType,
  categories = []
}: MenuItemFormProps) {
  const [formData, setFormData] = useState({
    name: editingItem?.name || "",
    description: editingItem?.description || "",
    price: editingItem?.price?.toString() || "",
    category: editingItem?.category || (categories[0]?.value || ""),
    imageUrl: editingItem?.imageUrl || "",
    available: editingItem?.available ?? true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when editingItem changes
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || "",
        description: editingItem.description || "",
        price: editingItem.price?.toString() || "",
        category: editingItem.category || (categories[0]?.value || ""),
        imageUrl: editingItem.imageUrl || "",
        available: editingItem.available ?? true,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: categories[0]?.value || "",
        imageUrl: "",
        available: true,
      })
    }
  }, [editingItem, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return

    // Validation
    if (!formData.name.trim()) {
      alert("❌ Le nom est obligatoire")
      return
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("❌ Le prix doit être supérieur à 0")
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl,
        available: formData.available,
      })
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        category: categories[0]?.value || "",
        imageUrl: "",
        available: true,
      })
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const itemTypeLabels = {
    dish: { single: "plat", plural: "plats" },
    drink: { single: "boisson", plural: "boissons" },
    side: { single: "accompagnement", plural: "accompagnements" },
  }

  const labels = itemTypeLabels[itemType]

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!isSubmitting && !open) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Modifier ${labels.single}` : `Nouveau ${labels.single}`}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de {labels.single}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Prix (DA)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              
              {categories.length > 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">URL de l'image</Label>
              <Input
                id="imageUrl"
                type="text"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder={`/images/${itemType}s/nom-${labels.single}.jpg`}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {editingItem ? "Modification..." : "Création..."}
                </>
              ) : (
                editingItem ? "Mettre à jour" : "Créer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}