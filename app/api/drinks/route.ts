import { NextResponse } from 'next/server'
import { getDrinks, createDrink, updateDrink, deleteDrink } from '@/app/services/menu-service'

// GET - Récupérer toutes les boissons
export async function GET() {
  try {
    const drinks = await getDrinks()  // ← Utilise le service
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
    const result = await createDrink(data)  // ← Utilise le service
    return NextResponse.json({ 
      ...result,
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

    const result = await updateDrink(id, updateData)  // ← Utilise le service
    
    return NextResponse.json({ 
      ...result,
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
    const body = await request.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    await deleteDrink(id)  // ← Utilise le service
    
    return NextResponse.json({ 
      success: true,
      message: 'Boisson supprimée avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}