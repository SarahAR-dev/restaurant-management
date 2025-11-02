import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

// GET - Récupérer tous les accompagnements
export async function GET() {
  try {
    const snapshot = await db.collection('sides').get()
    const sides = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    return NextResponse.json(sides)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouvel accompagnement
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const docRef = await db.collection('sides').add({
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
      message: 'Accompagnement créé avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la création:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}

// PUT - Mettre à jour un accompagnement
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    await db.collection('sides').doc(id).update({
      ...updateData,
      updatedAt: new Date()
    })
    
    return NextResponse.json({ 
      id, 
      ...updateData,
      message: 'Accompagnement mis à jour avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

// DELETE - Supprimer un accompagnement
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    await db.collection('sides').doc(id).delete()
    
    return NextResponse.json({ 
      success: true,
      message: 'Accompagnement supprimé avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}