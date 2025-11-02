import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

// GET - Récupérer toutes les commandes
export async function GET() {
  try {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get()
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString()
    }))
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle commande
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validation selon le type de commande
    if (data.orderType === 'dine-in' && !data.tableNumber) {
      return NextResponse.json({ error: 'Numéro de table obligatoire pour manger sur place' }, { status: 400 })
    }
    if (data.orderType === 'takeaway' && !data.customerName) {
      return NextResponse.json({ error: 'Nom du client obligatoire pour à emporter' }, { status: 400 })
    }
    if (data.orderType === 'takeaway' && !data.customerPhone) {
      return NextResponse.json({ error: 'Téléphone du client obligatoire pour à emporter' }, { status: 400 })
    }
    
    const docRef = await db.collection('orders').add({
      orderType: data.orderType, // 'dine-in' ou 'takeaway'
      customerName: data.customerName || '',
      customerPhone: data.customerPhone || '',
      items: data.items,
      totalPrice: data.totalPrice,
      status: data.status || 'pending',
      tableNumber: data.tableNumber || null,
      notes: data.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return NextResponse.json({ 
      id: docRef.id, 
      ...data,
      message: 'Commande créée avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la création:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}

// PUT - Mettre à jour une commande (changer le statut)
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    await db.collection('orders').doc(id).update({
      ...updateData,
      updatedAt: new Date()
    })
    
    return NextResponse.json({ 
      id, 
      ...updateData,
      message: 'Commande mise à jour avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

// DELETE - Supprimer une commande
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    await db.collection('orders').doc(id).delete()
    
    return NextResponse.json({ 
      success: true,
      message: 'Commande supprimée avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}