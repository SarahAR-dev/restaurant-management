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
    let body;
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    
    console.log('📥 Body reçu de Vapi:', JSON.stringify(body, null, 2));
    
    // ✅ CORRECTION: toolCallId est dans toolCallList[0].id
    const toolCallId = body.message?.toolCallList?.[0]?.id || 
                       body.message?.toolCallId || 
                       'getMenu';
    
    console.log('📋 Tool Call ID extrait:', toolCallId);

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

    const response = {
      results: [
        {
          toolCallId: toolCallId,
          result: menuText
        }
      ]
    };
    
    console.log('📤 Réponse:', JSON.stringify(response).substring(0, 300) + '...');

    return NextResponse.json(response, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Erreur:', error);
    
    return NextResponse.json({
      results: [
        {
          toolCallId: 'getMenu',
          result: 'Désolé, impossible de récupérer le menu.'
        }
      ]
    }, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}

// ✅ GET - Pour tester manuellement dans le navigateur
export async function GET(req: Request) {
  try {
    console.log('📋 TEST GET - Récupération du menu...');

    const [dishes, drinks, sides] = await Promise.all([
      getDishes(),
      getDrinks(),
      getSides(),
    ]);

    const availableDishes = dishes.filter((d: any) => d.available);
    const availableDrinks = drinks.filter((d: any) => d.available);
    const availableSides = sides.filter((d: any) => d.available);

    const menuText = `MENU COMPLET DU RESTAURANT:

PLATS PRINCIPAUX:
${availableDishes.map((d: any) => `- ${d.name}: ${d.price} DA (${d.preparationTime || 15} min)`).join('\n')}

BOISSONS:
${availableDrinks.map((d: any) => `- ${d.name}: ${d.price} DA (${d.preparationTime || 2} min)`).join('\n')}

ACCOMPAGNEMENTS:
${availableSides.map((d: any) => `- ${d.name}: ${d.price} DA (${d.preparationTime || 10} min)`).join('\n')}`;

    return NextResponse.json({
      success: true,
      menu: menuText,
      itemCount: {
        dishes: availableDishes.length,
        drinks: availableDrinks.length,
        sides: availableSides.length
      },
      rawData: {
        dishes: availableDishes,
        drinks: availableDrinks,
        sides: availableSides
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Erreur GET:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération du menu',
      details: error instanceof Error ? error.message : 'Unknown' 
    }, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}