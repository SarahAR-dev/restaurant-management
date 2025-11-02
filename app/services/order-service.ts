import { db } from "@/lib/firebase-admin"
import type { Order } from "@/types/restaurant"

export const orderService = {
  // Récupérer toutes les commandes
  async getAllOrders(): Promise<Order[]> {
    try {
      // Récupérer sans orderBy (car createdAt n'existe pas sur tous les documents)
      const snapshot = await db.collection("orders").get()
      
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || null,
        updatedAt: doc.data().updatedAt?.toDate() || null,
      })) as Order[]
      
      // Trier en JavaScript par date décroissante (plus récent en premier)
      return orders.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0
        if (!a.createdAt) return 1
        if (!b.createdAt) return -1
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error)
      throw error
    }
  },

  // Récupérer une commande par ID
  async getOrderById(id: string): Promise<Order | null> {
    try {
      const doc = await db.collection("orders").doc(id).get()
      if (!doc.exists) return null
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate() || null,
        updatedAt: doc.data()?.updatedAt?.toDate() || null,
      } as Order
    } catch (error) {
      console.error("Erreur lors de la récupération de la commande:", error)
      throw error
    }
  },

  // Créer une nouvelle commande
  async createOrder(data: Omit<Order, "id" | "createdAt" | "updatedAt">) {
    try {
      const docRef = await db.collection("orders").add({
        ...data,
        createdAt: new Date(), // ✅ Ajout du timestamp
        updatedAt: new Date(),
      })
      return { id: docRef.id, ...data }
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error)
      throw error
    }
  },

  // Mettre à jour le statut d'une commande
  async updateOrderStatus(id: string, status: Order["status"]) {
    try {
      await db.collection("orders").doc(id).update({
        status,
        updatedAt: new Date(),
      })
      return { id, status }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
      throw error
    }
  },

  // Mettre à jour une commande complète
  async updateOrder(id: string, data: Partial<Order>) {
    try {
      await db
        .collection("orders")
        .doc(id)
        .update({
          ...data,
          updatedAt: new Date(),
        })
      return { id, ...data }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la commande:", error)
      throw error
    }
  },

  // Récupérer les commandes par statut
  async getOrdersByStatus(status: Order["status"]): Promise<Order[]> {
    try {
      const snapshot = await db.collection("orders").where("status", "==", status).get()
      
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || null,
        updatedAt: doc.data().updatedAt?.toDate() || null,
      })) as Order[]
      
      // Trier par date
      return orders.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0
        if (!a.createdAt) return 1
        if (!b.createdAt) return -1
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
    } catch (error) {
      console.error(`Erreur lors de la récupération des commandes (${status}):`, error)
      throw error
    }
  },

  // Supprimer une commande
  async deleteOrder(id: string) {
    try {
      await db.collection("orders").doc(id).delete()
      return { id }
    } catch (error) {
      console.error("Erreur lors de la suppression de la commande:", error)
      throw error
    }
  },
}