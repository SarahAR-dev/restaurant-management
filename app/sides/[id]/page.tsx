"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Side {
  id: string
  name: string
  description: string
  price: number
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

export default function SideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  const router = useRouter()
  const [side, setSide] = useState<Side | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSideDetails()
    loadOrders()
  }, [id])

  const loadSideDetails = async () => {
    try {
      const response = await fetch("/api/sides")
      if (!response.ok) throw new Error("Erreur")
      const data = await response.json()
      const foundSide = data.find((s: Side) => s.id === id)
      setSide(foundSide || null)
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
    if (!side) return

    try {
      const updatedReviews = [...(side.reviews || []), review]
      
      const response = await fetch("/api/sides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: side.id,
          name: side.name,
          description: side.description,
          price: side.price,
          imageUrl: side.imageUrl,
          available: side.available,
          reviews: updatedReviews,
        }),
      })

      if (!response.ok) throw new Error("Erreur lors de l'ajout de l'avis")
      
      await loadSideDetails()
      alert("✅ Avis ajouté avec succès !")
    } catch (error) {
      console.error("Erreur:", error)
      alert("❌ Impossible d'ajouter l'avis")
    }
  }

  const handleDeleteReview = async (index: number) => {
    if (!side) return
    
    if (!confirm("Supprimer cet avis ?")) return

    try {
      const updatedReviews = side.reviews?.filter((_, i) => i !== index) || []
      
      const response = await fetch("/api/sides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: side.id,
          name: side.name,
          description: side.description,
          price: side.price,
          imageUrl: side.imageUrl,
          available: side.available,
          reviews: updatedReviews,
        }),
      })

      if (!response.ok) throw new Error("Erreur lors de la suppression de l'avis")
      
      await loadSideDetails()
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

  if (!side) {
    return (
      <div className="p-8">
        <p className="text-center">Accompagnement introuvable</p>
        <Button onClick={() => router.push("/sides")} className="mt-4">
          Retour aux accompagnements
        </Button>
      </div>
    )
  }

  // Filtrer les commandes contenant cet accompagnement
  const ordersWithThisSide = orders
    .filter(order => order.items.some(item => item.name === side.name))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Calculer les statistiques
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const todayOrders = ordersWithThisSide.filter(order => 
    new Date(order.createdAt).toISOString().split('T')[0] === today
  )

  const weekOrders = ordersWithThisSide.filter(order => 
    new Date(order.createdAt) >= weekAgo
  )

  const totalQuantity = ordersWithThisSide.reduce((sum, order) => {
    const item = order.items.find(i => i.name === side.name)
    return sum + (item?.quantity || 0)
  }, 0)

  const todayQuantity = todayOrders.reduce((sum, order) => {
    const item = order.items.find(i => i.name === side.name)
    return sum + (item?.quantity || 0)
  }, 0)

  const weekQuantity = weekOrders.reduce((sum, order) => {
    const item = order.items.find(i => i.name === side.name)
    return sum + (item?.quantity || 0)
  }, 0)

  const totalRevenue = totalQuantity * side.price
  const todayRevenue = todayQuantity * side.price
  const weekRevenue = weekQuantity * side.price

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
          onClick={() => router.push("/sides")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux accompagnements
        </Button>
      </div>

      {/* Carte principale */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="grid md:grid-cols-[300px_1fr] gap-6 p-6">
          {/* Image */}
          <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
            <img
              src={side.imageUrl || "/placeholder.svg"}
              alt={side.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <div className="absolute top-2 right-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  side.available
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {side.available ? "Disponible" : "Indisponible"}
              </span>
            </div>
          </div>

          {/* Informations */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{side.name}</h1>
              <p className="text-2xl font-semibold text-primary mt-2">
                {side.price.toFixed(2)} DA
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                🥗 Accompagnement
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{side.description}</p>
            </div>

            {/* Section : Avis des clients */}
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
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(!side.reviews || side.reviews.length === 0) ? (
                  <p className="text-sm text-muted-foreground italic">
                    Aucun avis pour le moment
                  </p>
                ) : (
                  side.reviews.map((review: string, index: number) => (
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
          🛒 Dernières commandes ({ordersWithThisSide.length > 5 ? '5' : ordersWithThisSide.length} plus récentes)
        </h2>
        {ordersWithThisSide.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucune commande contenant cet article
          </p>
        ) : (
          <div className="space-y-3">
            {ordersWithThisSide.map((order) => {
              const item = order.items.find(i => i.name === side.name)
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