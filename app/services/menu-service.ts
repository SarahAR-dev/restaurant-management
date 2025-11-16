import { db } from '@/lib/firebase-admin'

// ✅ Récupérer tous les plats
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

//  Récupérer toutes les boissons
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

// ✅ Récupérer tous les accompagnements
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


// ✅ Créer un plat
export async function createDish(data: any) {
  const docRef = await db.collection('dishes').add({
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    imageUrl: data.imageUrl || '',
    available: data.available !== undefined ? data.available : true,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  return { id: docRef.id, ...data }
}

// ✅ Mettre à jour un plat
export async function updateDish(id: string, data: any) {
  await db.collection('dishes').doc(id).update({
    ...data,
    updatedAt: new Date()
  })
  return { id, ...data }
}

// ✅ Supprimer un plat
export async function deleteDish(id: string) {
  await db.collection('dishes').doc(id).delete()
  return { id }
}

// ✅ Créer une boisson
export async function createDrink(data: any) {
  const docRef = await db.collection('drinks').add({
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    imageUrl: data.imageUrl || '',
    available: data.available !== undefined ? data.available : true,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  return { id: docRef.id, ...data }
}

// ✅Mettre à jour une boisson
export async function updateDrink(id: string, data: any) {
  await db.collection('drinks').doc(id).update({
    ...data,
    updatedAt: new Date()
  })
  return { id, ...data }
}

// ✅ Supprimer une boisson
export async function deleteDrink(id: string) {
  await db.collection('drinks').doc(id).delete()
  return { id }
}

// ✅ Créer un accompagnement
export async function createSide(data: any) {
  const docRef = await db.collection('sides').add({
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    imageUrl: data.imageUrl || '',
    available: data.available !== undefined ? data.available : true,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  return { id: docRef.id, ...data }
}

// ✅ Mettre à jour un accompagnement
export async function updateSide(id: string, data: any) {
  await db.collection('sides').doc(id).update({
    ...data,
    updatedAt: new Date()
  })
  return { id, ...data }
}

// ✅Supprimer un accompagnement
export async function deleteSide(id: string) {
  await db.collection('sides').doc(id).delete()
  return { id }
}

