import { NextResponse } from 'next/server';
import { getDishes, getDrinks, getSides } from '@/app/services/menu-service';

// ✅ CORS Headers pour Vapi
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ✅ OPTIONS pour CORS preflight
export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders });
}


    
export async function POST(req: Request) {
  try {
    // Vérifier la clé privée Vapi
    /*const authHeader = req.headers.get('authorization');
    const expectedKey = process.env.VAPI_PRIVATE_KEY;

    if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
      console.error('❌ Clé Vapi invalide pour getMenu');
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401, headers: corsHeaders }
      );
    }*/
    console.log('📋 Récupération du menu depuis Firebase...');

    const [dishes, drinks, sides] = await Promise.all([
      getDishes(),
      getDrinks(),
      getSides(),
    ]);

    const availableDishes = dishes.filter((d: any) => d.available);
    const availableDrinks = drinks.filter((d: any) => d.available);
    const availableSides = sides.filter((d: any) => d.available);

    console.log('✅ Menu récupéré:', {
      plats: availableDishes.length,
      boissons: availableDrinks.length,
      accompagnements: availableSides.length
    });

    const menuText = `MENU COMPLET DU RESTAURANT:

PLATS PRINCIPAUX:
${availableDishes.map((d: any) => `- ${d.name}: ${d.price} DA (${d.preparationTime || 15} min)`).join('\n')}

BOISSONS:
${availableDrinks.map((d: any) => `- ${d.name}: ${d.price} DA (${d.preparationTime || 2} min)`).join('\n')}

ACCOMPAGNEMENTS:
${availableSides.map((d: any) => `- ${d.name}: ${d.price} DA (${d.preparationTime || 10} min)`).join('\n')}`;

    // ✅ RETOUR SIMPLE POUR VAPI
    return NextResponse.json(
      menuText,
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('❌ Erreur:', error);
    return NextResponse.json(
      'Erreur lors de la récupération du menu',
      { status: 500, headers: corsHeaders }
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
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('❌ Erreur:', error);
    return NextResponse.json({ 
      error: 'Erreur', 
      details: error instanceof Error ? error.message : 'Unknown' 
    }, { status: 500, headers: corsHeaders });
  }
}