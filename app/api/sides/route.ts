import { NextResponse } from 'next/server'
import { getSides, createSide, updateSide, deleteSide } from '@/app/services/menu-service'

// GET - Récupérer tous les accompagnements
export async function GET() {
  try {
    const sides = await getSides()  // ← Utilise le service
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
    const result = await createSide(data)  // ← Utilise le service
    return NextResponse.json({ 
      ...result,
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

    const result = await updateSide(id, updateData)  // ← Utilise le service
    
    return NextResponse.json({ 
      ...result,
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
    const body = await request.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    await deleteSide(id)  // ← Utilise le service
    
    return NextResponse.json({ 
      success: true,
      message: 'Accompagnement supprimé avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}