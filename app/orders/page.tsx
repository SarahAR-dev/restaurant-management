"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { VoiceOrderButton } from '@/components/ui/VoiceOrderButton'
import { Search, SlidersHorizontal, ChevronDown, Trash2, Eye, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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


interface OrderItem {
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  orderType: "dine-in" | "takeaway"
  customerName: string
  customerPhone?: string
  items: OrderItem[]
  totalPrice: number
  status: "pending" | "preparing" | "ready" | "completed"
  tableNumber?: number
  notes?: string
  createdAt: string
}

interface MenuItem {
  id: string
  name: string
  price: number
  category?: string
}

const statusConfig = {
  pending: { label: "En attente", color: "bg-orange-50 text-orange-700 border-orange-200" },
  preparing: { label: "En préparation", color: "bg-blue-50 text-blue-700 border-blue-200" },
  ready: { label: "Prêt", color: "bg-green-50 text-green-700 border-green-200" },
  completed: { label: "Livré", color: "bg-gray-50 text-gray-700 border-gray-200" },
}

export default function OrdersPage() {
  const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || ''
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Menu items disponibles
  const [availableItems, setAvailableItems] = useState<MenuItem[]>([])
  
  // Formulaire de création
  const [formData, setFormData] = useState({
    orderType: "dine-in" as "dine-in" | "takeaway",
    customerName: "",
    customerPhone: "",
    tableNumber: "",
    notes: "",
    items: [] as OrderItem[],
  })

  // Filtres pour chaque ligne d'article
  const [itemFilters, setItemFilters] = useState<{
    category: string
    search: string
  }[]>([])

  useEffect(() => {
    loadOrders()
    loadMenuItems()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/orders")
      if (!response.ok) throw new Error("Erreur lors du chargement des commandes")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Erreur:", error)
      alert("Impossible de charger les commandes")
    } finally {
      setLoading(false)
    }
  }

  const loadMenuItems = async () => {
    try {
      // Charger plats, boissons et accompagnements
      const [dishesRes, drinksRes, sidesRes] = await Promise.all([
        fetch("/api/dishes"),
        fetch("/api/drinks"),
        fetch("/api/sides"),
      ])

      const dishes = await dishesRes.json()
      const drinks = await drinksRes.json()
      const sides = await sidesRes.json()

      // Combiner tous les articles disponibles
      const allItems: MenuItem[] = [
        ...dishes.filter((d: any) => d.available).map((d: any) => ({ 
          id: d.id, 
          name: d.name, 
          price: d.price,
          category: "Plat"
        })),
        ...drinks.filter((d: any) => d.available).map((d: any) => ({ 
          id: d.id, 
          name: d.name, 
          price: d.price,
          category: "Boisson"
        })),
        ...sides.filter((s: any) => s.available).map((s: any) => ({ 
          id: s.id, 
          name: s.name, 
          price: s.price,
          category: "Accompagnement"
        })),
      ]

      setAvailableItems(allItems)
    } catch (error) {
      console.error("Erreur lors du chargement du menu:", error)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  const handleCreateOrder = async (e: React.FormEvent) => {
  e.preventDefault()

  // Empêcher les soumissions multiples
  if (isSubmitting) {
    return
  }

  // Validation type de commande
  if (formData.orderType === "dine-in" && !formData.tableNumber) {
    alert("❌ Le numéro de table est obligatoire pour manger sur place")
    return
  }
  if (formData.orderType === "takeaway" && !formData.customerName) {
    alert("❌ Le nom du client est obligatoire pour à emporter")
    return
  }
  if (formData.orderType === "takeaway" && !formData.customerPhone) {
    alert("❌ Le téléphone du client est obligatoire pour à emporter")
    return
  }

  // Validation articles
  if (formData.items.length === 0) {
    alert("❌ Veuillez ajouter au moins un article à la commande")
    return
  }

  // Validation que chaque article est complet
  for (let i = 0; i < formData.items.length; i++) {
    const item = formData.items[i]
    if (!item.name || item.name === "") {
      alert(`❌ L'article n°${i + 1} : Veuillez sélectionner un article`)
      return
    }
    if (!item.price || item.price <= 0) {
      alert(`❌ L'article n°${i + 1} : Prix invalide`)
      return
    }
    if (!item.quantity || item.quantity <= 0) {
      alert(`❌ L'article n°${i + 1} : La quantité doit être supérieure à 0`)
      return
    }
  }

  const totalPrice = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Validation du total
  if (totalPrice <= 0) {
    alert("❌ Le total de la commande doit être supérieur à 0 DA")
    return
  }

  // BLOQUER LE BOUTON ⬇️
  setIsSubmitting(true)

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderType: formData.orderType,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        tableNumber: formData.tableNumber ? parseInt(formData.tableNumber) : null,
        items: formData.items,
        totalPrice,
        notes: formData.notes,
        status: "pending",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      alert("❌ " + (error.error || "Erreur lors de la création"))
      setIsSubmitting(false) // DÉBLOQUER si erreur
      return
    }

    await loadOrders()
    setIsCreateDialogOpen(false)
    resetForm()
    alert("✅ Commande créée avec succès !")
  } catch (error) {
    console.error("Erreur:", error)
    alert("❌ Une erreur est survenue lors de la création de la commande")
  } finally {
    // DÉBLOQUER LE BOUTON ⬇️
    setIsSubmitting(false)
  }
}

  const resetForm = () => {
    setFormData({
      orderType: "dine-in",
      customerName: "",
      customerPhone: "",
      tableNumber: "",
      notes: "",
      items: [],
    })
    setItemFilters([])
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", price: 0, quantity: 1 }]
    })
    setItemFilters([...itemFilters, { category: "", search: "" }])
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
    setItemFilters(itemFilters.filter((_, i) => i !== index))
  }

  const updateItemSelection = (index: number, itemId: string) => {
    const selectedItem = availableItems.find(item => item.id === itemId)
    if (selectedItem) {
      const newItems = [...formData.items]
      newItems[index] = { 
        name: selectedItem.name, 
        price: selectedItem.price, 
        quantity: newItems[index].quantity || 1 
      }
      setFormData({ ...formData, items: newItems })
    }
  }

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], quantity }
    setFormData({ ...formData, items: newItems })
  }

  const updateOrderStatus = async (id: string, newStatus: Order["status"]) => {
    try {
      const order = orders.find(o => o.id === id)
      if (!order) return

      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          orderType: order.orderType,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          items: order.items,
          totalPrice: order.totalPrice,
          status: newStatus,
          tableNumber: order.tableNumber,
          notes: order.notes,
        }),
      })
      if (!response.ok) throw new Error("Erreur lors de la mise à jour")
      await loadOrders()
    } catch (error) {
      console.error("Erreur:", error)
      alert("Impossible de mettre à jour le statut")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return

    try {
      const response = await fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      await loadOrders()
    } catch (error) {
      console.error("Erreur:", error)
      alert("Impossible de supprimer la commande")
    }
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    ready: orders.filter(o => o.status === "ready").length,
    completed: orders.filter(o => o.status === "completed").length,
    revenue: orders.reduce((sum, o) => sum + o.totalPrice,0 ),
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-center text-muted-foreground">Chargement des commandes...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Commandes</h1>
          <p className="text-muted-foreground">Gérez et suivez toutes vos commandes</p>
        </div>
          <VoiceOrderButton assistantId={VAPI_ASSISTANT_ID} />
        <div className="flex gap-2">
          
        <Dialog 
  open={isCreateDialogOpen} 
  onOpenChange={(open) => {
    if (!isSubmitting) {
      setIsCreateDialogOpen(open)
    }
  }}
>
          <DialogTrigger>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle commande
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateOrder}>
              <DialogHeader>
                <DialogTitle>Nouvelle commande</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle commande pour un client
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Type de commande */}
                <div className="grid gap-2">
                  <Label htmlFor="orderType">Type de commande</Label>
                  <Select
                    value={formData.orderType}
                    onValueChange={(value: "dine-in" | "takeaway") => {
                      setFormData({ ...formData, orderType: value })
                    }}
                  >
                    <SelectTrigger id="orderType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dine-in">Manger sur place</SelectItem>
                      <SelectItem value="takeaway">À emporter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Numéro de table (obligatoire pour dine-in) */}
                {formData.orderType === "dine-in" && (
                  <div className="grid gap-2">
                    <Label htmlFor="tableNumber">Numéro de table *</Label>
                    <Input
                      id="tableNumber"
                      type="number"
                      value={formData.tableNumber}
                      onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                      placeholder="Ex: 5"
                      required
                    />
                  </div>
                )}

                {/* Nom client (obligatoire pour takeaway) */}
                <div className="grid gap-2">
                  <Label htmlFor="customerName">
                    Nom du client {formData.orderType === "takeaway" && "*"}
                  </Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Ex: Ahmed Benali"
                    required={formData.orderType === "takeaway"}
                  />
                </div>

                {/* Téléphone (obligatoire pour takeaway) */}
                <div className="grid gap-2">
                  <Label htmlFor="customerPhone">
                    Téléphone {formData.orderType === "takeaway" && "*"}
                  </Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="Ex: 0555123456"
                    required={formData.orderType === "takeaway"}
                  />
                </div>

                {/* Articles */}
<div className="grid gap-2">
  <Label>Articles</Label>
  {formData.items.map((item, index) => {
    const currentFilter = itemFilters[index] || { category: "", search: "" }
    
    const filteredItemsByCategory = availableItems.filter(menuItem => {
      if (!currentFilter.category) return false
      const matchesCategory = menuItem.category === currentFilter.category
      const matchesSearch = currentFilter.search 
        ? menuItem.name?.toLowerCase().includes(currentFilter.search.toLowerCase())
        : true
      return matchesCategory && matchesSearch
    })
    
    return (
      <div key={index} className="border rounded-lg p-3 space-y-3 bg-muted/20">
        {/* Sélection de la catégorie */}
        <div className="grid gap-2">
          <Label className="text-xs text-muted-foreground">Catégorie</Label>
          <Select
            value={currentFilter.category}
            onValueChange={(value) => {
              const newFilters = [...itemFilters]
              newFilters[index] = { category: value, search: "" }
              setItemFilters(newFilters)
              // Réinitialiser l'article sélectionné
              const newItems = [...formData.items]
              newItems[index] = { name: "", price: 0, quantity: 1 }
              setFormData({ ...formData, items: newItems })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Plat">🍽️ Plat</SelectItem>
              <SelectItem value="Boisson">🥤 Boisson</SelectItem>
              <SelectItem value="Accompagnement">🥗 Accompagnement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Recherche + Sélection (uniquement si catégorie choisie) */}
        {currentFilter.category && (
          <div className="space-y-2">
            {/* Barre de recherche */}
            <div className="grid gap-2">
              <Label className="text-xs text-muted-foreground">Rechercher dans {currentFilter.category}s</Label>
              <Input
                placeholder={`Rechercher un ${currentFilter.category.toLowerCase()}...`}
                value={currentFilter.search}
                onChange={(e) => {
                  const newFilters = [...itemFilters]
                  newFilters[index] = { ...newFilters[index], search: e.target.value }
                  setItemFilters(newFilters)
                }}
              />
            </div>
            
            {/* Sélection article + Quantité */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Article *</Label>
                <Select
                  value={item.name ? availableItems.find(m => m.name === item.name)?.id : ""}
                  onValueChange={(value) => updateItemSelection(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un article" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredItemsByCategory.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Aucun article trouvé
                      </div>
                    ) : (
                      filteredItemsByCategory.map((menuItem) => (
                        <SelectItem key={menuItem.id} value={menuItem.id}>
                          {menuItem.name} - {(menuItem.price || 0).toFixed(2)} DA
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-24">
                <Label className="text-xs text-muted-foreground">Quantité *</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={item.quantity}
                  onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                  min="1"
                  required
                />
              </div>
              
              {item.price > 0 && (
                <div className="w-28 text-sm font-semibold flex items-center justify-end">
                  {((item.price || 0) * (item.quantity || 0)).toFixed(2)} DA
                </div>
              )}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  })}
  <Button type="button" variant="outline" onClick={addItem} className="mt-2">
    <Plus className="h-4 w-4 mr-2" />
    Ajouter un article
  </Button>
</div>

                {/* Notes */}
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ex: Sans piment"
                  />
                </div>

                {/* Total */}
                {formData.items.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>
                        {formData.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0).toFixed(2)} DA
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
  <Button 
    type="button" 
    variant="outline" 
    onClick={() => setIsCreateDialogOpen(false)}
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
        Création en cours...
      </>
    ) : (
      "Créer la commande"
    )}
  </Button>
</DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-orange-50 p-4">
          <p className="text-sm text-orange-700">En attente</p>
          <p className="text-2xl font-bold text-orange-700">{stats.pending}</p>
        </div>
        <div className="rounded-lg border bg-blue-50 p-4">
          <p className="text-sm text-blue-700">En préparation</p>
          <p className="text-2xl font-bold text-blue-700">{stats.preparing}</p>
        </div>
        <div className="rounded-lg border bg-green-50 p-4">
          <p className="text-sm text-green-700">Prêt</p>
          <p className="text-2xl font-bold text-green-700">{stats.ready}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Revenu total</p>
          <p className="text-2xl font-bold">{(stats.revenue || 0).toFixed(2)} DA</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-48 h-9 px-3 py-2 border border-input rounded-md bg-transparent text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="preparing">En préparation</option>
              <option value="ready">Prêt</option>
              <option value="completed">Livré</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Client</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Table</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Articles</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date & Heure</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Statut</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    order.orderType === "dine-in" 
                      ? "bg-purple-100 text-purple-700" 
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {order.orderType === "dine-in" ? "Sur place" : "À emporter"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-foreground">{order.customerName || '-'}</div>
                  {order.customerPhone && (
                    <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {order.tableNumber ? `Table ${order.tableNumber}` : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {order.items?.map(item => `${item.name} x${item.quantity}`).join(", ").substring(0, 40)}...
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-foreground">
                  {(order.totalPrice || 0).toFixed(2)} DA
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {formatDate(order.createdAt)}
                  <br />
                  {formatTime(order.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="relative w-40">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                      className={`appearance-none w-full h-9 px-3 py-2 border rounded-md text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring ${statusConfig[order.status].color}`}
                    >
                      <option value="pending">En attente</option>
                      <option value="preparing">En préparation</option>
                      <option value="ready">Prêt</option>
                      <option value="completed">Livré</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(order.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune commande trouvée</p>
        </div>
      )}

      {/* Dialog Détails de la commande */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>
              Commande du {selectedOrder && formatDate(selectedOrder.createdAt)} à {selectedOrder && formatTime(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold">Type de commande</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.orderType === "dine-in" ? "Manger sur place" : "À emporter"}
                </p>
              </div>
              {selectedOrder.customerName && (
                <div>
                  <p className="text-sm font-semibold">Client</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerName}</p>
                  {selectedOrder.customerPhone && (
                    <p className="text-sm text-muted-foreground">{selectedOrder.customerPhone}</p>
                  )}
                </div>
              )}
              {selectedOrder.tableNumber && (
                <div>
                  <p className="text-sm font-semibold">Table</p>
                  <p className="text-sm text-muted-foreground">Table {selectedOrder.tableNumber}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold mb-2">Articles</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">{((item.price || 0) * (item.quantity || 0)).toFixed(2)} DA</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedOrder.notes && (
                <div>
                  <p className="text-sm font-semibold">Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}
              <div className="pt-4 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{(selectedOrder.totalPrice || 0).toFixed(2)} DA</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}