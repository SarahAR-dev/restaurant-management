import { NextResponse } from 'next/server';
import { getDishes, getDrinks, getSides } from '@/app/services/menu-service';

export async function POST(req: Request) {
  try {
    // Vérifier la clé privée Vapi
    const authHeader = req.headers.get('authorization');
    const expectedKey = process.env.VAPI_PRIVATE_KEY;

    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
      console.error('❌ Clé Vapi invalide pour getMenu');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📋 Récupération du menu depuis Firebase...');

    // Récupérer tous les articles depuis Firebase en parallèle
    const [dishes, drinks, sides] = await Promise.all([
      getDishes(),
      getDrinks(),
      getSides(),
    ]);

    // Filtrer uniquement les articles DISPONIBLES
    const availableDishes = dishes.filter((d: any) => d.available);
    const availableDrinks = drinks.filter((d: any) => d.available);
    const availableSides = sides.filter((d: any) => d.available);

    console.log('✅ Menu récupéré:', {
      plats: availableDishes.length,
      boissons: availableDrinks.length,
      accompagnements: availableSides.length
    });

    // Formater le menu en texte lisible pour l'IA Vapi
    const menuText = `
MENU COMPLET DU RESTAURANT:

PLATS PRINCIPAUX:
${availableDishes.length > 0 
  ? availableDishes.map((d: any) => `- ${d.name}: ${d.price} DA`).join('\n')
  : '(Aucun plat disponible)'
}

BOISSONS:
${availableDrinks.length > 0
  ? availableDrinks.map((d: any) => `- ${d.name}: ${d.price} DA`).join('\n')
  : '(Aucune boisson disponible)'
}

ACCOMPAGNEMENTS:
${availableSides.length > 0
  ? availableSides.map((d: any) => `- ${d.name}: ${d.price} DA`).join('\n')
  : '(Aucun accompagnement disponible)'
}

RÈGLES IMPORTANTES:
- Tu ne peux proposer QUE ces articles
- JAMAIS inventer ou suggérer des plats non listés
- Toujours annoncer le prix en Dinars Algériens (DA)
- Si un client demande quelque chose qui n'existe pas, propose une alternative de cette liste
    `.trim();

    // Retourner le menu à Vapi
    return NextResponse.json({
      success: true,
      menu: menuText,
      itemCount: {
        dishes: availableDishes.length,
        drinks: availableDrinks.length,
        sides: availableSides.length,
        total: availableDishes.length + availableDrinks.length + availableSides.length
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du menu:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du menu',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
// ✅ GET pour tester (sans authentification)
export async function GET(req: Request) {
  try {
    console.log('📋 TEST - Récupération du menu...');

    const [dishes, drinks, sides] = await Promise.all([
      getDishes(),
      getDrinks(),
      getSides(),
    ]);

    const availableDishes = dishes.filter((d: any) => d.available);
    const availableDrinks = drinks.filter((d: any) => d.available);
    const availableSides = sides.filter((d: any) => d.available);

    return NextResponse.json({
      success: true,
      dishes: availableDishes,
      drinks: availableDrinks,
      sides: availableSides,
      total: availableDishes.length + availableDrinks.length + availableSides.length
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    return NextResponse.json({ 
      error: 'Erreur', 
      details: error instanceof Error ? error.message : 'Unknown' 
    }, { status: 500 });
  }
}