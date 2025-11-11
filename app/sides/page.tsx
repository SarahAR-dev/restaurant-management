"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Leaf, Search } from "lucide-react"
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

interface Side {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  available: boolean
  reviews?: string[]
}

export default function SidesPage() {
  const [sides, setSides] = useState<Side[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sideToDelete, setSideToDelete] = useState<Side | null>(null)
  const [editingSide, setEditingSide] = useState<Side | null>(null)
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

  useEffect(() => {
    loadSides()
  }, [])

  const loadSides = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/sides")
      if (!response.ok) throw new Error("Erreur lors du chargement des accompagnements")
      const data = await response.json()
      setSides(data)
    } catch (error) {
      console.error("Erreur:", error)
      alert("Impossible de charger les accompagnements")
    } finally {
      setLoading(false)
    }
  }

  const filteredSides = sides.filter(
    (side) =>
      side.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      side.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) {
      return
    }

    const sideData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      imageUrl: formData.imageUrl,
      available: formData.available,
    }

    setIsSubmitting(true)

    try {
      if (editingSide) {
        const response = await fetch(`/api/sides`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSide.id, ...sideData }),
        })
        if (!response.ok) {
          setIsSubmitting(false)
          throw new Error("Erreur lors de la mise à jour")
        }
      } else {
        const response = await fetch("/api/sides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sideData),
        })
        if (!response.ok) {
          setIsSubmitting(false)
          throw new Error("Erreur lors de la création")
        }
      }
      
      await loadSides()
      
      setIsDialogOpen(false)
      setEditingSide(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        available: true,
      })
      alert(editingSide ? "✅ Accompagnement modifié avec succès !" : "✅ Accompagnement créé avec succès !")
    } catch (error) {
      console.error("Erreur:", error)
      alert("❌ Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (side: Side) => {
    setEditingSide(side)
    setFormData({
      name: side.name,
      description: side.description,
      price: side.price.toString(),
      imageUrl: side.imageUrl || "",
      available: side.available,
    })
    setIsDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!sideToDelete) return
    
    try {
      const response = await fetch("/api/sides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sideToDelete.id }),
      })
      
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }
      
      await loadSides()
      setDeleteDialogOpen(false)
      setSideToDelete(null)
      alert("✅ Accompagnement supprimé avec succès!")
    } catch (error) {
      console.error("Erreur:", error)
      alert("❌ Impossible de supprimer l'accompagnement")
    }
  }

  const toggleAvailability = async (side: Side) => {
    try {
      const response = await fetch("/api/sides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: side.id,
          name: side.name,
          description: side.description,
          price: side.price,
          imageUrl: side.imageUrl,
          available: !side.available 
        }),
      })
      if (!response.ok) throw new Error("Erreur lors de la mise à jour")
      await loadSides()
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingSide(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      available: true,
    })
  }

  const stats = {
    total: sides.length,
    available: sides.filter((s) => s.available).length,
    unavailable: sides.filter((s) => !s.available).length,
    avgPrice: sides.length > 0 
      ? (sides.reduce((sum, s) => sum + s.price, 0) / sides.length).toFixed(2)
      : "0.00",
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-center text-muted-foreground">Chargement des accompagnements...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des accompagnements</h1>
          <p className="text-muted-foreground">Gérez vos accompagnements</p>
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
            <Button onClick={() => setEditingSide(null)} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un accompagnement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSide ? "Modifier l'accompagnement" : "Nouvel accompagnement"}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations de l'accompagnement
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
                    placeholder="/images/sides/nom-accompagnement.jpg"
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
                      {editingSide ? "Modification..." : "Création..."}
                    </>
                  ) : (
                    editingSide ? "Mettre à jour" : "Créer"
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
          placeholder="Rechercher un accompagnement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grille d'accompagnements */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSides.map((side) => (
          <div
            key={side.id}
            className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <div className="relative h-48 bg-muted overflow-hidden">
              <img
                src={side.imageUrl || "/placeholder.svg"}
                alt={side.name}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              {/* Bouton supprimer - SUBTIL - juste l'icône */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSideToDelete(side)
                  setDeleteDialogOpen(true)
                }}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-red-600 text-white transition-colors"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{side.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {side.description}
                </p>
              </div>

              {/* Prix */}
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  {side.price.toFixed(2)} DA
                </span>
                <span className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                  <Leaf className="h-4 w-4" />
                  Accompagnements
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
                    handleEdit(side)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Modifier
                </Button>
                
                {/* Bouton de disponibilité - COLORÉ et VISIBLE */}
                <Button
                  size="sm"
                  className={`flex-1 gap-2 font-semibold ${
                    side.available
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-700"
                      : "bg-red-600 hover:bg-red-700 text-white border-red-700"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleAvailability(side)
                  }}
                >
                  {side.available ? "Disponible" : "Indisponible"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucun accompagnement */}
      {filteredSides.length === 0 && (
        <div className="text-center py-12">
          <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? "Aucun accompagnement trouvé" : "Aucun accompagnement pour le moment"}
          </p>
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{sideToDelete?.name}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialogOpen(false)
                setSideToDelete(null)
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