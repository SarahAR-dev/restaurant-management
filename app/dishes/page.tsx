"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, UtensilsCrossed, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: "entree" | "plat" | "dessert"
  imageUrl?: string
  available: boolean
  reviews?: string[]
   preparationTime?: number
}

export default function DishesPage() {
  const [dishes, setDishes] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dishToDelete, setDishToDelete] = useState<MenuItem | null>(null)
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState<{
  name: string
  description: string
  price: string
  category: "entree" | "plat" | "dessert"
  imageUrl: string
  available: boolean
  preparationTime: string
}>({
  name: "",
  description: "",
  price: "",
  category: "plat",
  imageUrl: "",
  available: true,
  preparationTime: "",
})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
   
  useEffect(() => {
    loadDishes()
  }, [])

  const loadDishes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dishes")
      if (!response.ok) throw new Error("Erreur lors du chargement des plats")
      const data = await response.json()
      setDishes(data)
    } catch (error) {
      console.error("Erreur:", error)
      alert("Impossible de charger les plats")
    } finally {
      setLoading(false)
    }
  }

  const filteredDishes = dishes.filter(
    (dish) =>
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) {
      return
    }

    const dishData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      imageUrl: formData.imageUrl,
      available: formData.available,
      preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : 15,
    }

    setIsSubmitting(true)

    try {
      if (editingDish) {
        const response = await fetch(`/api/dishes`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingDish.id, ...dishData }),
        })
        if (!response.ok) {
          setIsSubmitting(false)
          throw new Error("Erreur lors de la mise à jour")
        }
      } else {
        const response = await fetch("/api/dishes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dishData),
        })
        if (!response.ok) {
          setIsSubmitting(false)
          throw new Error("Erreur lors de la création")
        }
      }
      
      await loadDishes()
      
      setIsDialogOpen(false)
      setEditingDish(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "plat",
        imageUrl: "",
        available: true,
        preparationTime: "",
      })
      alert(editingDish ? "✅ Plat modifié avec succès !" : "✅ Plat créé avec succès !")
    } catch (error) {
      console.error("Erreur:", error)
      alert("❌ Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (dish: MenuItem) => {
    setEditingDish(dish)
    setFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      category: dish.category,
      imageUrl: dish.imageUrl || "",
      available: dish.available,
      preparationTime: dish.preparationTime?.toString() || "15",
    })
    setIsDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!dishToDelete) return
    
    try {
      const response = await fetch("/api/dishes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dishToDelete.id }),
      })
      
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }
      
      await loadDishes()
      setDeleteDialogOpen(false)
      setDishToDelete(null)
      alert("✅ Plat supprimé avec succès!")
    } catch (error) {
      console.error("Erreur:", error)
      alert("❌ Impossible de supprimer le plat")
    }
  }

  const toggleAvailability = async (dish: MenuItem) => {
    try {
      const response = await fetch("/api/dishes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: dish.id,
          name: dish.name,
          description: dish.description,
          price: dish.price,
          category: dish.category,
          imageUrl: dish.imageUrl,
          available: !dish.available 
        }),
      })
      if (!response.ok) throw new Error("Erreur lors de la mise à jour")
      await loadDishes()
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const adjustPreparationTime = async (dish: MenuItem, adjustment: number) => {
  const newTime = (dish.preparationTime || 15) + adjustment
  
  if (newTime < 5) {
    alert("⚠️ Le temps minimum est de 5 minutes")
    return
  }
  
  if (newTime > 120) {
    alert("⚠️ Le temps maximum est de 120 minutes")
    return
  }
  
  try {
    const response = await fetch("/api/dishes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        id: dish.id,
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category: dish.category,
        imageUrl: dish.imageUrl,
        available: dish.available,
        preparationTime: newTime
      }),
    })
    
    if (!response.ok) throw new Error("Erreur lors de la mise à jour")
    
    await loadDishes()
  } catch (error) {
    console.error("Erreur:", error)
    alert("❌ Impossible d'ajuster le temps")
  }
}

  const handleDialogClose = () => {
  setIsDialogOpen(false)
  setEditingDish(null)
  setFormData({
    name: "",
    description: "",
    price: "",
    category: "plat",
    imageUrl: "",
    available: true,
    preparationTime: "",
  })
}

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-center text-muted-foreground">Chargement des plats...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des plats</h1>
          <p className="text-muted-foreground">Gérez votre carte de plats</p>
        </div>
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            if (!isSubmitting) {
              setIsDialogOpen(open)
              if (!open) {
                handleDialogClose()
              }
            }
          }}
        >
          <DialogTrigger >
            <Button onClick={() => setEditingDish(null)} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un plat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingDish ? "Modifier le plat" : "Nouveau plat"}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations du plat
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
                  <div className="grid gap-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: MenuItem["category"]) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entree">Entrée</SelectItem>
                        <SelectItem value="plat">Plat</SelectItem>
                        <SelectItem value="dessert">Dessert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
  <Label htmlFor="preparationTime">Temps de préparation (minutes)</Label>
  <Input
    id="preparationTime"
    type="number"
    min="1"
    value={formData.preparationTime}
    onChange={(e) =>
      setFormData({ ...formData, preparationTime: e.target.value })
    }
    placeholder="15"
    required
  />
  <p className="text-xs text-muted-foreground">
    Temps estimé de préparation en minutes
  </p>
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
                    placeholder="/images/dishes/nom-du-plat.jpg"
                  />
                </div>
                {/*<div className="grid gap-2">
                  <Label htmlFor="available">Disponibilité</Label>
                  <Select
                    value={formData.available ? "true" : "false"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, available: value === "true" })
                    }
                  >
                    <SelectTrigger id="available">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Disponible</SelectItem>
                      <SelectItem value="false">Indisponible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>*/}
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDialogClose}
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
                      {editingDish ? "Modification..." : "Création..."}
                    </>
                  ) : (
                    editingDish ? "Mettre à jour" : "Créer"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un plat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            onClick={() => router.push(`/dishes/${dish.id}`)}
  className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="relative h-48 bg-muted overflow-hidden">
              <img
                src={dish.imageUrl || "/placeholder.svg"}
                alt={dish.name}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              {/* Bouton supprimer - SUBTIL - juste l'icône */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDishToDelete(dish)
                  setDeleteDialogOpen(true)
                }}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-red-600 text-white transition-colors"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{dish.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {dish.description}
                </p>
              </div>

              <div className="flex items-center justify-between">
  <div className="flex flex-col gap-1">
    <span className="text-xl font-bold text-primary">
      {dish.price.toFixed(2)} DA
    </span>
    
    {/* Boutons +/- pour ajuster le temps */}
    <div className="flex items-center gap-2 bg-muted px-2 py-1 rounded-md">
      <button
        onClick={(e) => {
          e.stopPropagation()
          adjustPreparationTime(dish, -5)
        }}
        className="text-base font-bold hover:bg-background px-2 rounded transition-colors"
        title="Réduire de 5 minutes"
      >
        −
      </button>
      
      <span className="text-sm font-medium min-w-[60px] text-center">
        ⏱️ {dish.preparationTime || 15} min
      </span>
      
      <button
        onClick={(e) => {
          e.stopPropagation()
          adjustPreparationTime(dish, 5)
        }}
        className="text-base font-bold hover:bg-background px-2 rounded transition-colors"
        title="Ajouter 5 minutes"
      >
        +
      </button>
    </div>
  </div>
  
  <span className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
    <UtensilsCrossed className="h-4 w-4" />
    {dish.category === "entree" ? "Entrée" : dish.category === "plat" ? "Plat" : "Dessert"}
  </span>
</div>

              {/* Boutons Modifier et Disponibilité */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(dish)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Modifier
                </Button>
                
                {/* Bouton de disponibilité - COLORÉ et VISIBLE */}
                <Button
                  size="sm"
                  className={`flex-1 gap-2 font-semibold ${
                    dish.available
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-700"
                      : "bg-red-600 hover:bg-red-700 text-white border-red-700"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleAvailability(dish)
                  }}
                >
                  {dish.available ? "Disponible" : "Indisponible"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <div className="text-center py-12">
          <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? "Aucun plat trouvé" : "Aucun plat pour le moment"}
          </p>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{dishToDelete?.name}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false)
                setDishToDelete(null)
              }}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}