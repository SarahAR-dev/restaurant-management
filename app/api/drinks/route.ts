import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

// GET - Récupérer toutes les boissons
export async function GET() {
  try {
    const snapshot = await db.collection('drinks').get()
    const drinks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return NextResponse.json(drinks)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle boisson
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const docRef = await db.collection('drinks').add({
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl || '',
      available: data.available !== undefined ? data.available : true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return NextResponse.json({ 
      id: docRef.id, 
      ...data,
      message: 'Boisson créée avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la création:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}

// PUT - Mettre à jour une boisson
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    await db.collection('drinks').doc(id).update({
      ...updateData,
      updatedAt: new Date()
    })
    
    return NextResponse.json({ 
      id, 
      ...updateData,
      message: 'Boisson mise à jour avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

// DELETE - Supprimer une boisson
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    await db.collection('drinks').doc(id).delete()
    
    return NextResponse.json({ 
      success: true,
      message: 'Boisson supprimée avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}