import { db } from '@/lib/firebase-admin'

// Fonction pour récupérer tous les plats (dishes)
export async function getDishes() {
  try {
    const snapshot = await db.collection('dishes').get()
    const dishes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return dishes
  } catch (error) {
    console.error('Erreur lors de la récupération des plats:', error)
    return []
  }
}

// Fonction pour récupérer toutes les boissons (drinks)
export async function getDrinks() {
  try {
    const snapshot = await db.collection('drinks').get()
    const drinks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return drinks
  } catch (error) {
    console.error('Erreur lors de la récupération des boissons:', error)
    return []
  }
}

// Fonction pour récupérer tous les accompagnements (sides)
export async function getSides() {
  try {
    const snapshot = await db.collection('sides').get()
    const sides = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return sides
  } catch (error) {
    console.error('Erreur lors de la récupération des accompagnements:', error)
    return []
  }
}
