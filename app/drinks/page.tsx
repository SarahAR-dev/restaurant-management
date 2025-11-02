"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Wine, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface Drink {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  available: boolean
}

export default function DrinksPage() {
  const [drinks, setDrinks] = useState<Drink[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    available: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Charger les boissons depuis l'API
  useEffect(() => {
    loadDrinks()
  }, [])

  const loadDrinks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/drinks")
      if (!response.ok) throw new Error("Erreur lors du chargement des boissons")
      const data = await response.json()
      setDrinks(data)
    } catch (error) {
      console.error("Erreur:", error)
      alert("Impossible de charger les boissons")
    } finally {
      setLoading(false)
    }
  }

  const filteredDrinks = drinks.filter(
    (drink) =>
      drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drink.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Empêcher les soumissions multiples
  if (isSubmitting) {
    return
  }

  const drinkData = {
    name: formData.name,
    description: formData.description,
    price: parseFloat(formData.price),
    imageUrl: formData.imageUrl,
    available: formData.available,
  }

  // BLOQUER LE BOUTON
  setIsSubmitting(true)

  try {
    if (editingDrink) {
      // Mise à jour
      const response = await fetch(`/api/drinks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingDrink.id, ...drinkData }),
      })
      if (!response.ok) {
        setIsSubmitting(false)
        throw new Error("Erreur lors de la mise à jour")
      }
    } else {
      // Création
      const response = await fetch("/api/drinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(drinkData),
      })
      if (!response.ok) {
        setIsSubmitting(false)
        throw new Error("Erreur lors de la création")
      }
    }
    
    // Recharger les données
    await loadDrinks()
    
    // Réinitialiser le formulaire
    setIsDialogOpen(false)
    setEditingDrink(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      available: true,
    })
    alert(editingDrink ? "✅ Boisson modifiée avec succès !" : "✅ Boisson créée avec succès !")
  } catch (error) {
    console.error("Erreur:", error)
    alert("❌ Une erreur est survenue")
  } finally {
    // DÉBLOQUER LE BOUTON
    setIsSubmitting(false)
  }
}

  const handleEdit = (drink: Drink) => {
    setEditingDrink(drink)
    setFormData({
      name: drink.name,
      description: drink.description,
      price: drink.price.toString(),
      imageUrl: drink.imageUrl || "",
      available: drink.available,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette boisson ?")) return

    try {
      const response = await fetch("/api/drinks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      await loadDrinks()
    } catch (error) {
      console.error("Erreur:", error)
      alert("Impossible de supprimer la boisson")
    }
  }

  const toggleAvailability = async (drink: Drink) => {
    try {
      const response = await fetch("/api/drinks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: drink.id,
          name: drink.name,
          description: drink.description,
          price: drink.price,
          imageUrl: drink.imageUrl,
          available: !drink.available 
        }),
      })
      if (!response.ok) throw new Error("Erreur lors de la mise à jour")
      await loadDrinks()
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingDrink(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      available: true,
    })
  }

  const stats = {
    total: drinks.length,
    available: drinks.filter((d) => d.available).length,
    unavailable: drinks.filter((d) => !d.available).length,
    avgPrice: drinks.length > 0 
      ? (drinks.reduce((sum, d) => sum + d.price, 0) / drinks.length).toFixed(2)
      : "0.00",
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-center text-muted-foreground">Chargement des boissons...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des boissons</h1>
          <p className="text-muted-foreground">Gérez votre menu de boissons</p>
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
            <Button onClick={() => setEditingDrink(null)} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une boisson
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingDrink ? "Modifier la boisson" : "Nouvelle boisson"}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations de la boisson
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
                  <Label htmlFor="imageUrl">URL de l'image</Label>
                  <Input
                    id="imageUrl"
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="/images/drinks/nom-boisson.jpg"
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
        {editingDrink ? "Modification en cours..." : "Création en cours..."}
      </>
    ) : (
      editingDrink ? "Mettre à jour" : "Créer"
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
          placeholder="Rechercher une boisson..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grille de boissons */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDrinks.map((drink) => (
          <div
  key={drink.id}
  className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
  onClick={() => router.push(`/drinks/${drink.id}`)}
>
            {/* Image */}
            <div className="relative h-48 bg-muted overflow-hidden">
              <img
                src={drink.imageUrl || "/placeholder.svg"}
                alt={drink.name}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => toggleAvailability(drink)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    drink.available
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  }`}
                >
                  {drink.available ? "Disponible" : "Indisponible"}
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{drink.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {drink.description}
                </p>
              </div>

              {/* Prix et catégorie */}
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  {drink.price.toFixed(2)} DA
                </span>
                <span className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                  <Wine className="h-4 w-4" />
                  Boissons
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
    handleEdit(drink)
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
    handleDelete(drink.id)
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

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Disponibles</p>
          <p className="text-2xl font-bold text-green-600">{stats.available}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Indisponibles</p>
          <p className="text-2xl font-bold text-red-600">{stats.unavailable}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Prix moyen</p>
          <p className="text-2xl font-bold">{stats.avgPrice} DA</p>
        </div>
      </div>
    </div>
  )
}