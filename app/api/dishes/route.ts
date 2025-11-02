import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

// GET - Récupérer tous les plats
export async function GET() {
  try {
    const snapshot = await db.collection('dishes').get()
    const dishes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return NextResponse.json(dishes)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouveau plat
export async function POST(request: Request) {
  try {
    const data = await request.json()
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
    return NextResponse.json({ 
      id: docRef.id, 
      ...data,
      message: 'Plat créé avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la création:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}

// PUT - Mettre à jour un plat
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    await db.collection('dishes').doc(id).update({
      ...updateData,
      updatedAt: new Date()
    })
    
    return NextResponse.json({ 
      id, 
      ...updateData,
      message: 'Plat mis à jour avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

// DELETE - Supprimer un plat
export async function DELETE(request: Request) {
  try {
    console.log("🔥 DELETE: Début de la fonction")
    
    const body = await request.json()
    console.log("🔥 DELETE: Body reçu:", body)
    
    const { id } = body
    console.log("🔥 DELETE: ID extrait:", id)
    
    if (!id) {
      console.log("🔥 DELETE: ID manquant!")
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    console.log("🔥 DELETE: Tentative de suppression du document:", id)
    await db.collection('dishes').doc(id).delete()
    
    console.log("🔥 DELETE: Document supprimé avec succès!")
    
    return NextResponse.json({ 
      success: true,
      message: 'Plat supprimé avec succès' 
    })
  } catch (error) {
    console.error('🔥 DELETE: Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
