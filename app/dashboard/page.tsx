"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Package, DollarSign, Clock } from "lucide-react"
import { VoiceOrderButton } from '@/components/ui/VoiceOrderButton';
interface Order {
  id: string
  orderType: "dine-in" | "takeaway"
  customerName: string
  items: { name: string; price: number; quantity: number }[]
  totalPrice: number
  status: "pending" | "preparing" | "ready" | "completed"
  createdAt: string
}

interface MenuItem {
  id: string
  name: string
  price: number
  available: boolean
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [dishes, setDishes] = useState<MenuItem[]>([])
  const [drinks, setDrinks] = useState<MenuItem[]>([])
  const [sides, setSides] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Charger toutes les données en parallèle
      const [ordersRes, dishesRes, drinksRes, sidesRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/dishes"),
        fetch("/api/drinks"),
        fetch("/api/sides"),
      ])

      const ordersData = await ordersRes.json()
      const dishesData = await dishesRes.json()
      const drinksData = await drinksRes.json()
      const sidesData = await sidesRes.json()

      setOrders(ordersData)
      setDishes(dishesData)
      setDrinks(drinksData)
      setSides(sidesData)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculer les statistiques
  const today = new Date().toISOString().split('T')[0]
  
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
    return orderDate === today
  })

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0)

  const allItems = [...dishes, ...drinks, ...sides]
  const availableItemsCount = allItems.filter(item => item.available).length
  const unavailableItemsCount = allItems.filter(item => !item.available).length

  const ongoingOrders = orders.filter(order => 
    order.status === "pending" || order.status === "preparing" || order.status === "ready"
  )
  const readyOrders = orders.filter(order => order.status === "ready")

  // Commandes récentes (3 dernières)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  // Articles populaires
  const itemStats: { [key: string]: { count: number; revenue: number } } = {}
  
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!itemStats[item.name]) {
        itemStats[item.name] = { count: 0, revenue: 0 }
      }
      itemStats[item.name].count += item.quantity
      itemStats[item.name].revenue += item.price * item.quantity
    })
  })

  const popularItems = Object.entries(itemStats)
    .map(([name, stats]) => ({
      name,
      commands: stats.count,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.commands - a.commands)
    .slice(0, 3)

  // Calculer le pourcentage de croissance (simulé pour aujourd'hui vs hier)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayDate = yesterday.toISOString().split('T')[0]
  
  const yesterdayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
    return orderDate === yesterdayDate
  })

  const orderGrowth = yesterdayOrders.length > 0 
    ? Math.round(((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100)
    : 0

  const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.totalPrice, 0)
  const revenueGrowth = yesterdayRevenue > 0
    ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
    : 0

  const statusLabels = {
    pending: "En attente",
    preparing: "En préparation",
    ready: "Prêt",
    completed: "Livré",
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-center text-muted-foreground">Chargement du tableau de bord...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold">Tableau de bord</h1>
    <p className="text-muted-foreground">Vue d'ensemble de votre restaurant</p>
  </div>
  <VoiceOrderButton assistantId="ed53a860-9424-48ab-84fe-f3f36e7f6cad" />
</div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Commandes aujourd'hui */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Commandes aujourd'hui</h3>
            <ShoppingCart className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{todayOrders.length}</div>
          <p className={`text-xs mt-1 ${orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {orderGrowth >= 0 ? '+' : ''}{orderGrowth}%
          </p>
        </div>

        {/* Articles disponibles */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Articles disponibles</h3>
            <Package className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold">{availableItemsCount}</div>
          <p className="text-xs text-gray-500 mt-1">{unavailableItemsCount} indisponibles</p>
        </div>

        {/* Revenu du jour */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Revenu du jour</h3>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold">{todayRevenue.toFixed(2)} DA</div>
          <p className={`text-xs mt-1 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%
          </p>
        </div>

        {/* Commandes en cours */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Commandes en cours</h3>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{ongoingOrders.length}</div>
          <p className="text-xs text-gray-500 mt-1">{readyOrders.length} prêtes</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Commandes récentes */}
<div className="rounded-lg border border-gray-200 bg-white p-6">
  <h2 className="text-lg font-bold mb-4">Commandes récentes</h2>
  {recentOrders.length === 0 ? (
    <p className="text-sm text-gray-500">Aucune commande récente</p>
  ) : (
    <div className="space-y-4">
      {recentOrders.map((order) => (
        <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
          <div>
            <p className="font-semibold">{order.customerName || 'Client'}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{order.totalPrice.toFixed(2)} DA</p>
            <p className="text-xs text-gray-500">{statusLabels[order.status]}</p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

        {/* Articles populaires */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold mb-4">Articles populaires</h2>
          {popularItems.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-4">
              {popularItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.commands} commandes</p>
                  </div>
                  <p className="font-semibold">{item.revenue.toFixed(2)} DA</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}