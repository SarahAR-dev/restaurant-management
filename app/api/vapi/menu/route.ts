import { NextResponse } from 'next/server';
import { getDishes, getDrinks, getSides } from '@/app/services/menu-service';
import { getSettings, type RestaurantSettings } from '@/app/services/settings-service';

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

    const [dishes, drinks, sides, settings] = await Promise.all([
      getDishes(),
      getDrinks(),
      getSides(),
      getSettings(),
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

TEMPS DE PRÉPARATION:
- Sur place (dine-in): ${settings.pickupTime} minutes
- À emporter (takeaway): ${settings.pickupTime + settings.deliveryTime} minutes

PLATS PRINCIPAUX:
${availableDishes.map((d: any) => `- ${d.name}: ${d.price} DA`).join('\n')}

BOISSONS:
${availableDrinks.map((d: any) => `- ${d.name}: ${d.price} DA`).join('\n')}

ACCOMPAGNEMENTS:
${availableSides.map((d: any) => `- ${d.name}: ${d.price} DA`).join('\n')}`;

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

// ✅ GET - Format Vapi propre (identique à POST)
export async function GET(req: Request) {
  try {
    console.log('📋 TEST GET - Récupération du menu...');

    const [dishes, drinks, sides, settings] = await Promise.all([
      getDishes(),
      getDrinks(),
      getSides(),
      getSettings(),
    ]);

    const availableDishes = dishes.filter((d: any) => d.available);
    const availableDrinks = drinks.filter((d: any) => d.available);
    const availableSides = sides.filter((d: any) => d.available);

    const menuText = `MENU COMPLET DU RESTAURANT:

TEMPS DE PRÉPARATION:
- Sur place (dine-in): ${settings.pickupTime} minutes
- À emporter (takeaway): ${settings.pickupTime + settings.deliveryTime} minutes

PLATS PRINCIPAUX:
${availableDishes.map((d: any) => `- ${d.name}: ${d.price} DA`).join('\n')}

BOISSONS:
${availableDrinks.map((d: any) => `- ${d.name}: ${d.price} DA`).join('\n')}

ACCOMPAGNEMENTS:
${availableSides.map((d: any) => `- ${d.name}: ${d.price} DA`).join('\n')}`;

    // ✅ FORMAT VAPI EXACT (comme dans la doc)
    return NextResponse.json({
      results: [
        {
          toolCallId: "getMenu",
          result: menuText
        }
      ]
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Erreur GET:', error);
    
    return NextResponse.json({
      results: [
        {
          toolCallId: "getMenu",
          result: "Erreur lors de la récupération du menu"
        }
      ]
    }, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}