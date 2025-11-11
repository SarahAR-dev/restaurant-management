import { NextResponse } from 'next/server'
import { orderService } from '@/app/services/order-service'

// GET - Récupérer toutes les commandes
export async function GET() {
  try {
    const orders = await orderService.getAllOrders()
    
    // Convertir les dates pour le JSON (si nécessaire)
    const ordersWithFormattedDates = orders.map(order => ({
      ...order,
      createdAt: order.createdAt?.toISOString() || null,
      updatedAt: order.updatedAt?.toISOString() || null,
    }))
    
    return NextResponse.json(ordersWithFormattedDates)
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle commande
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // ✅ Validations selon le type de commande
    if (data.orderType === 'dine-in' && !data.tableNumber) {
      return NextResponse.json(
        { error: 'Numéro de table obligatoire pour manger sur place' }, 
        { status: 400 }
      )
    }
    
    if (data.orderType === 'takeaway') {
      if (!data.customerName) {
        return NextResponse.json(
          { error: 'Nom du client obligatoire pour à emporter' }, 
          { status: 400 }
        )
      }
      if (!data.customerPhone) {
        return NextResponse.json(
          { error: 'Téléphone du client obligatoire pour à emporter' }, 
          { status: 400 }
        )
      }
    }
    
    // ✅ Validation des items
    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un article est requis' }, 
        { status: 400 }
      )
    }
    
    // ✅ Utilise le service pour créer la commande
    const newOrder = await orderService.createOrder({
      orderType: data.orderType,
      customerName: data.customerName || '',
      customerPhone: data.customerPhone || '',
      items: data.items,
      total: data.totalPrice,
      status: data.status || 'pending',
      tableNumber: data.tableNumber || undefined,
      notes: data.notes || '',
    })
    
    return NextResponse.json({ 
      ...newOrder,
      message: 'Commande créée avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création' }, 
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une commande
export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    // ✅ Validation de l'ID
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    
    // ✅ Vérifier que la commande existe
    const existingOrder = await orderService.getOrderById(id)
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande introuvable' }, 
        { status: 404 }
      )
    }
    
    // ✅ Utilise le service pour mettre à jour
    const updatedOrder = await orderService.updateOrder(id, {
      orderType: updateData.orderType,
      customerName: updateData.customerName,
      customerPhone: updateData.customerPhone,
      items: updateData.items,
      total: updateData.totalPrice,
      status: updateData.status,
      tableNumber: updateData.tableNumber,
      notes: updateData.notes,
    })
    
    return NextResponse.json({ 
      ...updatedOrder,
      message: 'Commande mise à jour avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' }, 
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une commande
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    
    // ✅ Validation de l'ID
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }
    
    // ✅ Vérifier que la commande existe
    const existingOrder = await orderService.getOrderById(id)
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Commande introuvable' }, 
        { status: 404 }
      )
    }
    
    // ✅ Utilise le service pour supprimer
    await orderService.deleteOrder(id)
    
    return NextResponse.json({ 
      success: true,
      message: 'Commande supprimée avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' }, 
      { status: 500 }
    )
  }
}