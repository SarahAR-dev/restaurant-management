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

// Interface locale au lieu d'importer MenuItem
interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: "entree" | "plat" | "dessert"
  imageUrl?: string
  available: boolean
  reviews?: string[]
}

export default function DishesPage() {
  const [dishes, setDishes] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "plat" as MenuItem["category"],
    imageUrl: "",
    available: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
   
  // Charger les plats depuis l'API
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
    
    // Empêcher les soumissions multiples
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
    }

    // BLOQUER LE BOUTON
    setIsSubmitting(true)

    try {
      if (editingDish) {
        // Mise à jour
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
        // Création
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
      
      // Recharger les données
      await loadDishes()
      
      // Réinitialiser le formulaire
      setIsDialogOpen(false)
      setEditingDish(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "plat",
        imageUrl: "",
        available: true,
      })
      alert(editingDish ? "✅ Plat modifié avec succès !" : "✅ Plat créé avec succès !")
    } catch (error) {
      console.error("Erreur:", error)
      alert("❌ Une erreur est survenue")
    } finally {
      // DÉBLOQUER LE BOUTON
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
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    console.log("🗑️ Tentative de suppression du plat ID:", id)
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce plat ?")) {
      console.log("❌ Suppression annulée par l'utilisateur")
      return
    }

    try {
      console.log("📤 Envoi de la requête DELETE...")
      const response = await fetch("/api/dishes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      
      console.log("📥 Réponse reçue:", response.status, response.ok)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Erreur API:", errorData)
        throw new Error("Erreur lors de la suppression")
      }
      
      const result = await response.json()
      console.log("✅ Réponse de l'API:", result)
      
      console.log("🔄 Rechargement des plats...")
      await loadDishes()
      
      console.log("✅ Plat supprimé avec succès!")
    } catch (error) {
      console.error("💥 Erreur complète:", error)
      alert("Impossible de supprimer le plat")
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
    })
  }

  const stats = {
    total: dishes.length,
    available: dishes.filter((d) => d.available).length,
    unavailable: dishes.filter((d) => !d.available).length,
    avgPrice: dishes.length > 0 
      ? (dishes.reduce((sum, d) => sum + d.price, 0) / dishes.length).toFixed(2)
      : "0.00",
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
      {/* Header */}
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
          <DialogTrigger>
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
                <div className="grid gap-2">
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
                </div>
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
                      {editingDish ? "Modification en cours..." : "Création en cours..."}
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un plat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grille de plats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/dishes/${dish.id}`)}
          >
            {/* Image */}
            <div className="relative h-48 bg-muted overflow-hidden ">
              <img
                src={dish.imageUrl || "/placeholder.svg"}
                alt={dish.name}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleAvailability(dish)
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    dish.available
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  }`}
                >
                  {dish.available ? "Disponible" : "Indisponible"}
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{dish.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {dish.description}
                </p>
              </div>

              {/* Prix et catégorie */}
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  {dish.price.toFixed(2)} DA
                </span>
                <span className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                  <UtensilsCrossed className="h-4 w-4" />
                  {dish.category === "entree" ? "Entrée" : dish.category === "plat" ? "Plat" : "Dessert"}
                </span>
              </div>

              {/* Boutons Modifier et Supprimer */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(dish)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(dish.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucun plat */}
      {filteredDishes.length === 0 && (
        <div className="text-center py-12">
          <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? "Aucun plat trouvé" : "Aucun plat pour le moment"}
          </p>
        </div>
      )}
    </div>
  )
}