import { NextResponse } from 'next/server'
import { getDishes, createDish, updateDish, deleteDish } from '@/app/services/menu-service'

// GET - Récupérer tous les plats
export async function GET() {
  try {
    const dishes = await getDishes()  // ← Utilise le service
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
    const result = await createDish(data)  // ← Utilise le service
    return NextResponse.json({ 
      ...result,
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

    const result = await updateDish(id, updateData)  // ← Utilise le service
    
    return NextResponse.json({ 
      ...result,
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
    const body = await request.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 })
    }

    await deleteDish(id)  // ← Utilise le service
    
    return NextResponse.json({ 
      success: true,
      message: 'Plat supprimé avec succès' 
    })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
