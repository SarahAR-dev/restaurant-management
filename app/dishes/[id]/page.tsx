"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Dish {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  available: boolean
  reviews?: string[]
}

interface Order {
  id: string
  customerName: string
  items: { name: string; quantity: number }[]
  createdAt: string
}

export default function DishDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // UNWRAP params avec React.use()
  const { id } = use(params)
  
  const router = useRouter()
  const [dish, setDish] = useState<Dish | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDishDetails()
    loadOrders()
  }, [id])

  const loadDishDetails = async () => {
    try {
      const response = await fetch("/api/dishes")
      if (!response.ok) throw new Error("Erreur")
      const data = await response.json()
      const foundDish = data.find((d: Dish) => d.id === id)
      setDish(foundDish || null)
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (!response.ok) throw new Error("Erreur")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const handleAddReview = async (review: string) => {
    if (!dish) return

    try {
      const updatedReviews = [...(dish.reviews || []), review]
      
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
          reviews: updatedReviews,
        }),
      })

      if (!response.ok) throw new Error("Erreur lors de l'ajout de l'avis")
      
      // Recharger les données
      await loadDishDetails()
      alert("✅ Avis ajouté avec succès !")
    } catch (error) {
      console.error("Erreur:", error)
      alert("❌ Impossible d'ajouter l'avis")
    }
  }

  const handleDeleteReview = async (index: number) => {
    if (!dish) return
    
    if (!confirm("Supprimer cet avis ?")) return

    try {
      const updatedReviews = dish.reviews?.filter((_, i) => i !== index) || []
      
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
          reviews: updatedReviews,
        }),
      })

      if (!response.ok) throw new Error("Erreur lors de la suppression de l'avis")
      
      // Recharger les données
      await loadDishDetails()
      alert("✅ Avis supprimé !")
    } catch (error) {
      console.error("Erreur:", error)
      alert("❌ Impossible de supprimer l'avis")
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-center">Chargement...</p>
      </div>
    )
  }

  if (!dish) {
    return (
      <div className="p-8">
        <p className="text-center">Plat introuvable</p>
        <Button onClick={() => router.push("/dishes")} className="mt-4">
          Retour aux plats
        </Button>
      </div>
    )
  }

  // Filtrer les commandes contenant ce plat
  const ordersWithThisDish = orders
    .filter(order => order.items.some(item => item.name === dish.name))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Calculer les statistiques
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const todayOrders = ordersWithThisDish.filter(order => 
    new Date(order.createdAt).toISOString().split('T')[0] === today
  )

  const weekOrders = ordersWithThisDish.filter(order => 
    new Date(order.createdAt) >= weekAgo
  )

  const totalQuantity = ordersWithThisDish.reduce((sum, order) => {
    const item = order.items.find(i => i.name === dish.name)
    return sum + (item?.quantity || 0)
  }, 0)

  const todayQuantity = todayOrders.reduce((sum, order) => {
    const item = order.items.find(i => i.name === dish.name)
    return sum + (item?.quantity || 0)
  }, 0)

  const weekQuantity = weekOrders.reduce((sum, order) => {
    const item = order.items.find(i => i.name === dish.name)
    return sum + (item?.quantity || 0)
  }, 0)

  const totalRevenue = totalQuantity * dish.price
  const todayRevenue = todayQuantity * dish.price
  const weekRevenue = weekQuantity * dish.price

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/dishes")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux plats
        </Button>
      </div>

      {/* Carte principale */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="grid md:grid-cols-[400px_1fr] gap-6 p-6">
          {/* Image - PLUS PETITE */}
          <div className="relative h-84 bg-muted rounded-lg overflow-hidden">
            <img
              src={dish.imageUrl || "/placeholder.svg"}
              alt={dish.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <div className="absolute top-2 right-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  dish.available
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {dish.available ? "Disponible" : "Indisponible"}
              </span>
            </div>
          </div>

          {/* Informations */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{dish.name}</h1>
              <p className="text-2xl font-semibold text-primary mt-2">
                {dish.price.toFixed(2)} DA
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                🍽️ {dish.category || 'Plat'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{dish.description}</p>
            </div>

            {/* NOUVELLE SECTION : Avis des clients */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  💬 Avis des clients
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs bg-white"
                  onClick={() => {
                    const newReview = prompt("Nouvel avis client :", "")
                    if (newReview && newReview.trim()) {
                      handleAddReview(newReview.trim())
                    }
                  }}
                >
                  ➕ Ajouter un avis
                </Button>
              </div>
              
              {/* Liste des avis */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(!dish.reviews || dish.reviews.length === 0) ? (
                  <p className="text-sm text-muted-foreground italic">
                    Aucun avis pour le moment
                  </p>
                ) : (
                  dish.reviews.map((review: string, index: number) => (
                    <div 
                      key={index} 
                      className="bg-white rounded p-2 text-sm flex items-start justify-between gap-2"
                    >
                      <p className="flex-1">• {review}</p>
                      <button
                        onClick={() => handleDeleteReview(index)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Statistiques de vente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Aujourd'hui */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Aujourd'hui</p>
            <p className="text-2xl font-bold">{todayQuantity} vendus</p>
            <p className="text-sm text-green-600 font-semibold">
              {todayRevenue.toFixed(2)} DA
            </p>
          </div>

          {/* Cette semaine */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Cette semaine</p>
            <p className="text-2xl font-bold">{weekQuantity} vendus</p>
            <p className="text-sm text-green-600 font-semibold">
              {weekRevenue.toFixed(2)} DA
            </p>
          </div>

          {/* Total */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold">{totalQuantity} vendus</p>
            <p className="text-sm text-green-600 font-semibold">
              {totalRevenue.toFixed(2)} DA
            </p>
          </div>
        </div>
      </div>

      {/* Dernières commandes */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">
          🛒 Dernières commandes ({ordersWithThisDish.length > 5 ? '5' : ordersWithThisDish.length} plus récentes)
        </h2>
        {ordersWithThisDish.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucune commande contenant cet article
          </p>
        ) : (
          <div className="space-y-3">
            {ordersWithThisDish.map((order) => {
              const item = order.items.find(i => i.name === dish.name)
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-semibold">
                      #{order.id.substring(0, 8)}
                    </span>
                    <span className="text-sm">{order.customerName || 'Client'}</span>
                    <span className="text-sm font-semibold text-primary">
                      {item?.quantity}x
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(order.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}